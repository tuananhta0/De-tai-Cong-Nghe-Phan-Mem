#pragma once
#include "../database/Database.hpp"
#include "../utils/JsonArrayUtil.hpp"
#include "../utils/SecurityUtil.hpp"
#include <string>
#include <vector>

// ============================================================================
//  BookingModel.hpp
//  Ghế theo suất chiếu (ShowtimeSeats), khóa giữ chỗ, xác nhận thanh toán,
//  và Booking đầy đủ field "snapshot" để khớp Booking type của frontend.
// ============================================================================

struct SeatEntity {
    int showtimeSeatId = 0;
    std::string seatName;   // "A1"
    std::string seatType;   // Thường | VIP | Sweetbox
    std::string status;     // Available | Holding | Booked
};

struct ComboLineItem {
    std::string id;
    std::string name;
    double price = 0;
    int quantity = 1;
};

struct BookingEntity {
    std::string id;
    std::string movieTitle;
    std::string moviePoster;
    std::string cinemaName;
    std::string showDate;
    std::string showTime;
    std::string room;
    std::string format;
    std::vector<std::string> seats;
    double totalAmount = 0;
    std::string paymentMethod;
    std::string code;
    std::string qrCodeUrl;
    std::string bookingTime;
    std::string userEmail;
    bool isCheckedIn = false;
    bool isComboRedeemed = false;
    std::vector<ComboLineItem> combos;
};

class BookingModel {
public:
    std::vector<SeatEntity> getSeatsByShowtime(int showtimeId) {
        std::vector<SeatEntity> seats;
        DbConnection conn;
        if (!conn.connected) return seats;

        // Tự động "thả" các ghế đang Holding nhưng đã quá hạn giữ chỗ (10 phút)
        // mà khách chưa thanh toán xong, trả lại trạng thái Available cho người
        // khác có thể chọn. Chạy trước mỗi lần đọc để dữ liệu trả về luôn mới nhất.
        {
            DbStatement releaseStmt(conn);
            releaseStmt.bindInt(showtimeId);
            releaseStmt.execute(
                L"UPDATE dbo.ShowtimeSeats SET Status = 'Available', HoldExpiresAt = NULL "
                L"WHERE ShowtimeID = ? AND Status = 'Holding' AND HoldExpiresAt < GETDATE()",
                "BookingModel::getSeatsByShowtime/releaseExpiredHolds"
            );
        }

        DbStatement stmt(conn);
        stmt.bindInt(showtimeId);
        std::wstring sql =
            L"SELECT ss.ShowtimeSeatID, s.RowLabel, s.SeatNumber, s.SeatType, ss.Status "
            L"FROM dbo.ShowtimeSeats ss JOIN dbo.Seats s ON ss.SeatID = s.SeatID "
            L"WHERE ss.ShowtimeID = ? ORDER BY s.RowLabel, s.SeatNumber";

        if (stmt.execute(sql, "BookingModel::getSeatsByShowtime/select")) {
            while (SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
                SeatEntity s;
                s.showtimeSeatId = (int)DbRead::getInt(stmt.hstmt, 1);
                std::string row   = DbRead::getUtf8String(stmt.hstmt, 2);
                // CHAR(n) trong SQL Server tự pad khoảng trắng bên phải ("A " thay vì "A").
                // Trim trailing spaces để seatName luôn là "A1" thay vì "A 1".
                while (!row.empty() && row.back() == ' ') row.pop_back();
                int seatNum        = (int)DbRead::getInt(stmt.hstmt, 3);
                s.seatName        = row + std::to_string(seatNum);
                s.seatType        = DbRead::getUtf8String(stmt.hstmt, 4);
                s.status          = DbRead::getUtf8String(stmt.hstmt, 5);
                seats.push_back(s);
            }
        }
        return seats;
    }

    // Giữ ghế 10 phút (chống 2 người đặt trùng 1 ghế cùng lúc)
    bool tryLockSeat(int showtimeSeatId) {
        DbConnection conn;
        if (!conn.connected) return false;

        DbStatement stmt(conn);
        stmt.bindInt(showtimeSeatId);
        std::wstring sql =
            L"UPDATE dbo.ShowtimeSeats SET Status = 'Holding', HoldExpiresAt = DATEADD(minute, 10, GETDATE()) "
            L"WHERE ShowtimeSeatID = ? AND Status = 'Available'";

        if (!stmt.execute(sql, "BookingModel::tryLockSeat")) return false;
        return stmt.rowCount() > 0;
    }

    // Lấy ShowtimeSeatID tương ứng với 1 tên ghế ("A1") trong 1 suất chiếu cụ thể,
    // dùng khi frontend gửi tên ghế thay vì ID nội bộ.
    int findShowtimeSeatId(int showtimeId, const std::string& seatName) {
        DbConnection conn;
        if (!conn.connected) return 0;

        // Tách "A1" -> chữ cái đầu là RowLabel ("A"), phần số còn lại là SeatNumber (1)
        std::string letters, digits;
        for (char c : seatName) {
            if (isdigit((unsigned char)c)) digits += c;
            else letters += c;
        }
        if (digits.empty()) return 0;
        int seatNumber = std::stoi(digits);

        DbStatement stmt(conn);
        stmt.bindInt(showtimeId);
        stmt.bindNString(toW(letters));
        stmt.bindInt(seatNumber);
        std::wstring sql =
            L"SELECT ss.ShowtimeSeatID FROM dbo.ShowtimeSeats ss JOIN dbo.Seats s ON ss.SeatID = s.SeatID "
            L"WHERE ss.ShowtimeID = ? AND s.RowLabel = ? AND s.SeatNumber = ?";

        if (stmt.execute(sql) && SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
            return (int)DbRead::getInt(stmt.hstmt, 1);
        }
        return 0;
    }

    // Tạo booking đầy đủ (theo Booking type của frontend) + đánh dấu các ghế đã Booked.
    // Combo đi kèm (id, name, price, quantity) đã được điền sẵn trong b.combos bởi Controller.
    bool createBooking(const BookingEntity& b, int showtimeId, const std::vector<int>& showtimeSeatIds,
                        std::string& outCode) {
        DbConnection conn;
        if (!conn.connected) return false;

        // 1. Đánh dấu toàn bộ ghế đã chọn -> Booked
        for (int ssId : showtimeSeatIds) {
            DbStatement upd(conn);
            upd.bindInt(ssId);
            upd.execute(L"UPDATE dbo.ShowtimeSeats SET Status = 'Booked' WHERE ShowtimeSeatID = ?");
        }

        // 2. Sinh mã vé duy nhất
        std::string code = b.code.empty() ? SecurityUtil::generateBookingCode() : b.code;

        // 3. Tìm UserID theo email (Bookings gốc yêu cầu UserID NOT NULL FK).
        //    Nếu khách không đăng nhập, dùng tài khoản đầu tiên trong hệ thống làm fallback.
        int userId = 0;
        if (!b.userEmail.empty()) {
            DbStatement findUser(conn);
            findUser.bindString(toLowerStr(b.userEmail));
            if (findUser.execute(L"SELECT TOP 1 UserID FROM dbo.Users WHERE LOWER(Email) = ?") &&
                SQL_SUCCEEDED(SQLFetch(findUser.hstmt))) {
                userId = (int)DbRead::getInt(findUser.hstmt, 1);
            }
        }
        if (userId == 0) {
            DbStatement findGuest(conn);
            if (findGuest.execute(L"SELECT TOP 1 UserID FROM dbo.Users ORDER BY UserID") &&
                SQL_SUCCEEDED(SQLFetch(findGuest.hstmt))) {
                userId = (int)DbRead::getInt(findGuest.hstmt, 1);
            }
        }
        if (userId == 0) return false;

        // 4. Insert Booking (đầy đủ field snapshot)
        std::string transId = SecurityUtil::generateTransactionId();

        DbStatement stmt(conn);
        stmt.bindInt(userId);
        stmt.bindDouble(b.totalAmount);
        stmt.bindString(b.paymentMethod);
        stmt.bindString(transId);
        stmt.bindString(code);
        stmt.bindNString(toW(b.movieTitle));
        stmt.bindString(b.moviePoster);
        stmt.bindNString(toW(b.cinemaName));
        stmt.bindString(b.showDate);
        stmt.bindString(b.showTime);
        stmt.bindNString(toW(b.room));
        stmt.bindNString(toW(b.format));
        stmt.bindNString(toW(JsonArrayUtil::toJsonArray(b.seats)));
        stmt.bindString(b.qrCodeUrl);
        stmt.bindNString(toW(combosToJson(b.combos)));

        std::wstring sql =
            L"INSERT INTO dbo.Bookings "
            L"(UserID, TotalAmount, PaymentStatus, PaymentMethod, TransactionID, Code, "
            L"MovieTitle, MoviePoster, CinemaName, ShowDate, ShowTime, Room, Format, SeatsJson, QrCodeUrl, CombosJson) "
            L"VALUES (?, ?, 'Completed', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        if (!stmt.execute(sql)) return false;

        outCode = code;

        // 5. Cộng điểm thưởng (5% giá trị đơn hàng) nếu có email khách hàng
        if (!b.userEmail.empty()) {
            int addedPoints = (int)(b.totalAmount * 0.05);
            DbStatement pointsStmt(conn);
            pointsStmt.bindInt(addedPoints);
            pointsStmt.bindString(toLowerStr(b.userEmail));
            pointsStmt.execute(L"UPDATE dbo.Users SET Points = Points + ? WHERE LOWER(Email) = ?");
        }

        return true;
    }

    bool setCheckedIn(const std::string& code, bool isCheckedIn) {
        DbConnection conn;
        if (!conn.connected) return false;

        DbStatement stmt(conn);
        stmt.bindBit(isCheckedIn);
        stmt.bindString(code);
        if (!stmt.execute(L"UPDATE dbo.Bookings SET IsCheckedIn = ? WHERE Code = ?")) return false;
        return stmt.rowCount() > 0;
    }

    bool setComboRedeemed(const std::string& code, bool isComboRedeemed) {
        DbConnection conn;
        if (!conn.connected) return false;

        DbStatement stmt(conn);
        stmt.bindBit(isComboRedeemed);
        stmt.bindString(code);
        if (!stmt.execute(L"UPDATE dbo.Bookings SET IsComboRedeemed = ? WHERE Code = ?")) return false;
        return stmt.rowCount() > 0;
    }

    std::vector<BookingEntity> getBookingsByEmail(const std::string& email) {
        std::vector<BookingEntity> list;
        DbConnection conn;
        if (!conn.connected) return list;

        DbStatement stmt(conn);
        stmt.bindString(toLowerStr(email));
        std::wstring sql =
            L"SELECT B.Code, ISNULL(B.MovieTitle,''), ISNULL(B.MoviePoster,''), ISNULL(B.CinemaName,''), "
            L"ISNULL(B.ShowDate,''), ISNULL(B.ShowTime,''), ISNULL(B.Room,''), ISNULL(B.Format,''), "
            L"ISNULL(B.SeatsJson,'[]'), B.TotalAmount, ISNULL(B.PaymentMethod,''), "
            L"ISNULL(B.QrCodeUrl,''), CONVERT(VARCHAR, B.BookingDate, 126), B.IsCheckedIn, B.IsComboRedeemed, "
            L"ISNULL(B.CombosJson,'[]'), ISNULL(U.Email,'') "
            L"FROM dbo.Bookings B JOIN dbo.Users U ON B.UserID = U.UserID "
            L"WHERE LOWER(U.Email) = ? ORDER BY B.BookingDate DESC";

        if (stmt.execute(sql)) {
            while (SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
                BookingEntity b;
                b.code            = DbRead::getUtf8String(stmt.hstmt, 1);
                b.id              = b.code;
                b.movieTitle      = DbRead::getUtf8String(stmt.hstmt, 2);
                b.moviePoster     = DbRead::getUtf8String(stmt.hstmt, 3);
                b.cinemaName      = DbRead::getUtf8String(stmt.hstmt, 4);
                b.showDate        = DbRead::getUtf8String(stmt.hstmt, 5);
                b.showTime        = DbRead::getUtf8String(stmt.hstmt, 6);
                b.room            = DbRead::getUtf8String(stmt.hstmt, 7);
                b.format          = DbRead::getUtf8String(stmt.hstmt, 8);
                b.seats           = JsonArrayUtil::parseStringArray(DbRead::getUtf8String(stmt.hstmt, 9));
                b.totalAmount     = DbRead::getDouble(stmt.hstmt, 10);
                b.paymentMethod   = DbRead::getUtf8String(stmt.hstmt, 11);
                b.qrCodeUrl       = DbRead::getUtf8String(stmt.hstmt, 12);
                b.bookingTime     = DbRead::getUtf8String(stmt.hstmt, 13);
                b.isCheckedIn     = DbRead::getBit(stmt.hstmt, 14);
                b.isComboRedeemed = DbRead::getBit(stmt.hstmt, 15);
                b.combos          = parseCombosJson(DbRead::getUtf8String(stmt.hstmt, 16));
                b.userEmail       = DbRead::getUtf8String(stmt.hstmt, 17); // col 17 = U.Email
                list.push_back(b);
            }
        }
        return list;
    }

    // Admin/Employee xem toàn bộ booking (không lọc theo email)
    std::vector<BookingEntity> getAllBookings() {
        std::vector<BookingEntity> list;
        DbConnection conn;
        if (!conn.connected) return list;

        DbStatement stmt(conn);
        std::wstring sql =
            L"SELECT B.Code, ISNULL(B.MovieTitle,''), ISNULL(B.MoviePoster,''), ISNULL(B.CinemaName,''), "
            L"ISNULL(B.ShowDate,''), ISNULL(B.ShowTime,''), ISNULL(B.Room,''), ISNULL(B.Format,''), "
            L"ISNULL(B.SeatsJson,'[]'), B.TotalAmount, ISNULL(B.PaymentMethod,''), "
            L"ISNULL(B.QrCodeUrl,''), CONVERT(VARCHAR, B.BookingDate, 126), B.IsCheckedIn, B.IsComboRedeemed, "
            L"ISNULL(B.CombosJson,'[]'), ISNULL(U.Email,'') "
            L"FROM dbo.Bookings B LEFT JOIN dbo.Users U ON B.UserID = U.UserID "
            L"ORDER BY B.BookingDate DESC";

        if (stmt.execute(sql)) {
            while (SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
                BookingEntity b;
                b.code            = DbRead::getUtf8String(stmt.hstmt, 1);
                b.id              = b.code;
                b.movieTitle      = DbRead::getUtf8String(stmt.hstmt, 2);
                b.moviePoster     = DbRead::getUtf8String(stmt.hstmt, 3);
                b.cinemaName      = DbRead::getUtf8String(stmt.hstmt, 4);
                b.showDate        = DbRead::getUtf8String(stmt.hstmt, 5);
                b.showTime        = DbRead::getUtf8String(stmt.hstmt, 6);
                b.room            = DbRead::getUtf8String(stmt.hstmt, 7);
                b.format          = DbRead::getUtf8String(stmt.hstmt, 8);
                b.seats           = JsonArrayUtil::parseStringArray(DbRead::getUtf8String(stmt.hstmt, 9));
                b.totalAmount     = DbRead::getDouble(stmt.hstmt, 10);
                b.paymentMethod   = DbRead::getUtf8String(stmt.hstmt, 11);
                b.qrCodeUrl       = DbRead::getUtf8String(stmt.hstmt, 12);
                b.bookingTime     = DbRead::getUtf8String(stmt.hstmt, 13);
                b.isCheckedIn     = DbRead::getBit(stmt.hstmt, 14);
                b.isComboRedeemed = DbRead::getBit(stmt.hstmt, 15);
                b.combos          = parseCombosJson(DbRead::getUtf8String(stmt.hstmt, 16));
                b.userEmail       = DbRead::getUtf8String(stmt.hstmt, 17); // col 17 = U.Email
                list.push_back(b);
            }
        }
        return list;
    }

    double getRevenue() {
        double revenue = 0.0;
        DbConnection conn;
        if (!conn.connected) return revenue;

        DbStatement stmt(conn);
        std::wstring sql = L"SELECT ISNULL(SUM(TotalAmount), 0.0) FROM dbo.Bookings WHERE PaymentStatus = 'Completed'";
        if (stmt.execute(sql) && SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
            revenue = DbRead::getDouble(stmt.hstmt, 1);
        }
        return revenue;
    }

private:
    static std::wstring toW(const std::string& utf8) {
        if (utf8.empty()) return L"";
        int sizeNeeded = MultiByteToWideChar(CP_UTF8, 0, utf8.c_str(), (int)utf8.size(), NULL, 0);
        std::wstring result(sizeNeeded, 0);
        MultiByteToWideChar(CP_UTF8, 0, utf8.c_str(), (int)utf8.size(), &result[0], sizeNeeded);
        return result;
    }

    static std::string toLowerStr(const std::string& s) {
        std::string r = s;
        for (auto& c : r) c = (char)tolower((unsigned char)c);
        return r;
    }

    static std::string combosToJson(const std::vector<ComboLineItem>& combos) {
        crow::json::wvalue arr = crow::json::wvalue::list();
        for (size_t i = 0; i < combos.size(); ++i) {
            arr[i]["id"] = combos[i].id;
            arr[i]["name"] = combos[i].name;
            arr[i]["price"] = combos[i].price;
            arr[i]["quantity"] = combos[i].quantity;
        }
        return arr.dump();
    }

    static std::vector<ComboLineItem> parseCombosJson(const std::string& jsonText) {
        std::vector<ComboLineItem> result;
        if (jsonText.empty()) return result;
        auto parsed = crow::json::load(jsonText);
        if (!parsed || parsed.t() != crow::json::type::List) return result;
        for (const auto& item : parsed) {
            ComboLineItem c;
            c.id = item.has("id") ? item["id"].s() : std::string("");
            c.name = item.has("name") ? item["name"].s() : std::string("");
            c.price = item.has("price") ? item["price"].d() : 0;
            c.quantity = item.has("quantity") ? item["quantity"].i() : 1;
            result.push_back(c);
        }
        return result;
    }
};

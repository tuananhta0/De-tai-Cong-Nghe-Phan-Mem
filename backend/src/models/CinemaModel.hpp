#pragma once
#include "../database/Database.hpp"
#include <string>
#include <vector>

// ============================================================================
//  CinemaModel.hpp
//  Quản lý Cụm rạp (Cinemas) và Suất chiếu (Showtimes) đúng theo Type
//  Cinema / Showtime của frontend TCD.
// ============================================================================

struct CinemaEntity {
    int id = 0;
    std::string name;
    std::string address;
    std::string phone;
    std::string imageUrl;
    std::string mapEmbed;
};

struct ShowtimeEntity {
    int id = 0;
    int movieId = 0;
    int cinemaId = 0;
    std::string date;       // dd/mm/yyyy khi trả ra ngoài (model trả yyyy-mm-dd, Controller format lại)
    std::string time;       // hh:mm
    std::string room;
    std::string format;     // 2D Phụ đề | 3D Phụ đề | IMAX 3D | 2D lồng tiếng
    double priceStandard = 0;
    double priceVIP = 0;
    double priceDouble = 0;
};

class CinemaModel {
public:
    // ---------------- CINEMAS ----------------

    std::vector<CinemaEntity> getAllCinemas() {
        std::vector<CinemaEntity> list;
        DbConnection conn;
        if (!conn.connected) return list;

        DbStatement stmt(conn);
        std::wstring sql =
            L"SELECT CinemaID, CinemaName, Address, ISNULL(Phone,''), ISNULL(ImageURL,''), ISNULL(MapEmbed,'') "
            L"FROM dbo.Cinemas ORDER BY CinemaID";

        if (stmt.execute(sql)) {
            while (SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
                CinemaEntity c;
                c.id        = (int)DbRead::getInt(stmt.hstmt, 1);
                c.name      = DbRead::getUtf8String(stmt.hstmt, 2);
                c.address   = DbRead::getUtf8String(stmt.hstmt, 3);
                c.phone     = DbRead::getUtf8String(stmt.hstmt, 4);
                c.imageUrl  = DbRead::getUtf8String(stmt.hstmt, 5);
                c.mapEmbed  = DbRead::getUtf8String(stmt.hstmt, 6);
                list.push_back(c);
            }
        }
        return list;
    }

    // ---------------- SHOWTIMES ----------------

    std::vector<ShowtimeEntity> getAllShowtimes() {
        std::vector<ShowtimeEntity> list;
        DbConnection conn;
        if (!conn.connected) return list;

        DbStatement stmt(conn);
        std::wstring sql =
            L"SELECT s.ShowtimeID, s.MovieID, h.CinemaID, "
            L"CONVERT(VARCHAR, s.StartTime, 23), CONVERT(VARCHAR, s.StartTime, 108), "
            L"h.HallName, s.Format, s.PriceStandard, s.PriceVIP, s.PriceDouble "
            L"FROM dbo.Showtimes s "
            L"JOIN dbo.CinemaHalls h ON s.HallID = h.HallID "
            L"ORDER BY s.StartTime";

        if (stmt.execute(sql)) {
            while (SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
                ShowtimeEntity s;
                s.id            = (int)DbRead::getInt(stmt.hstmt, 1);
                s.movieId       = (int)DbRead::getInt(stmt.hstmt, 2);
                s.cinemaId      = (int)DbRead::getInt(stmt.hstmt, 3);
                s.date          = DbRead::getUtf8String(stmt.hstmt, 4);
                s.time          = DbRead::getUtf8String(stmt.hstmt, 5);
                s.room          = DbRead::getUtf8String(stmt.hstmt, 6);
                s.format        = DbRead::getUtf8String(stmt.hstmt, 7);
                s.priceStandard = DbRead::getDouble(stmt.hstmt, 8);
                s.priceVIP      = DbRead::getDouble(stmt.hstmt, 9);
                s.priceDouble   = DbRead::getDouble(stmt.hstmt, 10);
                list.push_back(s);
            }
        }
        return list;
    }

    std::vector<ShowtimeEntity> getShowtimesByMovie(int movieId) {
        std::vector<ShowtimeEntity> list;
        DbConnection conn;
        if (!conn.connected) return list;

        DbStatement stmt(conn);
        stmt.bindInt(movieId);
        std::wstring sql =
            L"SELECT s.ShowtimeID, s.MovieID, h.CinemaID, "
            L"CONVERT(VARCHAR, s.StartTime, 23), CONVERT(VARCHAR, s.StartTime, 108), "
            L"h.HallName, s.Format, s.PriceStandard, s.PriceVIP, s.PriceDouble "
            L"FROM dbo.Showtimes s "
            L"JOIN dbo.CinemaHalls h ON s.HallID = h.HallID "
            L"WHERE s.MovieID = ? ORDER BY s.StartTime";

        if (stmt.execute(sql)) {
            while (SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
                ShowtimeEntity s;
                s.id            = (int)DbRead::getInt(stmt.hstmt, 1);
                s.movieId       = (int)DbRead::getInt(stmt.hstmt, 2);
                s.cinemaId      = (int)DbRead::getInt(stmt.hstmt, 3);
                s.date          = DbRead::getUtf8String(stmt.hstmt, 4);
                s.time          = DbRead::getUtf8String(stmt.hstmt, 5);
                s.room          = DbRead::getUtf8String(stmt.hstmt, 6);
                s.format        = DbRead::getUtf8String(stmt.hstmt, 7);
                s.priceStandard = DbRead::getDouble(stmt.hstmt, 8);
                s.priceVIP      = DbRead::getDouble(stmt.hstmt, 9);
                s.priceDouble   = DbRead::getDouble(stmt.hstmt, 10);
                list.push_back(s);
            }
        }
        return list;
    }

    // Thêm suất chiếu mới. Cần HallID có sẵn (lấy phòng đầu tiên thuộc CinemaID
    // được truyền vào) - đơn giản hóa vì frontend Admin chỉ chọn rạp + giờ.
    bool addShowtime(int movieId, int cinemaId, const std::string& startTimeIso,
                      const std::string& format, double priceStandard, double priceVIP,
                      double priceDouble, int& outNewId, const std::string& hallName = "") {
        std::cerr << "[addShowtime] ===> BAT DAU: movieId=" << movieId << " cinemaId=" << cinemaId
                  << " hallName='" << hallName << "' startTime=" << startTimeIso << "\n";
        DbConnection conn;
        if (!conn.connected) {
            std::cerr << "[addShowtime] LOI: khong ket noi duoc DB!\n";
            return false;
        }

        // Lấy HallID theo tên phòng (hallName) nếu có, fallback TOP 1
        int hallId = 0;
        if (!hallName.empty()) {
            // Convert hallName UTF-8 -> wstring để query NVARCHAR
            int wlen = MultiByteToWideChar(CP_UTF8, 0, hallName.c_str(), -1, NULL, 0);
            std::wstring wHallName(wlen > 0 ? wlen - 1 : 0, L'\0');
            if (wlen > 1) MultiByteToWideChar(CP_UTF8, 0, hallName.c_str(), -1, &wHallName[0], wlen);

            DbStatement findHall(conn);
            findHall.bindInt(cinemaId);
            findHall.bindNString(wHallName);
            std::wstring q = L"SELECT TOP 1 HallID FROM dbo.CinemaHalls WHERE CinemaID = ? AND HallName = ? AND IsActive = 1";
            if (findHall.execute(q) && SQL_SUCCEEDED(SQLFetch(findHall.hstmt))) {
                hallId = (int)DbRead::getInt(findHall.hstmt, 1);
            }
        }
        // Fallback: lấy phòng đầu tiên nếu không tìm được theo tên
        if (hallId == 0) {
            DbStatement findHall(conn);
            findHall.bindInt(cinemaId);
            std::wstring q = L"SELECT TOP 1 HallID FROM dbo.CinemaHalls WHERE CinemaID = ? AND IsActive = 1";
            if (findHall.execute(q) && SQL_SUCCEEDED(SQLFetch(findHall.hstmt))) {
                hallId = (int)DbRead::getInt(findHall.hstmt, 1);
            }
        }
        if (hallId == 0) {
            std::cerr << "[addShowtime] LOI: khong tim duoc HallID nao cho cinemaId=" << cinemaId << "\n";
            return false;
        }
        std::cerr << "[addShowtime] Da resolve hallId=" << hallId << "\n";

        // QUAN TRỌNG - NGUYÊN NHÂN GỐC THẬT SỰ (đã xác nhận bằng lỗi thật từ SQL
        // Server): bảng dbo.Showtimes có TRIGGER "trg_Showtimes_NoOverlap" (AFTER
        // INSERT, UPDATE - chống trùng giờ chiếu). SQL Server CẤM dùng "OUTPUT ..."
        // (không có INTO) trên bảng đang có trigger cùng loại thao tác (lỗi Msg
        // 334: "The target table ... cannot have any enabled triggers if the
        // statement contains an OUTPUT clause without INTO clause"). Đây là lý do
        // "OUTPUT INSERTED.ShowtimeID" trực tiếp bị execute() thất bại ngay lập
        // tức. Cách khắc phục đúng chuẩn: dùng "OUTPUT ... INTO" một bảng biến tạm
        // (@Inserted) - cách này được phép ngay cả khi bảng có trigger - rồi SELECT
        // lại từ bảng biến đó. Toàn bộ vẫn gói trong 1 batch/1 lần SQLExecDirectW
        // duy nhất; vì 2 statement đầu (DECLARE, INSERT...OUTPUT INTO) không trả
        // resultset nào cho client (kết quả OUTPUT đi thẳng vào bảng biến, không
        // lộ ra ngoài), driver ODBC tự động đưa "kết quả hiện hành" tới thẳng
        // SELECT cuối cùng, SQLFetch() gọi ngay sau execute() là lấy được.
        outNewId = 0;
        {
            DbStatement stmt(conn);
            stmt.bindInt(movieId);
            stmt.bindInt(hallId);
            stmt.bindString(startTimeIso);       // startTime: ASCII datetime, bindString OK
            stmt.bindNStringFromUtf8(format);    // format: tiếng Việt ("2D Phụ đề"...), cần NVARCHAR
            stmt.bindDouble(priceStandard);
            stmt.bindDouble(priceVIP);
            stmt.bindDouble(priceDouble);

            std::wstring insertSql =
                L"DECLARE @Inserted TABLE (ShowtimeID INT); "
                L"INSERT INTO dbo.Showtimes (MovieID, HallID, StartTime, Format, PriceStandard, PriceVIP, PriceDouble) "
                L"OUTPUT INSERTED.ShowtimeID INTO @Inserted "
                L"VALUES (?, ?, ?, ?, ?, ?, ?); "
                L"SELECT ShowtimeID FROM @Inserted;";

            if (!stmt.execute(insertSql)) {
                std::cerr << "[addShowtime] LOI: insert Showtimes execute() that bai!\n";
                return false;
            }

            // QUAN TRỌNG: batch này có 3 câu lệnh (DECLARE, INSERT...OUTPUT INTO,
            // SELECT). "Kết quả hiện hành" ngay sau execute() mặc định trỏ vào câu
            // lệnh ĐẦU TIÊN trong batch. Phải gọi SQLMoreResults() để lần lượt bỏ
            // qua các kết quả trung gian (DECLARE/INSERT không có cột dữ liệu nào
            // - SQLNumResultCols trả về 0), cho tới khi tới đúng kết quả của câu
            // SELECT cuối (có 1 cột ShowtimeID) thì mới SQLFetch() được.
            SQLSMALLINT numCols = 0;
            SQLNumResultCols(stmt.hstmt, &numCols);
            int guard = 0;
            while (numCols == 0 && guard < 10) {
                SQLRETURN mr = SQLMoreResults(stmt.hstmt);
                if (!SQL_SUCCEEDED(mr)) break; // hết kết quả hoặc lỗi
                SQLNumResultCols(stmt.hstmt, &numCols);
                guard++;
            }

            if (numCols > 0 && SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
                outNewId = (int)DbRead::getInt(stmt.hstmt, 1);
            } else {
                std::cerr << "[addShowtime] LOI: SQLFetch ket qua @Inserted that bai! "
                          << "numCols=" << numCols << " " << DbStatement::getLastError(SQL_HANDLE_STMT, stmt.hstmt) << "\n";
            }
        } // <-- đóng hẳn statement INSERT tại đây
        std::cerr << "[addShowtime] Da insert Showtimes, outNewId=" << outNewId << "\n";

        // Phòng vệ cuối: nếu vì lý do gì đó vẫn không lấy được outNewId hợp lệ,
        // coi là lỗi thật, không được tạo suất chiếu "ma" rỗng ghế.
        if (outNewId <= 0) {
            std::cerr << "[addShowtime] LOI: khong lay duoc ID that cua Showtime vua tao.\n";
            return false;
        }

        // Tự sinh sẵn trạng thái ghế "Available" cho toàn bộ ghế của Hall này
        // ứng với suất chiếu mới, để API /api/seats/:showtimeId trả dữ liệu ngay.
        if (outNewId > 0) {
            DbStatement seedSeats(conn);
            seedSeats.bindInt(outNewId);
            seedSeats.bindInt(hallId);
            std::wstring seedSql =
                L"INSERT INTO dbo.ShowtimeSeats (ShowtimeID, SeatID, Status) "
                L"SELECT ?, SeatID, 'Available' FROM dbo.Seats WHERE HallID = ? AND IsActive = 1";
            bool seedOk = seedSeats.execute(seedSql);
            std::cerr << "[addShowtime] Da chay seed INSERT: seedOk=" << seedOk
                      << " rowCount=" << seedSeats.rowCount()
                      << " (ShowtimeID=" << outNewId << ", HallID=" << hallId << ")\n";

            // QUAN TRỌNG: kiểm tra CẢ execute() thất bại (lỗi ODBC, vd "connection
            // busy" khi thiếu MARS) LẪN trường hợp execute() thành công nhưng chèn
            // 0 dòng (Hall chưa có ghế active nào trong dbo.Seats). Trước đây chỉ
            // kiểm tra rowCount() mà bỏ qua kết quả execute(), nên khi execute()
            // thất bại âm thầm, rowCount() không đáng tin cậy và lỗi bị bỏ lọt.
            if (!seedOk || seedSeats.rowCount() <= 0) {
                std::cerr << "[addShowtime] Seed ShowtimeSeats that bai cho ShowtimeID="
                          << outNewId << " HallID=" << hallId
                          << " (execute=" << seedOk << ", rowCount=" << seedSeats.rowCount() << ")\n";
                DbStatement rollback(conn);
                rollback.bindInt(outNewId);
                bool delOk = rollback.execute(L"DELETE FROM dbo.Showtimes WHERE ShowtimeID = ?");
                if (!delOk) {
                    std::cerr << "[addShowtime] CANH BAO: rollback xoa Showtime that bai! "
                              << "ShowtimeID=" << outNewId << " co the con sot lai rong ghe, "
                              << "can xoa thu cong bang SQL.\n";
                }
                outNewId = 0;
                return false;
            }
        }
        std::cerr << "[addShowtime] <=== THANH CONG, tra ve true, ShowtimeID=" << outNewId << "\n";
        return true;
    }

    bool deleteShowtime(int id) {
        DbConnection conn;
        if (!conn.connected) return false;

        // Xóa ShowtimeSeats trước (FK), sau đó xóa Showtime
        {
            DbStatement delSeats(conn);
            delSeats.bindInt(id);
            delSeats.execute(L"DELETE FROM dbo.ShowtimeSeats WHERE ShowtimeID = ?");
        }
        DbStatement stmt(conn);
        stmt.bindInt(id);
        if (!stmt.execute(L"DELETE FROM dbo.Showtimes WHERE ShowtimeID = ?")) return false;
        return stmt.rowCount() > 0;
    }
};

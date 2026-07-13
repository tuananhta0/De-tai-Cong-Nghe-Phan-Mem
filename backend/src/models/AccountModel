#pragma once
#include "../database/Database.hpp"
#include "../utils/JsonArrayUtil.hpp"
#include "../utils/SecurityUtil.hpp"
#include <string>
#include <vector>

// ============================================================================
//  AccountModel.hpp
//  Quản lý tài khoản (bảng dbo.Users đã được mở rộng bởi migration).
//  Email là khóa định danh nghiệp vụ (giống UserProfile.email ở frontend),
//  RoleCode trả trực tiếp "customer" | "admin" | "employee".
// ============================================================================

struct AccountEntity {
    std::string name;
    std::string email;
    std::string phone;
    std::string avatar;
    std::string membershipId;
    int points = 0;
    std::vector<std::string> favoriteMovies;
    std::string role; // customer | admin | employee
};

class AccountModel {
public:
    std::vector<AccountEntity> getAllAccounts() {
        std::vector<AccountEntity> list;
        DbConnection conn;
        if (!conn.connected) return list;

        DbStatement stmt(conn);
        std::wstring sql =
            L"SELECT FullName, Email, ISNULL(Phone,''), ISNULL(Avatar,''), ISNULL(MembershipId,''), "
            L"Points, ISNULL(FavoriteMoviesJson,'[]'), RoleCode FROM dbo.Users ORDER BY UserID";

        if (stmt.execute(sql)) {
            while (SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
                list.push_back(readRow(stmt.hstmt));
            }
        }
        return list;
    }

    bool findByEmail(const std::string& email, AccountEntity& out) {
        DbConnection conn;
        if (!conn.connected) return false;

        DbStatement stmt(conn);
        stmt.bindString(toLower(email));
        std::wstring sql =
            L"SELECT FullName, Email, ISNULL(Phone,''), ISNULL(Avatar,''), ISNULL(MembershipId,''), "
            L"Points, ISNULL(FavoriteMoviesJson,'[]'), RoleCode FROM dbo.Users WHERE LOWER(Email) = ?";

        if (stmt.execute(sql) && SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
            out = readRow(stmt.hstmt);
            return true;
        }
        return false;
    }

    // Trả về role nếu đăng nhập thành công, "" nếu sai thông tin.
    // Hỗ trợ đăng nhập bằng Email hoặc số điện thoại (theo Auth.tsx của frontend).
    std::string login(const std::string& emailOrPhone, const std::string& password) {
        DbConnection conn;
        if (!conn.connected) return "";

        // So khớp mật khẩu trực tiếp bằng HASHBYTES ngay trong SQL Server để đảm bảo
        // dùng đúng 1 thuật toán hash duy nhất (SHA2_256) cho cả lúc tạo và lúc kiểm tra.
        DbStatement stmt(conn);
        stmt.bindString(toLower(emailOrPhone));
        stmt.bindString(emailOrPhone);
        stmt.bindString(password);
        std::wstring sql =
            L"SELECT RoleCode FROM dbo.Users "
            L"WHERE (LOWER(Email) = ? OR Phone = ?) AND PasswordHash = HASHBYTES('SHA2_256', ?)";

        if (stmt.execute(sql) && SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
            return DbRead::getUtf8String(stmt.hstmt, 1);
        }
        return "";
    }

    // Đăng ký tài khoản mới (role mặc định "customer")
    bool registerAccount(const AccountEntity& acc, const std::string& plainPassword) {
        DbConnection conn;
        if (!conn.connected) return false;

        // Cần RoleID tương ứng RoleCode 'customer' để tương thích cột RoleID NOT NULL cũ
        int roleId = getRoleIdByCode(conn, "customer");
        if (roleId == 0) return false;

        DbStatement stmt(conn);
        stmt.bindString(acc.email);                 // Username dùng luôn email cho đơn giản & duy nhất
        stmt.bindString(plainPassword);              // sẽ hash ngay trong SQL bằng HASHBYTES
        stmt.bindNString(toW(acc.name));
        stmt.bindString(acc.email);
        stmt.bindString(acc.phone);
        stmt.bindInt(roleId);
        stmt.bindString("customer");
        stmt.bindString(acc.avatar);
        stmt.bindString(acc.membershipId);
        stmt.bindInt(acc.points);
        stmt.bindNString(toW(JsonArrayUtil::toJsonArray(acc.favoriteMovies)));

        std::wstring sql =
            L"INSERT INTO dbo.Users "
            L"(Username, PasswordHash, FullName, Email, Phone, RoleID, RoleCode, Avatar, MembershipId, Points, FavoriteMoviesJson) "
            L"VALUES (?, HASHBYTES('SHA2_256', ?), ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        return stmt.execute(sql);
    }

    // Cập nhật hồ sơ (tên, điện thoại, avatar, điểm, phim yêu thích)
    bool updateProfile(const AccountEntity& acc) {
        DbConnection conn;
        if (!conn.connected) return false;

        DbStatement stmt(conn);
        stmt.bindNString(toW(acc.name));
        stmt.bindString(acc.phone);
        stmt.bindString(acc.avatar);
        stmt.bindInt(acc.points);
        stmt.bindNString(toW(JsonArrayUtil::toJsonArray(acc.favoriteMovies)));
        stmt.bindString(toLower(acc.email));

        std::wstring sql =
            L"UPDATE dbo.Users SET FullName=?, Phone=?, Avatar=?, Points=?, FavoriteMoviesJson=? "
            L"WHERE LOWER(Email) = ?";

        if (!stmt.execute(sql)) return false;
        return stmt.rowCount() > 0;
    }

    bool addPoints(const std::string& email, int addedPoints) {
        DbConnection conn;
        if (!conn.connected) return false;

        DbStatement stmt(conn);
        stmt.bindInt(addedPoints);
        stmt.bindString(toLower(email));
        std::wstring sql = L"UPDATE dbo.Users SET Points = Points + ? WHERE LOWER(Email) = ?";
        return stmt.execute(sql);
    }

private:
    static std::string toLower(const std::string& s) {
        std::string r = s;
        for (auto& c : r) c = (char)tolower((unsigned char)c);
        return r;
    }

    static std::wstring toW(const std::string& utf8) {
        if (utf8.empty()) return L"";
        int sizeNeeded = MultiByteToWideChar(CP_UTF8, 0, utf8.c_str(), (int)utf8.size(), NULL, 0);
        std::wstring result(sizeNeeded, 0);
        MultiByteToWideChar(CP_UTF8, 0, utf8.c_str(), (int)utf8.size(), &result[0], sizeNeeded);
        return result;
    }

    static int getRoleIdByCode(DbConnection& conn, const std::string& roleCode) {
        // Schema mới có sẵn cột Roles.RoleCode ('admin'|'employee'|'customer'), tra cứu
        // trực tiếp theo đó thay vì so khớp RoleName tiếng Việt (dễ lỗi dấu/khoảng trắng).
        DbStatement stmt(conn);
        stmt.bindString(roleCode);
        std::wstring sql = L"SELECT TOP 1 RoleID FROM dbo.Roles WHERE RoleCode = ?";
        if (stmt.execute(sql) && SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
            return (int)DbRead::getInt(stmt.hstmt, 1);
        }
        return 0;
    }

    static AccountEntity readRow(SQLHSTMT hstmt) {
        AccountEntity a;
        a.name          = DbRead::getUtf8String(hstmt, 1);
        a.email         = DbRead::getUtf8String(hstmt, 2);
        a.phone         = DbRead::getUtf8String(hstmt, 3);
        a.avatar        = DbRead::getUtf8String(hstmt, 4);
        a.membershipId  = DbRead::getUtf8String(hstmt, 5);
        a.points        = (int)DbRead::getInt(hstmt, 6);
        a.favoriteMovies= JsonArrayUtil::parseStringArray(DbRead::getUtf8String(hstmt, 7));
        a.role          = DbRead::getUtf8String(hstmt, 8);
        return a;
    }
};

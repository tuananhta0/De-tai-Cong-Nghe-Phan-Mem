#pragma once
#include "../database/Database.hpp"
#include <string>
#include <vector>

struct PromotionEntity {
    int id = 0;
    std::string title;
    std::string description;
    std::string code;
    int discountPercent = 0;
    std::string validity;
    std::string imageUrl;
};

class PromotionModel {
public:
    std::vector<PromotionEntity> getAll() {
        std::vector<PromotionEntity> list;
        DbConnection conn;
        if (!conn.connected) return list;

        DbStatement stmt(conn);
        std::wstring sql =
            L"SELECT PromotionID, Title, ISNULL(Description,''), Code, DiscountPercent, ISNULL(Validity,''), ISNULL(ImageURL,'') "
            L"FROM dbo.Promotions WHERE IsActive = 1 ORDER BY PromotionID DESC";

        if (stmt.execute(sql)) {
            while (SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
                PromotionEntity p;
                p.id              = (int)DbRead::getInt(stmt.hstmt, 1);
                p.title           = DbRead::getUtf8String(stmt.hstmt, 2);
                p.description     = DbRead::getUtf8String(stmt.hstmt, 3);
                p.code             = DbRead::getUtf8String(stmt.hstmt, 4);
                p.discountPercent = (int)DbRead::getInt(stmt.hstmt, 5);
                p.validity         = DbRead::getUtf8String(stmt.hstmt, 6);
                p.imageUrl         = DbRead::getUtf8String(stmt.hstmt, 7);
                list.push_back(p);
            }
        }
        return list;
    }

    bool add(const PromotionEntity& p, int& outNewId) {
        DbConnection conn;
        if (!conn.connected) return false;

        DbStatement stmt(conn);
        stmt.bindNString(toW(p.title));
        stmt.bindNString(toW(p.description));
        stmt.bindString(p.code);
        stmt.bindInt(p.discountPercent);
        stmt.bindNString(toW(p.validity));
        stmt.bindString(p.imageUrl);

        std::wstring sql =
            L"INSERT INTO dbo.Promotions (Title, Description, Code, DiscountPercent, Validity, ImageURL, IsActive) "
            L"VALUES (?, ?, ?, ?, ?, ?, 1); SELECT CAST(SCOPE_IDENTITY() AS INT);";

        if (!stmt.execute(sql)) return false;
        outNewId = 0;
        if (SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) outNewId = (int)DbRead::getInt(stmt.hstmt, 1);
        return true;
    }

    bool remove(int id) {
        DbConnection conn;
        if (!conn.connected) return false;
        DbStatement stmt(conn);
        stmt.bindInt(id);
        if (!stmt.execute(L"UPDATE dbo.Promotions SET IsActive = 0 WHERE PromotionID = ?")) return false;
        return stmt.rowCount() > 0;
    }

    // Kiểm tra mã khuyến mãi hợp lệ, trả về % giảm giá (0 nếu không hợp lệ)
    int validateCode(const std::string& code) {
        DbConnection conn;
        if (!conn.connected) return 0;
        DbStatement stmt(conn);
        stmt.bindString(code);
        if (stmt.execute(L"SELECT DiscountPercent FROM dbo.Promotions WHERE Code = ? AND IsActive = 1") &&
            SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
            return (int)DbRead::getInt(stmt.hstmt, 1);
        }
        return 0;
    }

private:
    static std::wstring toW(const std::string& utf8) {
        if (utf8.empty()) return L"";
        int sizeNeeded = MultiByteToWideChar(CP_UTF8, 0, utf8.c_str(), (int)utf8.size(), NULL, 0);
        std::wstring result(sizeNeeded, 0);
        MultiByteToWideChar(CP_UTF8, 0, utf8.c_str(), (int)utf8.size(), &result[0], sizeNeeded);
        return result;
    }
};

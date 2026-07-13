#pragma once
#include "../database/Database.hpp"
#include <string>
#include <vector>

struct ComboEntity {
    int id = 0;
    std::string name;
    std::string description;
    double price = 0;
    std::string imageUrl;
};

class ComboModel {
public:
    std::vector<ComboEntity> getAll() {
        std::vector<ComboEntity> list;
        DbConnection conn;
        if (!conn.connected) return list;

        DbStatement stmt(conn);
        std::wstring sql =
            L"SELECT ComboID, Name, ISNULL(Description,''), Price, ISNULL(ImageURL,'') "
            L"FROM dbo.Combos WHERE IsActive = 1 ORDER BY ComboID";

        if (stmt.execute(sql)) {
            while (SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
                ComboEntity c;
                c.id          = (int)DbRead::getInt(stmt.hstmt, 1);
                c.name        = DbRead::getUtf8String(stmt.hstmt, 2);
                c.description = DbRead::getUtf8String(stmt.hstmt, 3);
                c.price       = DbRead::getDouble(stmt.hstmt, 4);
                c.imageUrl    = DbRead::getUtf8String(stmt.hstmt, 5);
                list.push_back(c);
            }
        }
        return list;
    }

    bool add(const ComboEntity& c, int& outNewId) {
        DbConnection conn;
        if (!conn.connected) return false;

        DbStatement stmt(conn);
        stmt.bindNString(toW(c.name));
        stmt.bindNString(toW(c.description));
        stmt.bindDouble(c.price);
        stmt.bindString(c.imageUrl);

        std::wstring sql =
            L"INSERT INTO dbo.Combos (Name, Description, Price, ImageURL, IsActive) "
            L"VALUES (?, ?, ?, ?, 1); SELECT CAST(SCOPE_IDENTITY() AS INT);";

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
        if (!stmt.execute(L"UPDATE dbo.Combos SET IsActive = 0 WHERE ComboID = ?")) return false;
        return stmt.rowCount() > 0;
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

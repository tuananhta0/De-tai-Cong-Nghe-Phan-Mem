#pragma once
#include "../database/Database.hpp"
#include <string>
#include <vector>

struct NewsEntity {
    int id = 0;
    std::string title;
    std::string summary;
    std::string content;
    std::string date;       // yyyy-mm-dd
    std::string category;   // Điện Ảnh | Khuyến Mãi | Sự Kiện | Hậu Trường
    std::string imageUrl;
    int views = 0;
};

class NewsModel {
public:
    std::vector<NewsEntity> getAll() {
        std::vector<NewsEntity> list;
        DbConnection conn;
        if (!conn.connected) return list;

        DbStatement stmt(conn);
        std::wstring sql =
            L"SELECT NewsID, Title, ISNULL(Summary,''), ISNULL(Content,''), "
            L"CONVERT(VARCHAR, PublishDate, 23), Category, ISNULL(ImageURL,''), Views "
            L"FROM dbo.News WHERE IsActive = 1 ORDER BY PublishDate DESC";

        if (stmt.execute(sql)) {
            while (SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
                NewsEntity n;
                n.id        = (int)DbRead::getInt(stmt.hstmt, 1);
                n.title     = DbRead::getUtf8String(stmt.hstmt, 2);
                n.summary   = DbRead::getUtf8String(stmt.hstmt, 3);
                n.content   = DbRead::getUtf8String(stmt.hstmt, 4);
                n.date      = DbRead::getUtf8String(stmt.hstmt, 5);
                n.category  = DbRead::getUtf8String(stmt.hstmt, 6);
                n.imageUrl  = DbRead::getUtf8String(stmt.hstmt, 7);
                n.views     = (int)DbRead::getInt(stmt.hstmt, 8);
                list.push_back(n);
            }
        }
        return list;
    }

    bool add(const NewsEntity& n, int& outNewId) {
        DbConnection conn;
        if (!conn.connected) return false;

        DbStatement stmt(conn);
        stmt.bindNString(toW(n.title));
        stmt.bindNString(toW(n.summary));
        stmt.bindNString(toW(n.content));
        stmt.bindString(n.category);
        stmt.bindString(n.imageUrl);

        std::wstring sql =
            L"INSERT INTO dbo.News (Title, Summary, Content, PublishDate, Category, ImageURL, Views, IsActive) "
            L"VALUES (?, ?, ?, CAST(GETDATE() AS DATE), ?, ?, 0, 1); SELECT CAST(SCOPE_IDENTITY() AS INT);";

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
        if (!stmt.execute(L"UPDATE dbo.News SET IsActive = 0 WHERE NewsID = ?")) return false;
        return stmt.rowCount() > 0;
    }

    bool incrementViews(int id) {
        DbConnection conn;
        if (!conn.connected) return false;
        DbStatement stmt(conn);
        stmt.bindInt(id);
        return stmt.execute(L"UPDATE dbo.News SET Views = Views + 1 WHERE NewsID = ?");
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

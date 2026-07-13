#pragma once
#include "../database/Database.hpp"
#include "../utils/JsonArrayUtil.hpp"
#include <string>
#include <vector>

// ============================================================================
//  MovieModel.hpp
//  Mọi truy vấn dùng DbStatement::bind* (parameterized query) - KHÔNG nối
//  chuỗi SQL trực tiếp, chống SQL Injection hoàn toàn.
// ============================================================================

struct MovieEntity {
    int id = 0;
    std::string title;
    std::string originalTitle;
    std::vector<std::string> genre;     // ["Hành động", "Phiêu lưu"]
    int duration = 0;
    std::string rating;                  // P | K | T13 | T16 | T18
    double score = 0;
    int votes = 0;
    std::string releaseDate;             // yyyy-mm-dd
    bool isUpcoming = false;
    std::string posterUrl;
    std::string bannerUrl;
    std::string trailerUrl;
    std::string description;
    std::string director;
    std::vector<std::string> cast;
    std::string language;
    std::string countdownEnd;
    bool isActive = true;
};

class MovieModel {
public:
    // Lấy toàn bộ phim đang hoạt động (IsActive = 1). Frontend tự lọc isUpcoming.
    std::vector<MovieEntity> getAllMovies() {
        std::vector<MovieEntity> movies;
        DbConnection conn;
        if (!conn.connected) return movies;

        DbStatement stmt(conn);
        std::wstring sql =
            L"SELECT MovieID, Title, ISNULL(OriginalTitle,''), Genre, Duration, Rating, Score, Votes, "
            L"CONVERT(VARCHAR, ReleaseDate, 23), IsUpcoming, ISNULL(PosterURL,''), ISNULL(BannerURL,''), "
            L"ISNULL(TrailerURL,''), ISNULL(Description,''), ISNULL(Director,''), ISNULL(CastJson,'[]'), "
            L"Language, ISNULL(CONVERT(VARCHAR, CountdownEnd, 126), '') "
            L"FROM dbo.Movies WHERE IsActive = 1 ORDER BY MovieID DESC";

        if (stmt.execute(sql)) {
            while (SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
                movies.push_back(readRow(stmt.hstmt));
            }
        }
        return movies;
    }

    MovieEntity getMovieById(int id) {
        MovieEntity m;
        DbConnection conn;
        if (!conn.connected) return m;

        DbStatement stmt(conn);
        stmt.bindInt(id);
        std::wstring sql =
            L"SELECT MovieID, Title, ISNULL(OriginalTitle,''), Genre, Duration, Rating, Score, Votes, "
            L"CONVERT(VARCHAR, ReleaseDate, 23), IsUpcoming, ISNULL(PosterURL,''), ISNULL(BannerURL,''), "
            L"ISNULL(TrailerURL,''), ISNULL(Description,''), ISNULL(Director,''), ISNULL(CastJson,'[]'), "
            L"Language, ISNULL(CONVERT(VARCHAR, CountdownEnd, 126), '') "
            L"FROM dbo.Movies WHERE MovieID = ? AND IsActive = 1";

        if (stmt.execute(sql)) {
            if (SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
                m = readRow(stmt.hstmt);
            }
        }
        return m;
    }

    bool addMovie(const MovieEntity& m, int& outNewId) {
        DbConnection conn;
        if (!conn.connected) return false;

        DbStatement stmt(conn);
        stmt.bindNString(toW(m.title));
        stmt.bindNString(toW(m.originalTitle));
        stmt.bindNString(toW(JsonArrayUtil::joinByComma(m.genre)));
        stmt.bindInt(m.duration);
        stmt.bindString(m.rating);
        stmt.bindDouble(m.score);
        stmt.bindInt(m.votes);
        stmt.bindString(m.releaseDate);
        stmt.bindBit(m.isUpcoming);
        stmt.bindString(m.posterUrl);
        stmt.bindString(m.bannerUrl);
        stmt.bindString(m.trailerUrl);
        stmt.bindNString(toW(m.description));
        stmt.bindNString(toW(m.director));
        stmt.bindNString(toW(JsonArrayUtil::toJsonArray(m.cast)));
        stmt.bindNString(toW(m.language));

        std::wstring sql =
            L"INSERT INTO dbo.Movies "
            L"(Title, OriginalTitle, Genre, Duration, Rating, Score, Votes, ReleaseDate, IsUpcoming, "
            L"PosterURL, BannerURL, TrailerURL, Description, Director, CastJson, Language, IsActive) "
            L"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1); "
            L"SELECT CAST(SCOPE_IDENTITY() AS INT);";

        if (!stmt.execute(sql)) return false;

        // SCOPE_IDENTITY() được trả về như 1 result set ngay sau INSERT trong cùng
        // 1 lần SQLExecDirectW (vì 2 câu lệnh được nối bằng ';' và chạy như 1 batch).
        outNewId = 0;
        if (SQL_SUCCEEDED(SQLFetch(stmt.hstmt))) {
            outNewId = (int)DbRead::getInt(stmt.hstmt, 1);
        }
        return true;
    }

    bool updateMovie(int id, const MovieEntity& m) {
        DbConnection conn;
        if (!conn.connected) return false;

        DbStatement stmt(conn);
        stmt.bindNString(toW(m.title));
        stmt.bindNString(toW(m.originalTitle));
        stmt.bindNString(toW(JsonArrayUtil::joinByComma(m.genre)));
        stmt.bindInt(m.duration);
        stmt.bindString(m.rating);
        stmt.bindDouble(m.score);
        stmt.bindInt(m.votes);
        stmt.bindString(m.releaseDate);
        stmt.bindBit(m.isUpcoming);
        stmt.bindString(m.posterUrl);
        stmt.bindString(m.bannerUrl);
        stmt.bindString(m.trailerUrl);
        stmt.bindNString(toW(m.description));
        stmt.bindNString(toW(m.director));
        stmt.bindNString(toW(JsonArrayUtil::toJsonArray(m.cast)));
        stmt.bindNString(toW(m.language));
        stmt.bindInt(id);

        std::wstring sql =
            L"UPDATE dbo.Movies SET Title=?, OriginalTitle=?, Genre=?, Duration=?, Rating=?, Score=?, "
            L"Votes=?, ReleaseDate=?, IsUpcoming=?, PosterURL=?, BannerURL=?, TrailerURL=?, "
            L"Description=?, Director=?, CastJson=?, Language=? WHERE MovieID = ?";

        if (!stmt.execute(sql)) return false;
        return stmt.rowCount() > 0;
    }

    // Xóa mềm: chỉ đặt IsActive = 0, không xóa thật để giữ lịch sử vé đã bán
    bool deleteMovie(int id) {
        DbConnection conn;
        if (!conn.connected) return false;

        DbStatement stmt(conn);
        stmt.bindInt(id);
        std::wstring sql = L"UPDATE dbo.Movies SET IsActive = 0 WHERE MovieID = ?";
        if (!stmt.execute(sql)) return false;
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

    static MovieEntity readRow(SQLHSTMT hstmt) {
        MovieEntity m;
        m.id            = (int)DbRead::getInt(hstmt, 1);
        m.title         = DbRead::getUtf8String(hstmt, 2);
        m.originalTitle = DbRead::getUtf8String(hstmt, 3);
        m.genre         = JsonArrayUtil::splitByComma(DbRead::getUtf8String(hstmt, 4));
        m.duration      = (int)DbRead::getInt(hstmt, 5);
        m.rating        = DbRead::getUtf8String(hstmt, 6);
        m.score         = DbRead::getDouble(hstmt, 7);
        m.votes         = (int)DbRead::getInt(hstmt, 8);
        m.releaseDate   = DbRead::getUtf8String(hstmt, 9);
        m.isUpcoming    = DbRead::getBit(hstmt, 10);
        m.posterUrl     = DbRead::getUtf8String(hstmt, 11);
        m.bannerUrl     = DbRead::getUtf8String(hstmt, 12);
        m.trailerUrl    = DbRead::getUtf8String(hstmt, 13);
        m.description   = DbRead::getUtf8String(hstmt, 14);
        m.director      = DbRead::getUtf8String(hstmt, 15);
        m.cast          = JsonArrayUtil::parseStringArray(DbRead::getUtf8String(hstmt, 16));
        m.language      = DbRead::getUtf8String(hstmt, 17);
        m.countdownEnd  = DbRead::getUtf8String(hstmt, 18);
        m.isActive      = true;
        return m;
    }
};

#pragma once
#include "crow.h"
#include "../models/CinemaModel.hpp"

// ============================================================================
//  CinemaController.hpp
//  GET /api/cinemas
//  GET /api/showtimes               (toàn bộ)
//  GET /api/showtimes/movie/:id     (theo phim)
//  POST /api/showtimes              (admin tạo suất chiếu mới)
//  DELETE /api/showtimes/:id
// ============================================================================

class CinemaController {
private:
    CinemaModel model;

    static crow::json::wvalue cinemaToJson(const CinemaEntity& c) {
        crow::json::wvalue j;
        j["id"]       = std::to_string(c.id);
        j["name"]      = c.name;
        j["address"]   = c.address;
        j["phone"]     = c.phone;
        j["imageUrl"]  = c.imageUrl;
        j["mapEmbed"]  = c.mapEmbed;
        return j;
    }

    // Chuyển "yyyy-mm-dd" (SQL Server CONVERT 23) -> "dd/mm/yyyy" (frontend Showtime.date)
    static std::string toDisplayDate(const std::string& isoDate) {
        if (isoDate.size() != 10) return isoDate;
        return isoDate.substr(8, 2) + "/" + isoDate.substr(5, 2) + "/" + isoDate.substr(0, 4);
    }

    static crow::json::wvalue showtimeToJson(const ShowtimeEntity& s) {
        crow::json::wvalue j;
        j["id"]             = std::to_string(s.id);
        j["movieId"]         = std::to_string(s.movieId);
        j["cinemaId"]        = std::to_string(s.cinemaId);
        j["date"]            = toDisplayDate(s.date);
        j["time"]            = s.time;
        j["room"]            = s.room;
        j["format"]          = s.format;
        j["priceStandard"]   = s.priceStandard;
        j["priceVIP"]        = s.priceVIP;
        j["priceDouble"]     = s.priceDouble;
        return j;
    }

    static crow::response withCors(crow::response res) {
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json; charset=utf-8");
        return res;
    }

public:
    crow::response getAllCinemas() {
        auto list = model.getAllCinemas();
        crow::json::wvalue arr = crow::json::wvalue::list();
        for (size_t i = 0; i < list.size(); ++i) arr[i] = cinemaToJson(list[i]);
        return withCors(crow::response(200, arr));
    }

    crow::response getAllShowtimes() {
        auto list = model.getAllShowtimes();
        crow::json::wvalue arr = crow::json::wvalue::list();
        for (size_t i = 0; i < list.size(); ++i) arr[i] = showtimeToJson(list[i]);
        return withCors(crow::response(200, arr));
    }

    crow::response getShowtimesByMovie(int movieId) {
        auto list = model.getShowtimesByMovie(movieId);
        crow::json::wvalue arr = crow::json::wvalue::list();
        for (size_t i = 0; i < list.size(); ++i) arr[i] = showtimeToJson(list[i]);
        return withCors(crow::response(200, arr));
    }

    // Helper: đọc field có thể là number hoặc string từ JSON
    static int readIntField(const crow::json::rvalue& body, const std::string& key) {
        if (!body.has(key)) return 0;
        auto t = body[key].t();
        if (t == crow::json::type::Number) return (int)body[key].i();
        if (t == crow::json::type::String) {
            try { return std::stoi(body[key].s()); } catch (...) { return 0; }
        }
        return 0;
    }

    crow::response createShowtime(const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body) return withCors(crow::response(400, R"({"error":"JSON không hợp lệ"})"));

        int movieId  = readIntField(body, "movieId");
        int cinemaId = readIntField(body, "cinemaId");
        std::string startTimeIso = body.has("startTime") ? body["startTime"].s() : std::string(""); // "yyyy-mm-dd HH:mm:ss"
        std::string format       = body.has("format") ? body["format"].s() : std::string("2D Phụ đề");
        std::string room         = body.has("room") ? body["room"].s() : std::string(""); // tên phòng: "Phòng 1", "Phòng 2 (VIP)"
        double priceStandard     = body.has("priceStandard") ? body["priceStandard"].d() : 0;
        double priceVIP          = body.has("priceVIP") ? body["priceVIP"].d() : 0;
        double priceDouble       = body.has("priceDouble") ? body["priceDouble"].d() : 0;

        if (movieId == 0 || cinemaId == 0 || startTimeIso.empty()) {
            return withCors(crow::response(400, R"({"error":"Thiếu movieId/cinemaId/startTime"})"));
        }

        int newId = 0;
        if (!model.addShowtime(movieId, cinemaId, startTimeIso, format, priceStandard, priceVIP, priceDouble, newId, room)) {
            return withCors(crow::response(500,
                "{\"error\":\"Không thể tạo suất chiếu: rạp chưa có phòng chiếu, hoặc tên phòng "
                "('" + room + "') không khớp tên Hall trong CSDL, hoặc phòng đó chưa được khởi tạo ghế "
                "(chạy fix_cinemahalls.sql để kiểm tra/sửa).\"}"));
        }
        crow::json::wvalue res;
        res["id"] = std::to_string(newId);
        res["success"] = true;
        return withCors(crow::response(201, res));
    }

    crow::response deleteShowtime(int id) {
        if (!model.deleteShowtime(id)) {
            return withCors(crow::response(404, R"({"error":"Không tìm thấy suất chiếu để xóa"})"));
        }
        return withCors(crow::response(200, R"({"success":true})"));
    }
};

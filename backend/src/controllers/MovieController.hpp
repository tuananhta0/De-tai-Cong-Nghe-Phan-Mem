#pragma once
#include "crow.h"
#include "../models/MovieModel.hpp"
#include "../utils/JsonArrayUtil.hpp"

// ============================================================================
//  MovieController.hpp
//  REST chuẩn: GET /api/movies, GET /api/movies/:id,
//  POST /api/movies, PUT /api/movies/:id, DELETE /api/movies/:id
// ============================================================================

class MovieController {
private:
    MovieModel model;

    static crow::json::wvalue toJson(const MovieEntity& m) {
        crow::json::wvalue j;
        j["id"]            = std::to_string(m.id);
        j["title"]          = m.title;
        j["originalTitle"]  = m.originalTitle;
        j["genre"]          = m.genre;
        j["duration"]       = m.duration;
        j["rating"]         = m.rating;
        j["score"]          = m.score;
        j["votes"]          = m.votes;
        j["releaseDate"]    = m.releaseDate;
        j["isUpcoming"]     = m.isUpcoming;
        j["posterUrl"]      = m.posterUrl;
        j["bannerUrl"]      = m.bannerUrl;
        j["trailerUrl"]     = m.trailerUrl;
        j["description"]    = m.description;
        j["director"]       = m.director;
        j["cast"]           = m.cast;
        j["language"]       = m.language;
        j["countdownEnd"]   = m.countdownEnd;
        return j;
    }

    static MovieEntity fromJson(const crow::json::rvalue& body) {
        MovieEntity m;
        m.title         = body.has("title") ? body["title"].s() : std::string("");
        m.originalTitle = body.has("originalTitle") ? body["originalTitle"].s() : std::string("");
        if (body.has("genre")) {
            for (const auto& g : body["genre"]) m.genre.push_back(g.s());
        }
        m.duration      = body.has("duration") ? body["duration"].i() : 0;
        m.rating        = body.has("rating") ? body["rating"].s() : std::string("T13");
        m.score         = body.has("score") ? body["score"].d() : 0.0;
        m.votes         = body.has("votes") ? body["votes"].i() : 0;
        m.releaseDate   = body.has("releaseDate") ? body["releaseDate"].s() : std::string("");
        m.isUpcoming    = body.has("isUpcoming") ? body["isUpcoming"].b() : false;
        m.posterUrl     = body.has("posterUrl") ? body["posterUrl"].s() : std::string("");
        m.bannerUrl     = body.has("bannerUrl") ? body["bannerUrl"].s() : std::string("");
        m.trailerUrl    = body.has("trailerUrl") ? body["trailerUrl"].s() : std::string("");
        m.description   = body.has("description") ? body["description"].s() : std::string("");
        m.director      = body.has("director") ? body["director"].s() : std::string("");
        if (body.has("cast")) {
            for (const auto& c : body["cast"]) m.cast.push_back(c.s());
        }
        m.language      = body.has("language") ? body["language"].s() : std::string("Tiếng Việt");
        return m;
    }

    static crow::response withCors(crow::response res) {
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json; charset=utf-8");
        return res;
    }

public:
    crow::response getAll() {
        auto movies = model.getAllMovies();
        crow::json::wvalue arr = crow::json::wvalue::list();
        for (size_t i = 0; i < movies.size(); ++i) arr[i] = toJson(movies[i]);
        return withCors(crow::response(200, arr));
    }

    crow::response getById(int id) {
        auto m = model.getMovieById(id);
        if (m.id == 0) {
            return withCors(crow::response(404, R"({"error":"Không tìm thấy phim"})"));
        }
        return withCors(crow::response(200, toJson(m)));
    }

    crow::response create(const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body) return withCors(crow::response(400, R"({"error":"JSON không hợp lệ"})"));

        MovieEntity m = fromJson(body);
        int newId = 0;
        if (!model.addMovie(m, newId)) {
            return withCors(crow::response(500, R"({"error":"Không thể thêm phim"})"));
        }
        auto created = model.getMovieById(newId);
        return withCors(crow::response(201, toJson(created)));
    }

    crow::response update(int id, const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body) return withCors(crow::response(400, R"({"error":"JSON không hợp lệ"})"));

        MovieEntity m = fromJson(body);
        if (!model.updateMovie(id, m)) {
            return withCors(crow::response(404, R"({"error":"Không tìm thấy phim để cập nhật"})"));
        }
        auto updated = model.getMovieById(id);
        return withCors(crow::response(200, toJson(updated)));
    }

    crow::response remove(int id) {
        if (!model.deleteMovie(id)) {
            return withCors(crow::response(404, R"({"error":"Không tìm thấy phim để xóa"})"));
        }
        return withCors(crow::response(200, R"({"success":true})"));
    }
};

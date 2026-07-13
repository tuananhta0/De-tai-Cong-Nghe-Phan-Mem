#pragma once
#include "crow.h"
#include "../models/NewsModel.hpp"

// ============================================================================
//  GET    /api/news
//  POST   /api/news
//  DELETE /api/news/:id
//  PUT    /api/news/:id/view     (tăng lượt xem)
// ============================================================================

class NewsController {
private:
    NewsModel model;

    static crow::json::wvalue toJson(const NewsEntity& n) {
        crow::json::wvalue j;
        j["id"]        = std::to_string(n.id);
        j["title"]      = n.title;
        j["summary"]    = n.summary;
        j["content"]    = n.content;
        j["date"]       = n.date;
        j["category"]   = n.category;
        j["imageUrl"]   = n.imageUrl;
        j["views"]      = n.views;
        return j;
    }

    static crow::response withCors(crow::response res) {
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json; charset=utf-8");
        return res;
    }

public:
    crow::response getAll() {
        auto list = model.getAll();
        crow::json::wvalue arr = crow::json::wvalue::list();
        for (size_t i = 0; i < list.size(); ++i) arr[i] = toJson(list[i]);
        return withCors(crow::response(200, arr));
    }

    crow::response create(const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body) return withCors(crow::response(400, R"({"error":"JSON không hợp lệ"})"));

        NewsEntity n;
        n.title     = body.has("title") ? body["title"].s() : std::string("");
        n.summary   = body.has("summary") ? body["summary"].s() : std::string("");
        n.content   = body.has("content") ? body["content"].s() : std::string("");
        n.category  = body.has("category") ? body["category"].s() : std::string("Sự Kiện");
        n.imageUrl  = body.has("imageUrl") ? body["imageUrl"].s() : std::string("");

        int newId = 0;
        if (!model.add(n, newId)) {
            return withCors(crow::response(500, R"({"error":"Không thể thêm tin tức"})"));
        }
        n.id = newId;
        return withCors(crow::response(201, toJson(n)));
    }

    crow::response remove(int id) {
        if (!model.remove(id)) {
            return withCors(crow::response(404, R"({"error":"Không tìm thấy tin tức"})"));
        }
        return withCors(crow::response(200, R"({"success":true})"));
    }

    crow::response incrementViews(int id) {
        model.incrementViews(id);
        return withCors(crow::response(200, R"({"success":true})"));
    }
};

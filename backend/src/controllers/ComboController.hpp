#pragma once
#include "crow.h"
#include "../models/ComboModel.hpp"

// ============================================================================
//  GET    /api/combos
//  POST   /api/combos
//  DELETE /api/combos/:id
// ============================================================================

class ComboController {
private:
    ComboModel model;

    static crow::json::wvalue toJson(const ComboEntity& c) {
        crow::json::wvalue j;
        j["id"]          = std::to_string(c.id);
        j["name"]         = c.name;
        j["description"]  = c.description;
        j["price"]         = c.price;
        j["imageUrl"]      = c.imageUrl;
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

        ComboEntity c;
        c.name        = body.has("name") ? body["name"].s() : std::string("");
        c.description = body.has("description") ? body["description"].s() : std::string("");
        c.price       = body.has("price") ? body["price"].d() : 0;
        c.imageUrl    = body.has("imageUrl") ? body["imageUrl"].s() : std::string("");

        int newId = 0;
        if (!model.add(c, newId)) {
            return withCors(crow::response(500, R"({"error":"Không thể thêm combo"})"));
        }
        c.id = newId;
        return withCors(crow::response(201, toJson(c)));
    }

    crow::response remove(int id) {
        if (!model.remove(id)) {
            return withCors(crow::response(404, R"({"error":"Không tìm thấy combo"})"));
        }
        return withCors(crow::response(200, R"({"success":true})"));
    }
};

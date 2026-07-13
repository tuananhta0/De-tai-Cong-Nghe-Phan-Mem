#pragma once
#include "crow.h"
#include "../models/PromotionModel.hpp"

// ============================================================================
//  GET    /api/promotions
//  POST   /api/promotions
//  DELETE /api/promotions/:id
//  GET    /api/promotions/validate/:code
// ============================================================================

class PromotionController {
private:
    PromotionModel model;

    static crow::json::wvalue toJson(const PromotionEntity& p) {
        crow::json::wvalue j;
        j["id"]              = std::to_string(p.id);
        j["title"]            = p.title;
        j["description"]      = p.description;
        j["code"]              = p.code;
        j["discountPercent"]   = p.discountPercent;
        j["validity"]          = p.validity;
        j["imageUrl"]          = p.imageUrl;
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

        PromotionEntity p;
        p.title           = body.has("title") ? body["title"].s() : std::string("");
        p.description     = body.has("description") ? body["description"].s() : std::string("");
        p.code             = body.has("code") ? body["code"].s() : std::string("");
        p.discountPercent  = body.has("discountPercent") ? body["discountPercent"].i() : 0;
        p.validity         = body.has("validity") ? body["validity"].s() : std::string("");
        p.imageUrl         = body.has("imageUrl") ? body["imageUrl"].s() : std::string("");

        int newId = 0;
        if (!model.add(p, newId)) {
            return withCors(crow::response(500, "{\"error\":\"Không thể thêm khuyến mãi, mã code có thể đã tồn tại\"}"));
        }
        p.id = newId;
        return withCors(crow::response(201, toJson(p)));
    }

    crow::response remove(int id) {
        if (!model.remove(id)) {
            return withCors(crow::response(404, R"({"error":"Không tìm thấy khuyến mãi"})"));
        }
        return withCors(crow::response(200, R"({"success":true})"));
    }

    crow::response validateCode(const std::string& code) {
        int discount = model.validateCode(code);
        crow::json::wvalue j;
        j["valid"] = discount > 0;
        j["discountPercent"] = discount;
        return withCors(crow::response(200, j));
    }
};

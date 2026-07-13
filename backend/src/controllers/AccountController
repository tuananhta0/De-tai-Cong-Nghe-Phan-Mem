#pragma once
#include "crow.h"
#include "../models/AccountModel.hpp"
#include <random>

// ============================================================================
//  AccountController.hpp
//  POST /api/accounts/login
//  POST /api/accounts/register
//  GET  /api/accounts/:email
//  PUT  /api/accounts/:email
//  GET  /api/accounts            (admin: danh sách toàn bộ tài khoản)
// ============================================================================

class AccountController {
private:
    AccountModel model;

    static crow::json::wvalue toJson(const AccountEntity& a) {
        crow::json::wvalue j;
        j["name"]           = a.name;
        j["email"]           = a.email;
        j["phone"]           = a.phone;
        j["avatar"]          = a.avatar;
        j["membershipId"]    = a.membershipId;
        j["points"]          = a.points;
        j["favoriteMovies"]  = a.favoriteMovies;
        j["role"]            = a.role;
        return j;
    }

    static crow::response withCors(crow::response res) {
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json; charset=utf-8");
        return res;
    }

    static std::string generateMembershipId() {
        static std::random_device rd;
        static std::mt19937 gen(rd());
        std::uniform_int_distribution<> dist(10000, 99999);
        return "X-" + std::to_string(dist(gen));
    }

public:
    crow::response login(const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body || !body.has("emailOrPhone") || !body.has("password")) {
            return withCors(crow::response(400, R"({"error":"Thiếu emailOrPhone hoặc password"})"));
        }

        std::string emailOrPhone = body["emailOrPhone"].s();
        std::string password     = body["password"].s();

        std::string role = model.login(emailOrPhone, password);
        if (role.empty()) {
            return withCors(crow::response(401, R"({"error":"Sai email/số điện thoại hoặc mật khẩu"})"));
        }

        AccountEntity acc;
        // Sau khi xác thực thành công, tra lại theo email nếu emailOrPhone là email;
        // nếu là số điện thoại, ta vẫn cần trả hồ sơ đầy đủ - tìm bằng cả 2 cách.
        if (!model.findByEmail(emailOrPhone, acc)) {
            // Trường hợp đăng nhập bằng số điện thoại: trả tối thiểu role để frontend tiếp tục,
            // FE chỉ cần gọi GET /api/accounts/:email sau đó nếu cần đầy đủ hồ sơ.
            crow::json::wvalue j;
            j["role"] = role;
            j["email"] = emailOrPhone;
            return withCors(crow::response(200, j));
        }

        return withCors(crow::response(200, toJson(acc)));
    }

    crow::response registerAccount(const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body || !body.has("email") || !body.has("password") || !body.has("name")) {
            return withCors(crow::response(400, R"({"error":"Thiếu name/email/password"})"));
        }

        std::string email = body["email"].s();

        AccountEntity existing;
        if (model.findByEmail(email, existing)) {
            return withCors(crow::response(409, R"({"error":"Email đã được sử dụng"})"));
        }

        AccountEntity acc;
        acc.name         = body["name"].s();
        acc.email         = email;
        acc.phone         = body.has("phone") ? body["phone"].s() : std::string("");
        acc.avatar        = body.has("avatar") ? body["avatar"].s()
                              : ("https://api.dicebear.com/7.x/bottts/svg?seed=" + email);
        acc.membershipId  = generateMembershipId();
        acc.points        = 0;
        acc.role          = "customer";

        std::string password = body["password"].s();
        if (!model.registerAccount(acc, password)) {
            // SQL error 2627/2601 = UNIQUE constraint (email hoặc phone trùng)
            return withCors(crow::response(409, R"({"error":"Số điện thoại hoặc email đã được sử dụng"})"));
        }

        return withCors(crow::response(201, toJson(acc)));
    }

    crow::response getByEmail(const std::string& email) {
        AccountEntity acc;
        if (!model.findByEmail(email, acc)) {
            return withCors(crow::response(404, R"({"error":"Không tìm thấy tài khoản"})"));
        }
        return withCors(crow::response(200, toJson(acc)));
    }

    crow::response updateProfile(const std::string& email, const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body) return withCors(crow::response(400, R"({"error":"JSON không hợp lệ"})"));

        AccountEntity acc;
        if (!model.findByEmail(email, acc)) {
            return withCors(crow::response(404, R"({"error":"Không tìm thấy tài khoản"})"));
        }

        if (body.has("name"))   acc.name  = body["name"].s();
        if (body.has("phone"))  acc.phone = body["phone"].s();
        if (body.has("avatar")) acc.avatar = body["avatar"].s();
        if (body.has("points")) acc.points = body["points"].i();
        if (body.has("favoriteMovies")) {
            acc.favoriteMovies.clear();
            for (const auto& m : body["favoriteMovies"]) acc.favoriteMovies.push_back(m.s());
        }

        if (!model.updateProfile(acc)) {
            return withCors(crow::response(500, R"({"error":"Không thể cập nhật hồ sơ"})"));
        }
        return withCors(crow::response(200, toJson(acc)));
    }

    crow::response getAll() {
        auto list = model.getAllAccounts();
        crow::json::wvalue arr = crow::json::wvalue::list();
        for (size_t i = 0; i < list.size(); ++i) arr[i] = toJson(list[i]);
        return withCors(crow::response(200, arr));
    }
};

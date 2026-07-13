#pragma once
#include "crow.h"
#include <string>
#include <vector>
#include <algorithm>

// ============================================================================
//  AuthGuard.hpp
//  Kiểm tra quyền truy cập đơn giản dựa trên header "x-user-role" mà frontend
//  gửi kèm mọi request quản trị (xem services/api.ts -> getSecurityHeaders()).
//
//  LƯU Ý: đây là cơ chế phân quyền ở mức ứng dụng (application-level), KHÔNG
//  thay thế cho xác thực mật khẩu/JWT thật. Header có thể bị giả mạo nếu ai
//  đó tự gọi thẳng API bằng Postman/curl. Mục đích chính là chặn việc giao
//  diện Admin/Staff vô tình gọi nhầm hành động khi chưa đăng nhập đúng vai
//  trò, và làm nền tảng để sau này nâng cấp lên JWT/session thật nếu cần.
// ============================================================================

namespace AuthGuard {

    // Đọc giá trị header "x-user-role" (không phân biệt hoa/thường do Crow tự
    // lowercase tên header khi tra cứu).
    inline std::string getRole(const crow::request& req) {
        auto it = req.headers.find("x-user-role");
        if (it != req.headers.end()) return it->second;
        return "";
    }

    inline std::string getEmail(const crow::request& req) {
        auto it = req.headers.find("x-user-email");
        if (it != req.headers.end()) return it->second;
        return "";
    }

    // Kiểm tra role hiện tại có thuộc danh sách được phép không.
    inline bool isAllowed(const crow::request& req, const std::vector<std::string>& allowedRoles) {
        std::string role = getRole(req);
        return std::find(allowedRoles.begin(), allowedRoles.end(), role) != allowedRoles.end();
    }

    // Response 403 chuẩn, đã kèm CORS header (giống các response khác trong app
    // để không bị browser chặn vì thiếu Access-Control-Allow-Origin).
    inline crow::response forbidden(const std::string& msg = "Bạn không có quyền thực hiện hành động này.") {
        crow::json::wvalue j;
        j["error"] = msg;
        crow::response res(403, j);
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json; charset=utf-8");
        return res;
    }

    // Tiện ích dùng ngay trong route: trả early-return nếu không đủ quyền.
    // Cách dùng trong main.cpp:
    //     if (!AuthGuard::isAllowed(req, {"admin"})) return AuthGuard::forbidden();
    inline bool requireRole(const crow::request& req, const std::vector<std::string>& allowedRoles,
                             crow::response& outForbidden) {
        if (isAllowed(req, allowedRoles)) return true;
        outForbidden = forbidden();
        return false;
    }
}

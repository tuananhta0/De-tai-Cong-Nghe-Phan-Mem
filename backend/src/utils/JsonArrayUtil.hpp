#pragma once
#include "crow.h"
#include <string>
#include <vector>

// ============================================================================
//  JsonArrayUtil.hpp
//  Tiện ích nhỏ để chuyển đổi giữa std::vector<std::string> <-> chuỗi JSON
//  text (lưu trong các cột NVARCHAR(MAX) như CastJson, FavoriteMoviesJson,
//  SeatsJson...). Dùng chung crow::json để khỏi phụ thuộc thêm thư viện.
// ============================================================================

namespace JsonArrayUtil {

    // ["A", "B", "C"] (JSON text) -> vector<string>
    inline std::vector<std::string> parseStringArray(const std::string& jsonText) {
        std::vector<std::string> result;
        if (jsonText.empty()) return result;
        auto parsed = crow::json::load(jsonText);
        if (!parsed || parsed.t() != crow::json::type::List) return result;
        for (const auto& item : parsed) {
            result.push_back(item.s());
        }
        return result;
    }

    // vector<string> -> "[\"A\",\"B\"]" (JSON text để lưu DB)
    inline std::string toJsonArray(const std::vector<std::string>& items) {
        crow::json::wvalue arr = crow::json::wvalue::list();
        for (size_t i = 0; i < items.size(); ++i) {
            arr[i] = items[i];
        }
        return arr.dump();
    }

    // Đọc 1 trường "genre" lưu dạng "Hành động, Phiêu lưu" (phân tách bởi dấu phẩy)
    // thành vector<string>, dùng cho cột Genre kiểu NVARCHAR thường (không phải JSON).
    inline std::vector<std::string> splitByComma(const std::string& text) {
        std::vector<std::string> result;
        std::string current;
        for (char c : text) {
            if (c == ',') {
                // trim khoảng trắng đầu/cuối
                size_t start = current.find_first_not_of(" \t");
                size_t end = current.find_last_not_of(" \t");
                if (start != std::string::npos) result.push_back(current.substr(start, end - start + 1));
                current.clear();
            } else {
                current += c;
            }
        }
        if (!current.empty()) {
            size_t start = current.find_first_not_of(" \t");
            size_t end = current.find_last_not_of(" \t");
            if (start != std::string::npos) result.push_back(current.substr(start, end - start + 1));
        }
        return result;
    }

    inline std::string joinByComma(const std::vector<std::string>& items) {
        std::string result;
        for (size_t i = 0; i < items.size(); ++i) {
            if (i > 0) result += ", ";
            result += items[i];
        }
        return result;
    }
}

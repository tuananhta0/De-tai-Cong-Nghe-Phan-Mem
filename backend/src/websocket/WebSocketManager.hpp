#pragma once
#include "crow.h"
#include <unordered_map>
#include <unordered_set>
#include <mutex>
#include <string>

// ============================================================================
//  WebSocketManager.hpp
//  Quản lý toàn bộ kết nối WebSocket đang mở, chia thành 2 nhóm:
//   - "showtime:<id>"  : client đang xem sơ đồ ghế của 1 suất chiếu cụ thể,
//                        nhận thông báo khi có ghế bị khóa/đặt trong suất đó.
//   - "admin"          : client là Admin/Staff Portal đang mở, nhận thông
//                        báo khi có đơn đặt vé mới ở bất kỳ suất chiếu nào.
//
//  Thread-safe bằng std::mutex vì Crow xử lý đa luồng (multithreaded()).
// ============================================================================

class WebSocketManager {
public:
    static WebSocketManager& instance() {
        static WebSocketManager mgr;
        return mgr;
    }

    // Gọi khi 1 connection mới mở (onopen), chưa biết nó thuộc nhóm nào.
    void registerConnection(crow::websocket::connection* conn) {
        std::lock_guard<std::mutex> lock(mutex_);
        allConnections_.insert(conn);
    }

    // Gọi khi nhận message "subscribe_showtime" từ client, gán connection vào nhóm.
    void subscribeShowtime(crow::websocket::connection* conn, const std::string& showtimeId) {
        std::lock_guard<std::mutex> lock(mutex_);
        // 1 connection chỉ theo dõi 1 suất chiếu tại 1 thời điểm: gỡ khỏi nhóm cũ trước
        removeFromAllShowtimeGroups(conn);
        showtimeGroups_["showtime:" + showtimeId].insert(conn);
        connToShowtime_[conn] = showtimeId;
    }

    // Gọi khi nhận message "subscribe_admin" (Admin/Staff Portal mở trang quản trị)
    void subscribeAdmin(crow::websocket::connection* conn) {
        std::lock_guard<std::mutex> lock(mutex_);
        adminGroup_.insert(conn);
    }

    // Gọi khi connection đóng (onclose), dọn dẹp khỏi mọi nhóm.
    void unregisterConnection(crow::websocket::connection* conn) {
        std::lock_guard<std::mutex> lock(mutex_);
        allConnections_.erase(conn);
        adminGroup_.erase(conn);
        removeFromAllShowtimeGroups(conn);
        connToShowtime_.erase(conn);
    }

    // Gửi sự kiện JSON tới mọi client đang xem 1 suất chiếu cụ thể
    // (vd: ghế A1 vừa bị khóa/đặt -> những người khác đang xem cùng suất thấy ngay).
    void broadcastToShowtime(const std::string& showtimeId, const std::string& jsonMessage) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = showtimeGroups_.find("showtime:" + showtimeId);
        if (it == showtimeGroups_.end()) return;
        for (auto* conn : it->second) {
            conn->send_text(jsonMessage);
        }
    }

    // Gửi sự kiện JSON tới mọi Admin/Staff Portal đang mở (vd: có đơn đặt vé mới).
    void broadcastToAdmins(const std::string& jsonMessage) {
        std::lock_guard<std::mutex> lock(mutex_);
        for (auto* conn : adminGroup_) {
            conn->send_text(jsonMessage);
        }
    }

private:
    std::mutex mutex_;
    std::unordered_set<crow::websocket::connection*> allConnections_;
    std::unordered_set<crow::websocket::connection*> adminGroup_;
    std::unordered_map<std::string, std::unordered_set<crow::websocket::connection*>> showtimeGroups_;
    std::unordered_map<crow::websocket::connection*, std::string> connToShowtime_;

    // Gỡ 1 connection khỏi nhóm showtime nó đang theo dõi (nếu có). Hàm nội bộ,
    // gọi khi đã giữ mutex_ rồi (không tự lock lại để tránh deadlock).
    void removeFromAllShowtimeGroups(crow::websocket::connection* conn) {
        auto mapIt = connToShowtime_.find(conn);
        if (mapIt == connToShowtime_.end()) return;
        auto groupIt = showtimeGroups_.find("showtime:" + mapIt->second);
        if (groupIt != showtimeGroups_.end()) {
            groupIt->second.erase(conn);
        }
    }
};

#pragma once
#include "crow.h"
#include "../models/BookingModel.hpp"
#include "../models/ComboModel.hpp"
#include "../websocket/WebSocketManager.hpp"
#include <chrono>
#include <ctime>
#include <algorithm>

// ============================================================================
//  BookingController.hpp
//  GET  /api/seats/:showtimeId          -> trạng thái ghế của 1 suất chiếu
//  POST /api/seats/lock                 -> giữ chỗ tạm 1 ghế (body: showtimeId, seatName)
//  POST /api/bookings                   -> tạo vé (thanh toán xong)
//  GET  /api/bookings/user/:email       -> lịch sử vé của khách hàng
//  GET  /api/bookings                   -> toàn bộ vé (admin/employee)
//  PUT  /api/bookings/:code/checkin     -> nhân viên xác nhận khách đã vào rạp
//  PUT  /api/bookings/:code/combo       -> nhân viên xác nhận đã giao bắp nước
// ============================================================================

class BookingController {
private:
    BookingModel model;
    ComboModel comboModel;

    static crow::json::wvalue seatToJson(const SeatEntity& s) {
        crow::json::wvalue j;
        j["showtimeSeatId"] = s.showtimeSeatId;
        j["seatName"]        = s.seatName;
        j["seatType"]        = s.seatType;
        j["status"]          = s.status;
        return j;
    }

    static crow::json::wvalue comboLineToJson(const ComboLineItem& c) {
        crow::json::wvalue j;
        j["id"] = c.id;
        j["name"] = c.name;
        j["price"] = c.price;
        j["quantity"] = c.quantity;
        return j;
    }

    static crow::json::wvalue bookingToJson(const BookingEntity& b) {
        crow::json::wvalue j;
        j["id"]              = b.id;
        j["code"]             = b.code;
        j["movieTitle"]       = b.movieTitle;
        j["moviePoster"]      = b.moviePoster;
        j["cinemaName"]       = b.cinemaName;
        j["showDate"]         = b.showDate;
        j["showTime"]         = b.showTime;
        j["room"]             = b.room;
        j["format"]           = b.format;
        j["seats"]            = b.seats;
        j["totalAmount"]      = b.totalAmount;
        j["paymentMethod"]    = b.paymentMethod;
        j["qrCodeUrl"]        = b.qrCodeUrl;
        j["bookingTime"]      = b.bookingTime;
        j["isCheckedIn"]      = b.isCheckedIn;
        j["isComboRedeemed"]  = b.isComboRedeemed;
        j["userEmail"]        = b.userEmail;   // cần để frontend filter lịch sử theo tài khoản

        crow::json::wvalue combosArr = crow::json::wvalue::list();
        for (size_t i = 0; i < b.combos.size(); ++i) combosArr[i] = comboLineToJson(b.combos[i]);
        j["combos"] = std::move(combosArr);

        return j;
    }

    static crow::response withCors(crow::response res) {
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json; charset=utf-8");
        return res;
    }

public:
    crow::response getSeats(int showtimeId) {
        auto seats = model.getSeatsByShowtime(showtimeId);
        crow::json::wvalue arr = crow::json::wvalue::list();
        for (size_t i = 0; i < seats.size(); ++i) arr[i] = seatToJson(seats[i]);
        return withCors(crow::response(200, arr));
    }

    crow::response lockSeat(const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body || !body.has("showtimeId") || !body.has("seatName")) {
            return withCors(crow::response(400, R"({"error":"Thiếu showtimeId hoặc seatName"})"));
        }

        int showtimeId = std::stoi(body["showtimeId"].s());
        std::string seatName = body["seatName"].s();

        int ssId = model.findShowtimeSeatId(showtimeId, seatName);
        if (ssId == 0) {
            return withCors(crow::response(404, R"({"error":"Không tìm thấy ghế"})"));
        }

        if (!model.tryLockSeat(ssId)) {
            return withCors(crow::response(409, R"({"error":"Ghế đã được người khác giữ hoặc đặt"})"));
        }

        // Báo real-time cho mọi người khác đang xem cùng suất chiếu: ghế này vừa bị khóa.
        crow::json::wvalue wsEvent;
        wsEvent["type"] = "seat_locked";
        wsEvent["showtimeId"] = std::to_string(showtimeId);
        wsEvent["seatName"] = seatName;
        WebSocketManager::instance().broadcastToShowtime(std::to_string(showtimeId), wsEvent.dump());

        crow::json::wvalue res;
        res["success"] = true;
        res["showtimeSeatId"] = ssId;
        return withCors(crow::response(200, res));
    }

    crow::response createBooking(const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body) return withCors(crow::response(400, R"({"error":"JSON không hợp lệ"})"));

        int showtimeId = body.has("showtimeId") ? std::stoi(body["showtimeId"].s()) : 0;
        if (showtimeId == 0) {
            return withCors(crow::response(400, R"({"error":"Thiếu showtimeId"})"));
        }

        BookingEntity b;
        b.movieTitle    = body.has("movieTitle") ? body["movieTitle"].s() : std::string("");
        b.moviePoster   = body.has("moviePoster") ? body["moviePoster"].s() : std::string("");
        b.cinemaName    = body.has("cinemaName") ? body["cinemaName"].s() : std::string("");
        b.showDate      = body.has("showDate") ? body["showDate"].s() : std::string("");
        b.showTime      = body.has("showTime") ? body["showTime"].s() : std::string("");
        b.room          = body.has("room") ? body["room"].s() : std::string("");
        b.format        = body.has("format") ? body["format"].s() : std::string("");
        b.totalAmount   = body.has("totalAmount") ? body["totalAmount"].d() : 0;
        b.paymentMethod = body.has("paymentMethod") ? body["paymentMethod"].s() : std::string("");
        b.qrCodeUrl     = body.has("qrCodeUrl") ? body["qrCodeUrl"].s() : std::string("");
        b.userEmail     = body.has("userEmail") ? body["userEmail"].s() : std::string("");

        std::vector<int> showtimeSeatIds;
        if (body.has("seats")) {
            for (const auto& seatNameJson : body["seats"]) {
                std::string seatName = seatNameJson.s();
                b.seats.push_back(seatName);
                int ssId = model.findShowtimeSeatId(showtimeId, seatName);
                if (ssId > 0) showtimeSeatIds.push_back(ssId);
            }
        }
        if (b.seats.empty()) {
            return withCors(crow::response(400, R"({"error":"Vé phải có ít nhất 1 ghế"})"));
        }

        // Tra cứu name/price thật của từng combo theo ID để lưu "snapshot" đầy đủ vào vé
        // (đảm bảo vé vẫn hiển thị đúng giá đã mua dù sau này Admin đổi giá combo).
        if (body.has("combos")) {
            auto allCombos = comboModel.getAll();
            for (const auto& c : body["combos"]) {
                std::string comboId = c.has("id") ? c["id"].s() : std::string("");
                int qty = c.has("quantity") ? c["quantity"].i() : 1;
                if (comboId.empty()) continue;

                auto it = std::find_if(allCombos.begin(), allCombos.end(),
                                        [&](const ComboEntity& ce) { return std::to_string(ce.id) == comboId; });
                if (it != allCombos.end()) {
                    ComboLineItem line;
                    line.id = comboId;
                    line.name = it->name;
                    line.price = it->price;
                    line.quantity = qty;
                    b.combos.push_back(line);
                }
            }
        }

        std::string outCode;
        if (!model.createBooking(b, showtimeId, showtimeSeatIds, outCode)) {
            return withCors(crow::response(500, "{\"error\":\"Không thể tạo vé, ghế có thể đã được đặt\"}"));
        }

        b.code = outCode;
        b.id = outCode;
        // bookingTime được DB set tự động (DEFAULT GETDATE()), nhưng cần set ở đây
        // để bookingToJson trả về đúng cho frontend ngay lập tức sau khi tạo vé.
        if (b.bookingTime.empty()) {
            auto now = std::chrono::system_clock::now();
            auto t = std::chrono::system_clock::to_time_t(now);
            char buf[32];
            std::strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S", std::gmtime(&t));
            b.bookingTime = std::string(buf);
        }
        auto bookingJson = bookingToJson(b);

        // Báo real-time cho người khác đang xem cùng suất chiếu: các ghế này đã bán xong.
        crow::json::wvalue seatEvent;
        seatEvent["type"] = "seats_booked";
        seatEvent["showtimeId"] = std::to_string(showtimeId);
        seatEvent["seats"] = b.seats;
        WebSocketManager::instance().broadcastToShowtime(std::to_string(showtimeId), seatEvent.dump());

        // Báo real-time cho Admin/Staff Portal đang mở: vừa có đơn đặt vé mới.
        crow::json::wvalue adminEvent;
        adminEvent["type"] = "new_booking";
        adminEvent["booking"] = bookingToJson(b);
        WebSocketManager::instance().broadcastToAdmins(adminEvent.dump());

        return withCors(crow::response(201, bookingJson));
    }

    crow::response getBookingsByUser(const std::string& email) {
        auto list = model.getBookingsByEmail(email);
        crow::json::wvalue arr = crow::json::wvalue::list();
        for (size_t i = 0; i < list.size(); ++i) arr[i] = bookingToJson(list[i]);
        return withCors(crow::response(200, arr));
    }

    crow::response getAllBookings() {
        auto list = model.getAllBookings();
        crow::json::wvalue arr = crow::json::wvalue::list();
        for (size_t i = 0; i < list.size(); ++i) arr[i] = bookingToJson(list[i]);
        return withCors(crow::response(200, arr));
    }

    crow::response setCheckedIn(const std::string& code, const crow::request& req) {
        auto body = crow::json::load(req.body);
        bool isCheckedIn = (body && body.has("isCheckedIn")) ? body["isCheckedIn"].b() : true;

        if (!model.setCheckedIn(code, isCheckedIn)) {
            return withCors(crow::response(404, R"({"error":"Không tìm thấy vé"})"));
        }

        crow::json::wvalue adminEvent;
        adminEvent["type"] = "booking_updated";
        adminEvent["code"] = code;
        adminEvent["isCheckedIn"] = isCheckedIn;
        WebSocketManager::instance().broadcastToAdmins(adminEvent.dump());

        return withCors(crow::response(200, R"({"success":true})"));
    }

    crow::response setComboRedeemed(const std::string& code, const crow::request& req) {
        auto body = crow::json::load(req.body);
        bool isRedeemed = (body && body.has("isComboRedeemed")) ? body["isComboRedeemed"].b() : true;

        if (!model.setComboRedeemed(code, isRedeemed)) {
            return withCors(crow::response(404, R"({"error":"Không tìm thấy vé"})"));
        }

        crow::json::wvalue adminEvent;
        adminEvent["type"] = "booking_updated";
        adminEvent["code"] = code;
        adminEvent["isComboRedeemed"] = isRedeemed;
        WebSocketManager::instance().broadcastToAdmins(adminEvent.dump());

        return withCors(crow::response(200, R"({"success":true})"));
    }

    crow::response getRevenue() {
        crow::json::wvalue j;
        j["revenue"] = model.getRevenue();
        return withCors(crow::response(200, j));
    }
};

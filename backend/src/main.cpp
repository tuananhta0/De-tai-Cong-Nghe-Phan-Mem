#include "crow.h"
#include <sstream>
#ifdef DELETE
#undef DELETE
#endif
// 1. Tầng DATABASE
#include "database/Database.hpp"

// 2. Tầng MODELS
#include "models/MovieModel.hpp"
#include "models/CinemaModel.hpp"
#include "models/BookingModel.hpp"
#include "models/AccountModel.hpp"
#include "models/PromotionModel.hpp"
#include "models/NewsModel.hpp"
#include "models/ComboModel.hpp"

// 3. Tầng CONTROLLERS
#include "controllers/MovieController.hpp"
#include "controllers/CinemaController.hpp"
#include "controllers/BookingController.hpp"
#include "controllers/AccountController.hpp"
#include "controllers/PromotionController.hpp"
#include "controllers/NewsController.hpp"
#include "controllers/ComboController.hpp"

// 3b. PHÂN QUYỀN (kiểm tra header x-user-role do frontend gửi)
#include "utils/AuthGuard.hpp"

// 4. WEBSOCKET (real-time: sơ đồ ghế + thông báo Admin)
#include "websocket/WebSocketManager.hpp"

#include <mutex>
#include <iostream>

std::mutex g_booking_mutex; // dùng khi cần khóa luồng cho các thao tác đặt vé đồng thời

// Trả response rỗng kèm header CORS cho mọi preflight request (OPTIONS) - cần thiết vì
// frontend Vite (port 3000/5173) và backend Crow (port 8080) khác origin nhau.
crow::response corsPreflight() {
    crow::response res(204);
    res.add_header("Access-Control-Allow-Origin", "*");
    res.add_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    // Thêm x-user-role/x-user-email vì giờ frontend gửi kèm các header này ở
    // mọi request quản trị (xem services/api.ts -> getSecurityHeaders()).
    // Thiếu dòng này thì trình duyệt sẽ chặn ngay từ bước preflight, dẫn đến
    // lỗi CORS dù backend hoàn toàn đúng.
    res.add_header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-user-role, x-user-email");
    return res;
}

int main() {
    crow::SimpleApp app;

    MovieController movieCtrl;
    CinemaController cinemaCtrl;
    BookingController bookingCtrl;
    AccountController accountCtrl;
    PromotionController promoCtrl;
    NewsController newsCtrl;
    ComboController comboCtrl;

    // =====================================================================
    //  WEBSOCKET (REAL-TIME): sơ đồ ghế + thông báo Admin
    //  Client kết nối ws://localhost:8080/ws rồi gửi 1 trong 2 message JSON:
    //    {"type":"subscribe_showtime","showtimeId":"5"}  -> theo dõi 1 suất chiếu
    //    {"type":"subscribe_admin"}                       -> theo dõi mọi đơn đặt vé mới
    //  Server gửi lại các sự kiện: seat_locked, seats_booked, new_booking, booking_updated.
    // =====================================================================
    CROW_WEBSOCKET_ROUTE(app, "/ws")
    .onopen([](crow::websocket::connection& conn) {
        WebSocketManager::instance().registerConnection(&conn);
    })
    .onclose([](crow::websocket::connection& conn, const std::string& reason, uint16_t) {
        WebSocketManager::instance().unregisterConnection(&conn);
    })
    .onmessage([](crow::websocket::connection& conn, const std::string& data, bool is_binary) {
        if (is_binary) return;

        auto body = crow::json::load(data);
        if (!body || !body.has("type")) return;

        std::string type = body["type"].s();
        if (type == "subscribe_showtime" && body.has("showtimeId")) {
            std::string showtimeId = body["showtimeId"].s();
            WebSocketManager::instance().subscribeShowtime(&conn, showtimeId);
        } else if (type == "subscribe_admin") {
            WebSocketManager::instance().subscribeAdmin(&conn);
        }
    });

    // =====================================================================
    //  PHIM (MOVIES)
    // =====================================================================
    CROW_ROUTE(app, "/api/movies").methods(crow::HTTPMethod::GET, crow::HTTPMethod::OPTIONS)
    ([&movieCtrl](const crow::request& req) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        return movieCtrl.getAll();
    });

    CROW_ROUTE(app, "/api/movies/<int>").methods(crow::HTTPMethod::GET, crow::HTTPMethod::PUT, crow::HTTPMethod::DELETE, crow::HTTPMethod::OPTIONS)
    ([&movieCtrl](const crow::request& req, int id) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        if (req.method == crow::HTTPMethod::PUT) {
            if (!AuthGuard::isAllowed(req, {"admin"})) return AuthGuard::forbidden();
            return movieCtrl.update(id, req);
        }
        if (req.method == crow::HTTPMethod::DELETE) {
            if (!AuthGuard::isAllowed(req, {"admin"})) return AuthGuard::forbidden();
            return movieCtrl.remove(id);
        }
        return movieCtrl.getById(id);
    });

    CROW_ROUTE(app, "/api/movies").methods(crow::HTTPMethod::POST)
    ([&movieCtrl](const crow::request& req) {
        if (!AuthGuard::isAllowed(req, {"admin"})) return AuthGuard::forbidden();
        return movieCtrl.create(req);
    });

    // =====================================================================
    //  CỤM RẠP (CINEMAS)
    // =====================================================================
    CROW_ROUTE(app, "/api/cinemas").methods(crow::HTTPMethod::GET, crow::HTTPMethod::OPTIONS)
    ([&cinemaCtrl](const crow::request& req) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        return cinemaCtrl.getAllCinemas();
    });

    // =====================================================================
    //  SUẤT CHIẾU (SHOWTIMES)
    // =====================================================================
    CROW_ROUTE(app, "/api/showtimes").methods(crow::HTTPMethod::GET, crow::HTTPMethod::POST, crow::HTTPMethod::OPTIONS)
    ([&cinemaCtrl](const crow::request& req) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        if (req.method == crow::HTTPMethod::POST) {
            if (!AuthGuard::isAllowed(req, {"admin"})) return AuthGuard::forbidden();
            return cinemaCtrl.createShowtime(req);
        }
        return cinemaCtrl.getAllShowtimes();
    });

    CROW_ROUTE(app, "/api/showtimes/movie/<int>")
    ([&cinemaCtrl](int movieId) { return cinemaCtrl.getShowtimesByMovie(movieId); });

    CROW_ROUTE(app, "/api/showtimes/<int>").methods(crow::HTTPMethod::DELETE, crow::HTTPMethod::OPTIONS)
    ([&cinemaCtrl](const crow::request& req, int id) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        if (!AuthGuard::isAllowed(req, {"admin"})) return AuthGuard::forbidden();
        return cinemaCtrl.deleteShowtime(id);
    });

    // =====================================================================
    //  GHẾ & ĐẶT VÉ (SEATS & BOOKINGS)
    // =====================================================================
    // QUAN TRỌNG: /api/seats/lock phải đăng ký TRƯỚC /api/seats/<int>.
    // Nếu ngược lại, Crow sẽ parse "lock" như 1 số nguyên, route sai,
    // trả 404 cho mọi lần gọi POST /api/seats/lock.
    CROW_ROUTE(app, "/api/seats/lock").methods(crow::HTTPMethod::POST, crow::HTTPMethod::OPTIONS)
    ([&bookingCtrl](const crow::request& req) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        std::lock_guard<std::mutex> lock(g_booking_mutex);
        auto res = bookingCtrl.lockSeat(req);

        // Khóa ghế thành công (HTTP 200) -> báo real-time cho mọi người khác đang
        // xem cùng suất chiếu này biết ghế vừa bị giữ chỗ, để họ thấy ngay không
        // cần load lại trang.
        if (res.code == 200) {
            auto body = crow::json::load(req.body);
            if (body && body.has("showtimeId") && body.has("seatName")) {
                crow::json::wvalue evt;
                evt["type"] = "seat_locked";
                evt["showtimeId"] = body["showtimeId"].s();
                evt["seatName"] = body["seatName"].s();
                WebSocketManager::instance().broadcastToShowtime(body["showtimeId"].s(), evt.dump());
            }
        }
        return res;
    });

    CROW_ROUTE(app, "/api/seats/<int>")
    ([&bookingCtrl](int showtimeId) { return bookingCtrl.getSeats(showtimeId); });

    CROW_ROUTE(app, "/api/bookings").methods(crow::HTTPMethod::GET, crow::HTTPMethod::POST, crow::HTTPMethod::OPTIONS)
    ([&bookingCtrl](const crow::request& req) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        if (req.method == crow::HTTPMethod::POST) {
            std::lock_guard<std::mutex> lock(g_booking_mutex);
            auto res = bookingCtrl.createBooking(req);
            // BookingController.createBooking() đã tự broadcast real-time:
            //   1. "seats_booked" -> toàn bộ client đang xem cùng suất chiếu
            //   2. "new_booking"  -> Admin/Staff Portal
            // Không broadcast thêm ở đây để tránh event trùng lặp.
            return res;
        }
        if (!AuthGuard::isAllowed(req, {"admin", "employee"})) return AuthGuard::forbidden();
        return bookingCtrl.getAllBookings();
    });

    CROW_ROUTE(app, "/api/bookings/user/<string>")
    ([&bookingCtrl](std::string email) {
        // Decode URL encoding (%40 -> @) vì Crow không tự decode path params.
        std::string decoded;
        decoded.reserve(email.size());
        for (size_t i = 0; i < email.size(); ++i) {
            if (email[i] == '%' && i + 2 < email.size()) {
                int val = 0;
                std::istringstream iss(email.substr(i + 1, 2));
                iss >> std::hex >> val;
                decoded += static_cast<char>(val);
                i += 2;
            } else {
                decoded += email[i];
            }
        }
        return bookingCtrl.getBookingsByUser(decoded);
    });

    CROW_ROUTE(app, "/api/bookings/<string>/checkin").methods(crow::HTTPMethod::PUT, crow::HTTPMethod::OPTIONS)
    ([&bookingCtrl](const crow::request& req, std::string code) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        if (!AuthGuard::isAllowed(req, {"admin", "employee"})) return AuthGuard::forbidden();
        auto res = bookingCtrl.setCheckedIn(code, req);

        // Báo Admin/Staff khác đang mở dashboard biết vé này vừa được check-in
        // (hữu ích khi nhiều nhân viên cùng trực quầy soát vé).
        if (res.code == 200) {
            crow::json::wvalue evt;
            evt["type"] = "booking_updated";
            evt["code"] = code;
            evt["field"] = "isCheckedIn";
            WebSocketManager::instance().broadcastToAdmins(evt.dump());
        }
        return res;
    });

    CROW_ROUTE(app, "/api/bookings/<string>/combo").methods(crow::HTTPMethod::PUT, crow::HTTPMethod::OPTIONS)
    ([&bookingCtrl](const crow::request& req, std::string code) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        if (!AuthGuard::isAllowed(req, {"admin", "employee"})) return AuthGuard::forbidden();
        auto res = bookingCtrl.setComboRedeemed(code, req);

        if (res.code == 200) {
            crow::json::wvalue evt;
            evt["type"] = "booking_updated";
            evt["code"] = code;
            evt["field"] = "isComboRedeemed";
            WebSocketManager::instance().broadcastToAdmins(evt.dump());
        }
        return res;
    });

    CROW_ROUTE(app, "/api/admin/revenue").methods(crow::HTTPMethod::GET, crow::HTTPMethod::OPTIONS)
    ([&bookingCtrl](const crow::request& req) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        if (!AuthGuard::isAllowed(req, {"admin"})) return AuthGuard::forbidden();
        return bookingCtrl.getRevenue();
    });

    // =====================================================================
    //  TÀI KHOẢN (ACCOUNTS)
    // =====================================================================
    CROW_ROUTE(app, "/api/accounts/login").methods(crow::HTTPMethod::POST, crow::HTTPMethod::OPTIONS)
    ([&accountCtrl](const crow::request& req) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        return accountCtrl.login(req);
    });

    CROW_ROUTE(app, "/api/accounts/register").methods(crow::HTTPMethod::POST, crow::HTTPMethod::OPTIONS)
    ([&accountCtrl](const crow::request& req) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        return accountCtrl.registerAccount(req);
    });

    CROW_ROUTE(app, "/api/accounts").methods(crow::HTTPMethod::GET, crow::HTTPMethod::OPTIONS)
    ([&accountCtrl](const crow::request& req) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        if (!AuthGuard::isAllowed(req, {"admin"})) return AuthGuard::forbidden();
        return accountCtrl.getAll();
    });

    CROW_ROUTE(app, "/api/accounts/<string>").methods(crow::HTTPMethod::GET, crow::HTTPMethod::PUT, crow::HTTPMethod::OPTIONS)
    ([&accountCtrl](const crow::request& req, std::string email) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        // Crow không tự decode URL — cần decode thủ công (%40 -> @, %2E -> . v.v.)
        // để email như "admin%40xcinema.vn" được xử lý đúng là "admin@xcinema.vn".
        auto urlDecode = [](const std::string& s) {
            std::string out;
            out.reserve(s.size());
            for (size_t i = 0; i < s.size(); ++i) {
                if (s[i] == '%' && i + 2 < s.size()) {
                    int val = 0;
                    std::istringstream iss(s.substr(i + 1, 2));
                    iss >> std::hex >> val;
                    out += static_cast<char>(val);
                    i += 2;
                } else if (s[i] == '+') {
                    out += ' ';
                } else {
                    out += s[i];
                }
            }
            return out;
        };
        std::string decodedEmail = urlDecode(email);
        if (req.method == crow::HTTPMethod::PUT) return accountCtrl.updateProfile(decodedEmail, req);
        return accountCtrl.getByEmail(decodedEmail);
    });

    // =====================================================================
    //  KHUYẾN MÃI (PROMOTIONS)
    // =====================================================================
    CROW_ROUTE(app, "/api/promotions").methods(crow::HTTPMethod::GET, crow::HTTPMethod::POST, crow::HTTPMethod::OPTIONS)
    ([&promoCtrl](const crow::request& req) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        if (req.method == crow::HTTPMethod::POST) {
            if (!AuthGuard::isAllowed(req, {"admin"})) return AuthGuard::forbidden();
            return promoCtrl.create(req);
        }
        return promoCtrl.getAll();
    });

    CROW_ROUTE(app, "/api/promotions/<int>").methods(crow::HTTPMethod::DELETE, crow::HTTPMethod::OPTIONS)
    ([&promoCtrl](const crow::request& req, int id) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        if (!AuthGuard::isAllowed(req, {"admin"})) return AuthGuard::forbidden();
        return promoCtrl.remove(id);
    });

    CROW_ROUTE(app, "/api/promotions/validate/<string>")
    ([&promoCtrl](std::string code) { return promoCtrl.validateCode(code); });

    // =====================================================================
    //  TIN TỨC (NEWS)
    // =====================================================================
    CROW_ROUTE(app, "/api/news").methods(crow::HTTPMethod::GET, crow::HTTPMethod::POST, crow::HTTPMethod::OPTIONS)
    ([&newsCtrl](const crow::request& req) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        if (req.method == crow::HTTPMethod::POST) {
            if (!AuthGuard::isAllowed(req, {"admin"})) return AuthGuard::forbidden();
            return newsCtrl.create(req);
        }
        return newsCtrl.getAll();
    });

    CROW_ROUTE(app, "/api/news/<int>").methods(crow::HTTPMethod::DELETE, crow::HTTPMethod::OPTIONS)
    ([&newsCtrl](const crow::request& req, int id) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        if (!AuthGuard::isAllowed(req, {"admin"})) return AuthGuard::forbidden();
        return newsCtrl.remove(id);
    });

    CROW_ROUTE(app, "/api/news/<int>/view").methods(crow::HTTPMethod::PUT, crow::HTTPMethod::OPTIONS)
    ([&newsCtrl](const crow::request& req, int id) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        return newsCtrl.incrementViews(id);
    });

    // =====================================================================
    //  COMBO (BẮP NƯỚC)
    // =====================================================================
    CROW_ROUTE(app, "/api/combos").methods(crow::HTTPMethod::GET, crow::HTTPMethod::POST, crow::HTTPMethod::OPTIONS)
    ([&comboCtrl](const crow::request& req) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        if (req.method == crow::HTTPMethod::POST) {
            if (!AuthGuard::isAllowed(req, {"admin"})) return AuthGuard::forbidden();
            return comboCtrl.create(req);
        }
        return comboCtrl.getAll();
    });

    CROW_ROUTE(app, "/api/combos/<int>").methods(crow::HTTPMethod::DELETE, crow::HTTPMethod::OPTIONS)
    ([&comboCtrl](const crow::request& req, int id) {
        if (req.method == crow::HTTPMethod::OPTIONS) return corsPreflight();
        if (!AuthGuard::isAllowed(req, {"admin"})) return AuthGuard::forbidden();
        return comboCtrl.remove(id);
    });

    // =====================================================================
    //  KHỞI ĐỘNG SERVER
    // =====================================================================
    std::cout << "\n======================================================\n";
    std::cout << " [SUCCESS] X CINEMA C++ BACKEND IS RUNNING\n";
    std::cout << " --> REST API : http://localhost:8080/api/*\n";
    std::cout << " --> WebSocket: ws://localhost:8080/ws (real-time ghe + admin)\n";
    std::cout << " --> Frontend (Vite) goi qua /api/* duoc proxy toi day\n";
    std::cout << "======================================================\n\n";

    app.loglevel(crow::LogLevel::Warning);
    app.port(8080).multithreaded().run();
}

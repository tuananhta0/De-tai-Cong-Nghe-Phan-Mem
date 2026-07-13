#pragma once
#include <windows.h>
#include <sqlext.h>
#include <string>
#include <vector>
#include <stdexcept>
#include <iostream>

// ============================================================================
//  Database.hpp
//  - Giữ nguyên connection string cũ (không đổi để không phá vỡ kết nối đang
//    hoạt động với SQL Server hiện có).
//  - Bổ sung lớp DbConnection (RAII): tự động cấp phát & giải phóng
//    SQLHENV/SQLHDBC khi ra khỏi scope, tránh leak handle khi có exception.
//  - Bổ sung lớp DbStatement (RAII) bọc SQLHSTMT + helper bind tham số,
//    giúp các Model viết parameterized query ngắn gọn, an toàn SQL Injection.
// ============================================================================

class Database {
public:
    static std::wstring getConnectionString() {
        return L"Driver={ODBC Driver 17 for SQL Server};"
               L"Server= localhost\\MSSQLSERVER01;"
               L"Database=WebBanVeXemPhim;"
               L"Uid=sa;"
               L"Pwd=12345678;"
               L"Encrypt=no;"
               L"TrustServerCertificate=yes;"
               // QUAN TRỌNG: bật MARS (Multiple Active Result Sets). Nếu không bật,
               // SQL Server ODBC chỉ cho phép 1 statement "sống" tại 1 thời điểm trên
               // 1 connection — khi code mở statement thứ 2 (vd: seed ghế cho suất
               // chiếu) trong lúc statement thứ 1 (vd: INSERT suất chiếu + SELECT
               // SCOPE_IDENTITY) chưa đóng, statement thứ 2 sẽ ÂM THẦM thất bại với
               // lỗi "Connection is busy with results for another hstmt" (SQLSTATE
               // 24000), khiến ghế không được sinh ra mà không có exception nào ném
               // ra để phát hiện. Đây chính là nguyên nhân gốc của bug "suất chiếu
               // tạo thành công nhưng 0 ghế -> khách bấm ghế nào cũng báo lỗi".
               L"MARS_Connection=yes;";
    }
};

// RAII wrapper cho 1 kết nối SQL Server. Mở kết nối trong constructor,
// tự đóng + giải phóng handle trong destructor (dù có exception hay không).
class DbConnection {
public:
    SQLHENV henv = SQL_NULL_HENV;
    SQLHDBC hdbc = SQL_NULL_HDBC;
    bool connected = false;

    DbConnection() {
        SQLAllocHandle(SQL_HANDLE_ENV, SQL_NULL_HANDLE, &henv);
        SQLSetEnvAttr(henv, SQL_ATTR_ODBC_VERSION, (SQLPOINTER)SQL_OV_ODBC3, 0);
        SQLAllocHandle(SQL_HANDLE_DBC, henv, &hdbc);

        std::wstring conn_str = Database::getConnectionString();
        SQLRETURN ret = SQLDriverConnectW(
            hdbc, NULL, (SQLWCHAR*)conn_str.c_str(), SQL_NTS,
            NULL, 0, NULL, SQL_DRIVER_NOPROMPT
        );
        connected = SQL_SUCCEEDED(ret);
        if (!connected) {
            std::cerr << "[DB] Khong the ket noi SQL Server!\n";
        }
    }

    ~DbConnection() {
        if (connected) {
            SQLDisconnect(hdbc);
        }
        if (hdbc != SQL_NULL_HDBC) SQLFreeHandle(SQL_HANDLE_DBC, hdbc);
        if (henv != SQL_NULL_HENV) SQLFreeHandle(SQL_HANDLE_ENV, henv);
    }

    // Không cho copy (handle ODBC không nên bị copy/double-free)
    DbConnection(const DbConnection&) = delete;
    DbConnection& operator=(const DbConnection&) = delete;
};

// RAII wrapper cho 1 statement (SQLHSTMT), cung cấp các hàm bindParam tiện lợi
// theo đúng kiểu dữ liệu để chống SQL Injection hoàn toàn (không nối chuỗi SQL).
class DbStatement {
public:
    SQLHSTMT hstmt = SQL_NULL_HSTMT;
    SQLHDBC  ownerHdbc = SQL_NULL_HDBC; // connection sở hữu statement này (để lấy diag cấp connection khi cần)

    // Buffer giữ tham số binding sống tới khi Execute() chạy xong
    // (ODBC yêu cầu con trỏ truyền vào SQLBindParameter phải còn hợp lệ tại
    // thời điểm Execute, nên ta giữ chúng trong các vector/string của statement).
    std::vector<std::string>   strParams;
    std::vector<std::wstring>  wstrParams;
    std::vector<long>          intParams;
    std::vector<double>        doubleParams;
    std::vector<SQLLEN>        indicators;
    int paramIndex = 0;

    explicit DbStatement(DbConnection& conn) {
        ownerHdbc = conn.hdbc; // lưu lại để dùng khi cần lấy diag ở cấp connection
        SQLAllocHandle(SQL_HANDLE_STMT, conn.hdbc, &hstmt);
        // QUAN TRỌNG: reserve() trước đủ chỗ cho các vector tham số. ODBC yêu cầu
        // con trỏ truyền vào SQLBindParameter() phải còn HỢP LỆ cho tới khi
        // execute() thật sự chạy (deferred/late binding). Nếu không reserve()
        // trước, mỗi lần push_back() vượt quá capacity hiện tại, std::vector sẽ
        // tự cấp phát lại vùng nhớ MỚI, copy dữ liệu cũ sang rồi GIẢI PHÓNG vùng
        // nhớ cũ — khiến mọi con trỏ đã bind từ các lần push_back() trước đó (ví
        // dụ tham số bindInt() đầu tiên khi statement có từ 2 bindInt() trở lên)
        // trở thành con trỏ treo (dangling pointer), đọc phải rác bộ nhớ khi
        // SQLExecDirectW chạy. Đây là nguyên nhân gốc của lỗi "suất chiếu tạo ra
        // nhưng ID/giá trị bị sai lệch thất thường" gặp phải trước đó. 32 là dư
        // dả so với số tham số nhiều nhất từng dùng trong 1 statement của dự án.
        intParams.reserve(32);
        doubleParams.reserve(32);
        strParams.reserve(32);
        wstrParams.reserve(32);
    }

    ~DbStatement() {
        if (hstmt != SQL_NULL_HSTMT) SQLFreeHandle(SQL_HANDLE_STMT, hstmt);
    }

    DbStatement(const DbStatement&) = delete;
    DbStatement& operator=(const DbStatement&) = delete;

    // Bind tham số kiểu chuỗi NVARCHAR (Unicode, hỗ trợ tiếng Việt có dấu)
    void bindNString(const std::wstring& value) {
        wstrParams.push_back(value);
        int idx = (int)wstrParams.size() - 1;
        SQLULEN columnSize = wstrParams[idx].size() > 0 ? wstrParams[idx].size() : 1;
        SQLLEN bufferLen = (SQLLEN)((wstrParams[idx].size() + 1) * sizeof(wchar_t));
        SQLBindParameter(hstmt, ++paramIndex, SQL_PARAM_INPUT, SQL_C_WCHAR, SQL_WVARCHAR,
                          columnSize, 0,
                          (SQLPOINTER)wstrParams[idx].c_str(), bufferLen, NULL);
    }

    // Bind chuỗi UTF-8 (từ JSON) vào cột NVARCHAR - tự convert UTF-8 -> wchar_t
    // Dùng cho mọi chuỗi có thể chứa tiếng Việt: format, room, title...
    void bindNStringFromUtf8(const std::string& utf8value) {
        int wlen = MultiByteToWideChar(CP_UTF8, 0, utf8value.c_str(), -1, NULL, 0);
        std::wstring wval(wlen > 0 ? wlen - 1 : 0, L'\0');
        if (wlen > 1) MultiByteToWideChar(CP_UTF8, 0, utf8value.c_str(), -1, &wval[0], wlen);
        bindNString(wval);
    }

    // Bind tham số kiểu chuỗi VARCHAR thường (không dấu: url, code, email...)
    void bindString(const std::string& value) {
        strParams.push_back(value);
        int idx = (int)strParams.size() - 1;
        SQLBindParameter(hstmt, ++paramIndex, SQL_PARAM_INPUT, SQL_C_CHAR, SQL_VARCHAR,
                          strParams[idx].size() > 0 ? strParams[idx].size() : 1, 0,
                          (SQLPOINTER)strParams[idx].c_str(), (SQLLEN)strParams[idx].size() + 1, NULL);
    }

    void bindInt(long value) {
        intParams.push_back(value);
        int idx = (int)intParams.size() - 1;
        SQLBindParameter(hstmt, ++paramIndex, SQL_PARAM_INPUT, SQL_C_LONG, SQL_INTEGER,
                          0, 0, (SQLPOINTER)&intParams[idx], 0, NULL);
    }

    void bindDouble(double value) {
        doubleParams.push_back(value);
        int idx = (int)doubleParams.size() - 1;
        SQLBindParameter(hstmt, ++paramIndex, SQL_PARAM_INPUT, SQL_C_DOUBLE, SQL_DOUBLE,
                          0, 0, (SQLPOINTER)&doubleParams[idx], 0, NULL);
    }

    void bindBit(bool value) {
        bindInt(value ? 1 : 0);
    }

    // Lấy thông báo lỗi THẬT từ SQL Server (SQLSTATE + nội dung) khi 1 lệnh ODBC
    // thất bại, để in ra console giúp chẩn đoán chính xác thay vì chỉ biết
    // "execute() that bai" mà không rõ lý do gì. handleType có thể là
    // SQL_HANDLE_STMT hoặc SQL_HANDLE_DBC (một số lỗi - vd mất kết nối, timeout -
    // chỉ "bám" vào cấp connection chứ không có ở cấp statement).
    static std::string getLastError(SQLSMALLINT handleType, SQLHANDLE handle) {
        SQLWCHAR sqlState[6] = {0};
        SQLWCHAR message[1024] = {0};
        SQLINTEGER nativeError = 0;
        SQLSMALLINT msgLen = 0;
        std::string result;
        SQLSMALLINT rec = 1;
        while (SQL_SUCCEEDED(SQLGetDiagRecW(handleType, handle, rec, sqlState, &nativeError,
                                             message, 1024, &msgLen))) {
            // Convert wchar_t -> UTF-8 để in ra console (tiếng Việt trong lỗi nếu có)
            int len = WideCharToMultiByte(CP_UTF8, 0, message, -1, NULL, 0, NULL, NULL);
            std::string msgUtf8(len > 0 ? len - 1 : 0, '\0');
            if (len > 1) WideCharToMultiByte(CP_UTF8, 0, message, -1, &msgUtf8[0], len, NULL, NULL);
            char stateBuf[8] = {0};
            for (int i = 0; i < 5 && sqlState[i]; i++) stateBuf[i] = (char)sqlState[i];
            result += "[SQLSTATE=" + std::string(stateBuf) + " native=" + std::to_string(nativeError) + "] " + msgUtf8 + "; ";
            rec++;
        }
        return result;
    }

    // Convert wstring -> UTF-8 (tiện in ra console đoạn SQL bị lỗi)
    static std::string wToUtf8(const std::wstring& w) {
        int len = WideCharToMultiByte(CP_UTF8, 0, w.c_str(), (int)w.size(), NULL, 0, NULL, NULL);
        std::string result(len > 0 ? len : 0, '\0');
        if (len > 0) WideCharToMultiByte(CP_UTF8, 0, w.c_str(), (int)w.size(), &result[0], len, NULL, NULL);
        return result;
    }

    bool execute(const std::wstring& sql, const std::string& callSite = "") {
        SQLRETURN ret = SQLExecDirectW(hstmt, (SQLWCHAR*)sql.c_str(), SQL_NTS);
        // QUAN TRỌNG: SQL_NO_DATA (100) KHÔNG PHẢI lỗi thật. Với UPDATE/DELETE,
        // driver trả SQL_NO_DATA khi câu lệnh chạy đúng nhưng 0 dòng khớp điều
        // kiện WHERE (vd: không có ghế nào đang "Holding" quá hạn tại thời điểm
        // đó - tình huống bình thường, xảy ra thường xuyên). SQL_SUCCEEDED() của
        // ODBC không tính SQL_NO_DATA là thành công, nên phải tự thêm điều kiện
        // này để tránh báo lỗi giả (trước đây gây spam log không phải lỗi thật).
        bool ok = SQL_SUCCEEDED(ret) || ret == SQL_NO_DATA;
        if (!ok) {
            // Thử lấy chẩn đoán ở cấp STATEMENT trước; nếu rỗng (một số lỗi như mất
            // kết nối/timeout chỉ "bám" vào cấp CONNECTION), thử tiếp ở cấp DBC.
            std::string diag = getLastError(SQL_HANDLE_STMT, hstmt);
            if (diag.empty() && ownerHdbc != SQL_NULL_HDBC) {
                diag = getLastError(SQL_HANDLE_DBC, ownerHdbc);
                if (!diag.empty()) diag = "(tu cap CONNECTION) " + diag;
            }
            if (diag.empty()) diag = "(khong lay duoc chi tiet loi tu ca STMT lan DBC)";

            std::string sqlUtf8 = wToUtf8(sql.substr(0, 200)); // chỉ in 200 ký tự đầu cho gọn
            std::cerr << "[DbStatement::execute] LOI (SQLRETURN=" << ret << ")"
                      << (callSite.empty() ? "" : " tai [" + callSite + "]")
                      << " SQL=\"" << sqlUtf8 << "\" " << diag << "\n";
        }
        return ok;
    }

    SQLLEN rowCount() {
        SQLLEN rows = 0;
        SQLRowCount(hstmt, &rows);
        return rows;
    }
};

// ----------------------------------------------------------------------------
// Helpers đọc dữ liệu trả về (SQLGetData) an toàn, tránh lặp code buffer khắp nơi
// ----------------------------------------------------------------------------
namespace DbRead {
    inline std::string getUtf8String(SQLHSTMT hstmt, int col, int bufSize = 4000) {
        std::vector<SQLWCHAR> buf(bufSize, 0);
        SQLLEN indicator = 0;
        SQLRETURN ret = SQLGetData(hstmt, col, SQL_C_WCHAR, buf.data(), bufSize * sizeof(SQLWCHAR), &indicator);
        if (!SQL_SUCCEEDED(ret) || indicator == SQL_NULL_DATA) return "";

        // indicator = số BYTE dữ liệu thực tế mà driver trả về (không tính null-terminator).
        // Dùng giá trị này để cắt đúng độ dài, tránh đọc tràn bộ đệm khi chuỗi dài vừa khít bufSize.
        size_t charCount = (size_t)(indicator / (SQLLEN)sizeof(SQLWCHAR));
        if (charCount > (size_t)bufSize) charCount = (size_t)bufSize; // phòng hờ dữ liệu bị cắt (truncate)

        std::wstring wstr(buf.data(), charCount);
        int sizeNeeded = WideCharToMultiByte(CP_UTF8, 0, wstr.c_str(), (int)wstr.size(), NULL, 0, NULL, NULL);
        std::string result(sizeNeeded, 0);
        WideCharToMultiByte(CP_UTF8, 0, wstr.c_str(), (int)wstr.size(), &result[0], sizeNeeded, NULL, NULL);
        return result;
    }

    inline long getInt(SQLHSTMT hstmt, int col) {
        long value = 0;
        SQLLEN indicator = 0;
        SQLGetData(hstmt, col, SQL_C_LONG, &value, 0, &indicator);
        if (indicator == SQL_NULL_DATA) return 0;
        return value;
    }

    inline double getDouble(SQLHSTMT hstmt, int col) {
        double value = 0;
        SQLLEN indicator = 0;
        SQLGetData(hstmt, col, SQL_C_DOUBLE, &value, 0, &indicator);
        if (indicator == SQL_NULL_DATA) return 0.0;
        return value;
    }

    inline bool getBit(SQLHSTMT hstmt, int col) {
        return getInt(hstmt, col) != 0;
    }
}

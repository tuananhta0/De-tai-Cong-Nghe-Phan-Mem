#pragma once
#include <windows.h>
#include <sqlext.h>
#include <string>
#include <vector>
#include <stdexcept>
#include <iostream>
#include <cstdlib>
#include "DotEnv.hpp"

inline std::wstring toWStr(const std::string& s) {
    return std::wstring(s.begin(), s.end());
}
inline std::string getEnvOr(const char* key, const std::string& fallback) {
    const char* val = std::getenv(key);
    return val ? std::string(val) : fallback;
}

class Database {
public:
    static std::wstring getConnectionString() {
        loadDotEnv(".env");

        std::string server   = getEnvOr("DB_SERVER", "localhost\\MSSQLSERVER01");
        std::string database = getEnvOr("DB_NAME", "WebBanVeXemPhim");
        std::string uid      = getEnvOr("DB_UID", "sa");

        const char* pwdEnv = std::getenv("DB_PASSWORD");
        if (!pwdEnv) {
            throw std::runtime_error(
                "[Database] Thieu bien moi truong DB_PASSWORD. Hay tao file .env "
                "(xem .env.example) o thu muc chay backend, hoac set bien moi "
                "truong DB_PASSWORD truoc khi chay.");
        }
        std::string pwd = pwdEnv;

        return L"Driver={ODBC Driver 17 for SQL Server};"
               L"Server=" + toWStr(server) + L";"
               L"Database=" + toWStr(database) + L";"
               L"Uid=" + toWStr(uid) + L";"
               L"Pwd=" + toWStr(pwd) + L";"
               L"Encrypt=no;"
               L"TrustServerCertificate=yes;"
               L"MARS_Connection=yes;";
    }
};
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
    DbConnection(const DbConnection&) = delete;
    DbConnection& operator=(const DbConnection&) = delete;
};
class DbStatement {
public:
    SQLHSTMT hstmt = SQL_NULL_HSTMT;
    SQLHDBC  ownerHdbc = SQL_NULL_HDBC; 
    std::vector<std::string>   strParams;
    std::vector<std::wstring>  wstrParams;
    std::vector<long>          intParams;
    std::vector<double>        doubleParams;
    std::vector<SQLLEN>        indicators;
    int paramIndex = 0;

    explicit DbStatement(DbConnection& conn) {
        ownerHdbc = conn.hdbc;
        SQLAllocHandle(SQL_HANDLE_STMT, conn.hdbc, &hstmt);
        intParams.reserve(32);
        doubleParams.reserve(32);
        strParams.reserve(32);
        wstrParams.reserve(32);
        indicators.reserve(32);
    }

    ~DbStatement() {
        if (hstmt != SQL_NULL_HSTMT) SQLFreeHandle(SQL_HANDLE_STMT, hstmt);
    }

    DbStatement(const DbStatement&) = delete;
    DbStatement& operator=(const DbStatement&) = delete;
    void bindNString(const std::wstring& value) {
        wstrParams.push_back(value);
        int idx = (int)wstrParams.size() - 1;
        SQLULEN columnSize = wstrParams[idx].size() > 0 ? wstrParams[idx].size() : 1;
        SQLLEN bufferLen = (SQLLEN)((wstrParams[idx].size() + 1) * sizeof(wchar_t));
        SQLBindParameter(hstmt, ++paramIndex, SQL_PARAM_INPUT, SQL_C_WCHAR, SQL_WVARCHAR,
                          columnSize, 0,
                          (SQLPOINTER)wstrParams[idx].c_str(), bufferLen, NULL);
    }

    void bindNStringFromUtf8(const std::string& utf8value) {
        int wlen = MultiByteToWideChar(CP_UTF8, 0, utf8value.c_str(), -1, NULL, 0);
        std::wstring wval(wlen > 0 ? wlen - 1 : 0, L'\0');
        if (wlen > 1) MultiByteToWideChar(CP_UTF8, 0, utf8value.c_str(), -1, &wval[0], wlen);
        bindNString(wval);
    }

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

    void bindNull() {
        indicators.push_back(SQL_NULL_DATA);
        SQLBindParameter(hstmt, ++paramIndex, SQL_PARAM_INPUT, SQL_C_LONG, SQL_INTEGER,
                          0, 0, NULL, 0, &indicators.back());
    }

    static std::string getLastError(SQLSMALLINT handleType, SQLHANDLE handle) {
        SQLWCHAR sqlState[6] = {0};
        SQLWCHAR message[1024] = {0};
        SQLINTEGER nativeError = 0;
        SQLSMALLINT msgLen = 0;
        std::string result;
        SQLSMALLINT rec = 1;
        while (SQL_SUCCEEDED(SQLGetDiagRecW(handleType, handle, rec, sqlState, &nativeError,
                                             message, 1024, &msgLen))) {
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
    static std::string wToUtf8(const std::wstring& w) {
        int len = WideCharToMultiByte(CP_UTF8, 0, w.c_str(), (int)w.size(), NULL, 0, NULL, NULL);
        std::string result(len > 0 ? len : 0, '\0');
        if (len > 0) WideCharToMultiByte(CP_UTF8, 0, w.c_str(), (int)w.size(), &result[0], len, NULL, NULL);
        return result;
    }

    bool execute(const std::wstring& sql, const std::string& callSite = "") {
        SQLRETURN ret = SQLExecDirectW(hstmt, (SQLWCHAR*)sql.c_str(), SQL_NTS);
        bool ok = SQL_SUCCEEDED(ret) || ret == SQL_NO_DATA;
        if (!ok) {
            std::string diag = getLastError(SQL_HANDLE_STMT, hstmt);
            if (diag.empty() && ownerHdbc != SQL_NULL_HDBC) {
                diag = getLastError(SQL_HANDLE_DBC, ownerHdbc);
                if (!diag.empty()) diag = "(tu cap CONNECTION) " + diag;
            }
            if (diag.empty()) diag = "(khong lay duoc chi tiet loi tu ca STMT lan DBC)";

            std::string sqlUtf8 = wToUtf8(sql.substr(0, 200)); 
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
namespace DbRead {
    inline std::string getUtf8String(SQLHSTMT hstmt, int col, int bufSize = 4000) {
        std::vector<SQLWCHAR> buf(bufSize, 0);
        SQLLEN indicator = 0;
        SQLRETURN ret = SQLGetData(hstmt, col, SQL_C_WCHAR, buf.data(), bufSize * sizeof(SQLWCHAR), &indicator);
        if (!SQL_SUCCEEDED(ret) || indicator == SQL_NULL_DATA) return "";
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

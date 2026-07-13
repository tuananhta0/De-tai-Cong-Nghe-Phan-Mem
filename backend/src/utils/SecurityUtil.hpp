#pragma once
#include <windows.h>
#include <wincrypt.h>
#include <string>
#include <sstream>
#include <random>
#include <iomanip>

// ============================================================================
//  SecurityUtil.hpp
//  Hash mật khẩu bằng SHA-256 (Windows CryptoAPI, không cần thêm thư viện
//  ngoài) để khớp với HASHBYTES('SHA2_256', ...) đã dùng trong file migration
//  SQL, đảm bảo mật khẩu seed sẵn trong DB và mật khẩu user đăng ký qua API
//  đều so khớp được với nhau.
// ============================================================================

namespace SecurityUtil {

    inline std::string sha256Hex(const std::string& input) {
        HCRYPTPROV hProv = 0;
        HCRYPTHASH hHash = 0;
        std::string result;

        if (!CryptAcquireContext(&hProv, NULL, NULL, PROV_RSA_AES, CRYPT_VERIFYCONTEXT)) {
            return "";
        }
        if (!CryptCreateHash(hProv, CALG_SHA_256, 0, 0, &hHash)) {
            CryptReleaseContext(hProv, 0);
            return "";
        }
        if (!CryptHashData(hHash, (const BYTE*)input.c_str(), (DWORD)input.size(), 0)) {
            CryptDestroyHash(hHash); CryptReleaseContext(hProv, 0);
            return "";
        }

        BYTE hash[32];
        DWORD hashLen = 32;
        if (CryptGetHashParam(hHash, HP_HASHVAL, hash, &hashLen, 0)) {
            std::ostringstream oss;
            for (DWORD i = 0; i < hashLen; ++i) {
                oss << std::hex << std::setw(2) << std::setfill('0') << (int)hash[i];
            }
            result = oss.str();
        }

        CryptDestroyHash(hHash);
        CryptReleaseContext(hProv, 0);
        return result;
    }

    // Sinh mã vé ngẫu nhiên dạng "XCD-123456"
    inline std::string generateBookingCode() {
        static std::random_device rd;
        static std::mt19937 gen(rd());
        std::uniform_int_distribution<> dist(100000, 999999);
        return "XCD-" + std::to_string(dist(gen));
    }

    // Sinh mã giao dịch tạm cho mock payment gateway
    inline std::string generateTransactionId() {
        static std::random_device rd;
        static std::mt19937 gen(rd());
        std::uniform_int_distribution<> dist(100000, 999999);
        return "TXN-" + std::to_string(dist(gen));
    }
}

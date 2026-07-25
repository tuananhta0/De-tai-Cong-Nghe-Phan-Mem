#pragma once
#include <windows.h>
#include <cstdlib>
#include <fstream>
#include <sstream>
#include <string>
#include <algorithm>


inline std::string trim(const std::string& s) {
    size_t start = s.find_first_not_of(" \t\r\n");
    if (start == std::string::npos) return "";
    size_t end = s.find_last_not_of(" \t\r\n");
    return s.substr(start, end - start + 1);
}

inline void loadDotEnv(const std::string& path = ".env") {
    std::ifstream file(path);
    if (!file.is_open()) {
        std::cerr << "[DotEnv] Khong tim thay file " << path
                  << " - se dung bien moi truong he thong (neu co).\n";
        return;
    }

    std::string line;
    while (std::getline(file, line)) {
        std::string trimmed = trim(line);
        if (trimmed.empty() || trimmed[0] == '#') continue; // bo qua dong trong / comment

        size_t eq = trimmed.find('=');
        if (eq == std::string::npos) continue;

        std::string key = trim(trimmed.substr(0, eq));
        std::string value = trim(trimmed.substr(eq + 1));
        if (value.size() >= 2 && value.front() == '"' && value.back() == '"') {
            value = value.substr(1, value.size() - 2);
        }

        if (!key.empty()) {
            _putenv_s(key.c_str(), value.c_str());
        }
    }
}

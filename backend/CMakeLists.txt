cmake_minimum_required(VERSION 3.20) # Sử dụng các tính năng quản lý bộ nhớ đệm hiện đại
project(WebXemPhim_Backend VERSION 1.0 LANGUAGES CXX)

# 1. TỐI ƯU HIỆU NĂNG: Mặc định luôn chọn chế độ Release nếu bạn không chỉ định
# Chế độ Release giúp compiler tối ưu mã nguồn, giúp server Crow chạy nhanh gấp nhiều lần Debug
if(NOT CMAKE_BUILD_TYPE AND NOT CMAKE_CONFIGURATION_TYPES)
    set(CMAKE_BUILD_TYPE "Release" CACHE STRING "Choose the type of build." FORCE)
endif()

# 2. TỐI ƯU TIÊU CHUẨN C++: Cấu hình chuẩn C++17 nghiêm ngặt
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF) # Tắt các extension riêng của compiler để code nhẹ và chuẩn nhất

# 3. CẤU HÌNH ĐẶC TÍNH CROW: Ép sử dụng Boost Asio có sẵn trên máy bạn
set(CROW_USE_BOOST ON CACHE BOOL "Force Crow to use Boost" FORCE)

# 4. TỐI ƯU TỐC ĐỘ TẢI (FetchContent):
include(FetchContent)
FetchContent_Declare(
    Crow
    GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
    GIT_TAG        master
    GIT_SHALLOW    ON # CỰC KỲ QUAN TRỌNG: Chỉ tải commit mới nhất, không tải toàn bộ lịch sử Git cũ
                      # Giúp tốc độ cấu hình (Configuring) nhanh hơn gấp 5 lần nếu phải tải lại!
)
FetchContent_MakeAvailable(Crow)

# 5. KHAI BÁO EXE
add_executable(WebXemPhim_Backend src/main.cpp)

# 6. TỐI ƯU TỐC ĐỘ XỬ LÝ CỦA CPU (Compiler Options)
if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    target_compile_options(WebXemPhim_Backend PRIVATE 
        -O3             # Tối ưu hóa code ở mức cao nhất
        -march=native   # Ra lệnh cho GCC tối ưu hóa riêng cho chính con chip CPU máy bạn đang dùng
    )
endif()

# 7. LIÊN KẾT THƯ VIỆN (Modern Target-based Linking)
target_link_libraries(WebXemPhim_Backend PRIVATE Crow::Crow)

# 8. TỐI ƯU RIÊNG CHO WINDOWS (Fix lỗi mạng và Tăng tốc biên dịch)
if(WIN32)
    # Khac phuc loi Socket (ws2_32, mswsock), lien ket Driver ODBC (odbc32) cho SQL Server,
    # va Advapi32 (CryptoAPI) de SecurityUtil.hpp hash mat khau SHA-256.
    target_link_libraries(WebXemPhim_Backend PRIVATE ws2_32 mswsock odbc32 advapi32)
    
    target_compile_definitions(WebXemPhim_Backend PRIVATE 
        WIN32_LEAN_AND_MEAN # Tang toc do build file, loai bo thu vien rac
    )
endif()
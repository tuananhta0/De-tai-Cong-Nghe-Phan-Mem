```
========================================================================================
[X CINEMA LOGO]     [ Tìm phim, rạp...       ]     (Trang Chủ) (Phim) (Rạp)    [Nguyễn Anh..]
========================================================================================
 BƯỚC 1: CHỌN GHẾ NGỒI
 Mai
 X Cinema Hoàn Kiếm • Rạp 1 • 15/06/2026 • 09:00 • Format 2D Phụ đề      [Quay Lại Lịch Chiếu]
----------------------------------------------------------------------------------------
[ VÙNG CHỌN GHẾ & BẮP NƯỚC (75%) ]                        | [ SIDEBAR TỔNG KẾT (25%) ]
                                                          |
             +--------------------------+                 |  PHIM ĐANG CHỌN
             |       MÀN HÌNH CHÍNH     |                 |  Mai
             +--------------------------+                 |  Tâm Lý / Tình Cảm
                                                          |  ---------------------------
 A  [A1] [A2] [A3] [A4]  [A5] [A6] [A7]  [A8] [A9] [A10]  |  Rạp: X Cinema Hoàn Kiếm
 B  [B1] [B2] [B3] [B4]  [B5] [B6] [B7]  [B8] [B9] [B10]  |  Suất: 09:00 • 15/06/2026
 C  [C1] [C2] [C3] [C4]  [C5] [C6] [C7]  [C8] [C9] [C10*] |  Định dạng: 2D Phụ đề • Rạp 1
 D  [D1] [D2] [D3] [D4]  [D5] [D6] [D7]  [D8] [D9] [D10 ] |  Ghế chọn: C10, E10, G10, H4
 E  [E1] [E2] [E3] [E4]  [E5] [E6] [E7]  [E8] [E9] [E10*] |  ---------------------------
 F  [ X] [ X] [ X] [ X]  [ X] [ X] [ X]  [ X] [ X] [ X  ] |  CHI TIẾT GIÁ GHẾ:
 G  [G1] [G2] [G3] [G4]  [G5] [G6] [G7]  [G8] [G9] [G10*] |  Ghế C10 (Thường):  85.000 đ
                                                          |  Ghế E10 (VIP):    110.000 đ
 H     [   H1   ]     [   H2   ]     [   H4* ]          |  Ghế G10 (VIP):    110.000 đ
                                                          |  Ghế H4 (Couple):  240.000 đ
    (o) Ghế Thường   (o) Ghế VIP   (o) Ghế Đôi   (x) Đã đặt|  ---------------------------
----------------------------------------------------------| 
 SIÊU ƯU ĐÃI: GỌI KÈM BẮP NƯỚC ONLINE                     | 
                                                          | 
 +-----------------+  +-----------------+  +------------+ | 
 | [IMG] Solo Sweet|  | [IMG] CoupleLove|  | [IMG] Gold | | 
 | 65.000 đ        |  | 109.000 đ       |  | 159.000 đ  | | 
 | [ - ] [ 0 ] [+] |  | [ - ] [ 0 ] [+] |  | [-] [0] [+]| |  TỔNG TIỀN VẾ:
 +-----------------+  +-----------------+  +------------+ |  545.000 đ
                                                          | 
                                                          |  [   TIẾP TỤC THANH TOÁN   ]
========================================================================================

```

### 📌 Ghi chú nhanh cho Developer (System Logic)

* **Ký hiệu `*` (C10*, E10*, G10*, H4*): Trạng thái ghế `Selected` (Đang chọn), kích hoạt đổi màu UI sang Đỏ.
* **Hàng F `[ X]`:** Trạng thái `Locked` (Khóa hệ thống), chặn toàn bộ sự kiện click.
* **Hàng H (Ghế đôi):** Chiếm kích thước X-axis gấp đôi ghế thường ($1 \times 2$).
* **Nút `[-]` tại cụm Bắp nước:** Mặc định `disabled` nếu số lượng bằng `0`.
* **Sidebar Data Binding:** Tổng tiền và danh sách ghế tự động re-render (Real-time) theo hành vi click ở vùng bên trái.
* <img width="1208" height="2805" alt="172 17 154 18_3000_" src="https://github.com/user-attachments/assets/3a102d0f-308d-4b7c-8914-c5f42941aaea" />

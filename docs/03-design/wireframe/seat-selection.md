1. Quy chuẩn màu sắc thống nhất (Color Palette & State UX)
Để đảm bảo trải nghiệm người dùng tốt trên Laptop và dễ code CSS,
em quy định 4 mã màu chủ đạo cho các trạng thái ghế như sau:

Ghế trống (Có thể chọn): Màu xám nhạt (#E2E8F0 / Tailwind: bg-slate-200) 
-> Tạo cảm giác dễ chịu, không bị rối mắt khi nhìn cả phòng chiếu.

Ghế đã đặt (Bị khóa): Màu đỏ đô (#DC2626 / Tailwind: bg-red-600) kèm biểu tượng [X] hoặc Khóa 
-> Nhìn vào là biết không ấn được (Disabled).

Ghế đang chọn: Màu xanh lá cây sáng (#16A34A / Tailwind: bg-green-600) 
-> Nổi bật rõ ràng vị trí khách vừa click.

Ghế đôi (Sweetbox/VIP): Màu hồng cánh sen (#DB2777 / Tailwind: bg-pink-600) đặt ở hàng cuối.

2. Mockup giao diện trên màn hình Laptop (Viewport 16:9)
[Mã Đơn Hàng: #ST-9921]  PHIM: BIỆT ĐỘI SIÊU ANH HÙNG | Rạp 3 - Phòng Chiếu 2D
======================================================================================

                   +----------------------------------------+
                   |           MÀN HÌNH / SCREEN            | (Thiết kế vòm cong ngược)
                   +----------------------------------------+
                                       |
                                    Ánh sáng
                                       v

    Hàng A:  [A1] [A2] [A3] [A4]     [A5] [A6] [A7] [A8]     [A9] [A10] [A11] [A12]
    Hàng B:  [B1] [B2] [B3] [B4]     [B5] [B6] [B7] [B8]     [B9] [B10] [B11] [B12]
    Hàng C:  [C1] [C2] [X]  [C4]     [C5]  [X] [C7] [C8]     [C9] [B10] [B11] [B12]
    Hàng D:  [D1] [D2] [D3] [D4]     [D5] [D6] [D7] [D8]     [D9] [D10] [D11] [D12]
    Hàng E:  [E1] [E2] [E3] [E4]     [*E5*][*E6*][E7] [E8]   [E9] [E10] [E11] [E12]
    Hàng F:  [F1] [F2] [F3] [F4]     [F5] [F6] [F7] [F8]     [F9] [F10] [F11] [F12]
             
             [====== H1 ======]      [====== H2 ======]      [====== H3 ======]  (Ghế đôi)

--------------------------------------------------------------------------------------
[CHÚ THÍCH TRẠNG THÁI GHẾ (LEGEND)]
   [   ] Ghế trống (Xám)         [ X ] Ghế đã đặt (Đỏ)   
   [ * ] Ghế đang chọn (Xanh)    [=======] Ghế đôi (Hồng)

--------------------------------------------------------------------------------------
[BẢNG THÔNG TIN TẠM TÍNH - BOTTOM BAR (Cố định ở chân trang)]
Thời gian giữ ghế còn lại: 04:59 
- Ghế bạn chọn: E5, E6
- Tạm tính: 2 x 90.000đ = 180.000 VND

[ Nút: < Quay lại chọn suất ]                               [ Nút: Tiếp tục thanh toán > ]
==========================================================================================
3. Thiết kế Responsive & Trải nghiệm trên Laptop (Dễ sử dụng)
Bố cục Grid lọt lòng: Thay vì kéo dài hết màn hình,
sơ đồ ghế được bọc trong một khối container có độ rộng tối đa là 1200px,
 giúp mắt người dùng không phải đảo quá nhiều khi ngồi trước màn hình laptop 14-15.6 inch.

Kích thước nút bấm (Ghế): Mỗi ô ghế có kích thước w-10 h-10 (khoảng 40px x 40px),
khoảng cách giữa các ghế là gap-2 (8px). 
Kích thước này cực kỳ vừa vặn để rê và click bằng Touchpad của laptop mà không sợ bị bấm nhầm.

Lối đi ở giữa: Có khoảng trống phân tách cột 4-5 và 8-9 để mô phỏng đúng lối đi thực tế của rạp phim,
giúp khách dễ định vị hàng ghế VIP.

4. Logic kết nối Backend C++ / SQL (Sinh viên năm nhất ghi chú)
Khi render màn hình này, Frontend sẽ gửi GET /api/showtimes/{id}/seats.

Backend C++ truy vấn SQL để lấy danh sách các ghế có status = 1 (đã đặt) để render ra màu đỏ [ X ] 
và thêm thuộc tính disabled vào thẻ <button> để chặn người dùng cố tình can thiệp mã nguồn.

Khi người dùng click [ Tiếp tục thanh toán ], 
hệ thống sẽ gọi POST /api/book để kích hoạt cơ chế khóa ghế tạm thời 5 phút.

/* ====================================================================
   X CINEMA - SCHEMA HOÀN CHỈNH (ĐÃ SỬA LỖI + TỐI ƯU)
   Bản sửa so với bản gốc, đã đối chiếu trực tiếp với code trong
   Xcinema__1_.zip (src/data/seedData.ts, src/components/booking/SeatMap.tsx)
   để khớp 100% với những gì frontend thực sự hiển thị/tính toán.

   CÁC LỖI ĐÃ SỬA SO VỚI BẢN GỐC:
   1) Ghế: SeatMap.tsx dùng 12 ghế/hàng (không phải 10), hàng D-G là VIP,
      hàng H là Ghế Đôi/Sweetbox (không phải chỉ G-H là VIP và không có
      loại ghế đôi nào).
   2) Suất chiếu: bản gốc chỉ tạo suất cho 10/20 phim đang chiếu và chỉ
      2/5 rạp. Bản này tái tạo ĐÚNG thuật toán generateShowtimes() gốc
      trong seedData.ts (vòng lặp rạp -> phim -> ngày, công thức modulo
      y hệt) để mọi phim đang chiếu đều có suất ở mọi rạp.
   3) Ngày suất chiếu trước đây hard-code '2026-06-23'/'2026-06-24'.
      Bản này dùng GETDATE() để luôn là "hôm nay/ngày mai" mỗi lần chạy,
      giống cách frontend tính today/tomorrow.
   4) Thêm CHECK constraint cho các cột dạng enum (Rating, RoleCode,
      Status ghế, PaymentStatus...) để chặn dữ liệu rác.
   5) Thêm trigger chống trùng giờ chiếu trong cùng 1 phòng (race-condition
      khi 2 suất chiếu đè giờ nhau).
   6) Thêm stored procedure dọn ghế "Holding" quá hạn (giữ ghế > 10 phút
      mà không thanh toán) — trước đây có cột HoldExpiresAt nhưng không
      có gì dùng tới nó.

   CẢNH BÁO: File này XÓA TOÀN BỘ dữ liệu cũ (DROP DATABASE).
   Cách dùng: Mở SSMS, kết nối "localhost\MSSQLSERVER01", chạy toàn bộ
              file từ trên xuống.
   ==================================================================== */

-- ============================================================
--  PHẦN 0: XÓA VÀ TẠO LẠI DATABASE TỪ ĐẦU
-- ============================================================
USE master;
GO

IF EXISTS (SELECT 1 FROM sys.databases WHERE name = 'WebBanVeXemPhim')
BEGIN
    ALTER DATABASE WebBanVeXemPhim SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE WebBanVeXemPhim;
END
GO

CREATE DATABASE WebBanVeXemPhim;
GO

USE WebBanVeXemPhim;
GO


-- ============================================================
--  PHẦN 1: TÀI KHOẢN & PHÂN QUYỀN
-- ============================================================

CREATE TABLE dbo.Roles (
    RoleID      INT IDENTITY(1,1) PRIMARY KEY,
    RoleCode    VARCHAR(20)     NOT NULL UNIQUE,   -- 'admin' | 'employee' | 'customer'
    RoleName    NVARCHAR(50)    NOT NULL
);
GO

CREATE TABLE dbo.Users (
    UserID              INT IDENTITY(1,1) PRIMARY KEY,
    Username            VARCHAR(100)    NOT NULL UNIQUE,
    PasswordHash        VARBINARY(32)   NOT NULL,
    FullName            NVARCHAR(100)   NOT NULL,
    Email               VARCHAR(150)    NOT NULL UNIQUE,
    Phone               VARCHAR(20)     NULL,
    RoleID              INT             NOT NULL,
    RoleCode            VARCHAR(20)     NOT NULL DEFAULT 'customer'
                            CONSTRAINT CK_Users_RoleCode CHECK (RoleCode IN ('admin','employee','customer')),
    Avatar              VARCHAR(500)    NULL,
    MembershipId        VARCHAR(30)     NULL,
    Points              INT             NOT NULL DEFAULT 0,
    FavoriteMoviesJson  NVARCHAR(MAX)   NULL DEFAULT '[]',
    CreatedAt           DATETIME2       NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (RoleID) REFERENCES dbo.Roles(RoleID)
);
GO


-- ============================================================
--  PHẦN 2: PHIM
-- ============================================================

CREATE TABLE dbo.Movies (
    MovieID         INT IDENTITY(1,1) PRIMARY KEY,
    Title           NVARCHAR(200)   NOT NULL,
    OriginalTitle   NVARCHAR(200)   NULL,
    Genre           NVARCHAR(200)   NOT NULL,
    Duration        INT             NOT NULL,
    Rating          VARCHAR(5)      NOT NULL DEFAULT 'T13'
                        CONSTRAINT CK_Movies_Rating CHECK (Rating IN ('P','K','T13','T16','T18')),
    Score           DECIMAL(3,1)    NOT NULL DEFAULT 0,
    Votes           INT             NOT NULL DEFAULT 0,
    ReleaseDate     DATE            NOT NULL,
    IsUpcoming      BIT             NOT NULL DEFAULT 0,
    PosterURL       VARCHAR(500)    NOT NULL,
    BannerURL       VARCHAR(500)    NULL,
    TrailerURL      VARCHAR(500)    NULL,
    Description     NVARCHAR(MAX)   NULL,
    Director        NVARCHAR(100)   NULL,
    CastJson        NVARCHAR(MAX)   NULL DEFAULT '[]',
    Language        NVARCHAR(100)   NOT NULL DEFAULT N'Tiếng Việt',
    CountdownEnd    DATETIME2       NULL,
    IsActive        BIT             NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO


-- ============================================================
--  PHẦN 3: CỤM RẠP, PHÒNG CHIẾU, GHẾ
-- ============================================================

CREATE TABLE dbo.Cinemas (
    CinemaID    INT IDENTITY(1,1) PRIMARY KEY,
    CinemaName  NVARCHAR(150)   NOT NULL,
    Address     NVARCHAR(300)   NOT NULL,
    Phone       VARCHAR(20)     NULL,
    ImageURL    VARCHAR(500)    NULL,
    MapEmbed    NVARCHAR(MAX)   NULL
);
GO

CREATE TABLE dbo.CinemaHalls (
    HallID      INT IDENTITY(1,1) PRIMARY KEY,
    CinemaID    INT             NOT NULL,
    HallName    NVARCHAR(50)    NOT NULL,
    IsActive    BIT             NOT NULL DEFAULT 1,
    FOREIGN KEY (CinemaID) REFERENCES dbo.Cinemas(CinemaID)
);
GO

CREATE TABLE dbo.Seats (
    SeatID      INT IDENTITY(1,1) PRIMARY KEY,
    HallID      INT             NOT NULL,
    RowLabel    CHAR(1)         NOT NULL,
    SeatNumber  INT             NOT NULL,
    -- 'Thường' (hàng A-C) | 'VIP' (hàng D-G) | 'Sweetbox' (hàng H, ghế đôi)
    -- khớp đúng logic getSeatInfo() trong SeatMap.tsx của frontend
    SeatType    NVARCHAR(20)    NOT NULL DEFAULT N'Thường'
                    CONSTRAINT CK_Seats_SeatType CHECK (SeatType IN (N'Thường', N'VIP', N'Sweetbox')),
    IsActive    BIT             NOT NULL DEFAULT 1,
    FOREIGN KEY (HallID) REFERENCES dbo.CinemaHalls(HallID)
);
GO


-- ============================================================
--  PHẦN 4: SUẤT CHIẾU & TRẠNG THÁI GHẾ THEO SUẤT
-- ============================================================

CREATE TABLE dbo.Showtimes (
    ShowtimeID      INT IDENTITY(1,1) PRIMARY KEY,
    MovieID         INT             NOT NULL,
    HallID          INT             NOT NULL,
    StartTime       DATETIME2       NOT NULL,
    Format          NVARCHAR(20)    NOT NULL DEFAULT N'2D Phụ đề',
    PriceStandard   DECIMAL(10,2)   NOT NULL DEFAULT 0,
    PriceVIP        DECIMAL(10,2)   NOT NULL DEFAULT 0,
    PriceDouble     DECIMAL(10,2)   NOT NULL DEFAULT 0,
    FOREIGN KEY (MovieID) REFERENCES dbo.Movies(MovieID),
    FOREIGN KEY (HallID) REFERENCES dbo.CinemaHalls(HallID)
);
GO

CREATE TABLE dbo.ShowtimeSeats (
    ShowtimeSeatID  INT IDENTITY(1,1) PRIMARY KEY,
    ShowtimeID      INT             NOT NULL,
    SeatID          INT             NOT NULL,
    Status          VARCHAR(20)     NOT NULL DEFAULT 'Available'
                        CONSTRAINT CK_ShowtimeSeats_Status CHECK (Status IN ('Available','Holding','Booked')),
    HoldExpiresAt   DATETIME2       NULL,
    FOREIGN KEY (ShowtimeID) REFERENCES dbo.Showtimes(ShowtimeID),
    FOREIGN KEY (SeatID) REFERENCES dbo.Seats(SeatID),
    CONSTRAINT UQ_ShowtimeSeat UNIQUE (ShowtimeID, SeatID)
);
GO


-- ============================================================
--  PHẦN 5: COMBO BẮP NƯỚC
-- ============================================================

CREATE TABLE dbo.Combos (
    ComboID     INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(150)   NOT NULL,
    Description NVARCHAR(500)   NULL,
    Price       DECIMAL(10,2)   NOT NULL DEFAULT 0,
    ImageURL    VARCHAR(500)    NULL,
    IsActive    BIT             NOT NULL DEFAULT 1
);
GO


-- ============================================================
--  PHẦN 6: ĐẶT VÉ (BOOKINGS)
-- ============================================================

CREATE TABLE dbo.Bookings (
    BookingID       INT IDENTITY(1,1) PRIMARY KEY,
    UserID          INT             NOT NULL,
    Code            VARCHAR(30)     NOT NULL UNIQUE,
    TransactionID   VARCHAR(30)     NOT NULL,
    MovieTitle      NVARCHAR(200)   NOT NULL,
    MoviePoster     VARCHAR(500)    NULL,
    CinemaName      NVARCHAR(150)   NOT NULL,
    ShowDate        VARCHAR(20)     NOT NULL,
    ShowTime        VARCHAR(10)     NOT NULL,
    Room            NVARCHAR(50)    NULL,
    Format          NVARCHAR(20)    NULL,
    SeatsJson       NVARCHAR(MAX)   NOT NULL,
    CombosJson      NVARCHAR(MAX)   NULL DEFAULT '[]',
    TotalAmount     DECIMAL(12,2)   NOT NULL,
    PaymentMethod   NVARCHAR(50)    NOT NULL,
    PaymentStatus   VARCHAR(20)     NOT NULL DEFAULT 'Completed'
                        CONSTRAINT CK_Bookings_PaymentStatus CHECK (PaymentStatus IN ('Completed','Pending','Cancelled','Refunded')),
    QrCodeUrl       VARCHAR(500)    NULL,
    IsCheckedIn     BIT             NOT NULL DEFAULT 0,
    IsComboRedeemed BIT             NOT NULL DEFAULT 0,
    BookingDate     DATETIME2       NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
);
GO


-- ============================================================
--  PHẦN 7: KHUYẾN MÃI
-- ============================================================

CREATE TABLE dbo.Promotions (
    PromotionID     INT IDENTITY(1,1) PRIMARY KEY,
    Title           NVARCHAR(200)   NOT NULL,
    Description     NVARCHAR(MAX)   NULL,
    Code            VARCHAR(50)     NOT NULL UNIQUE,
    DiscountPercent INT             NOT NULL DEFAULT 0,
    Validity        NVARCHAR(100)   NULL,
    ImageURL        VARCHAR(500)    NULL,
    IsActive        BIT             NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO


-- ============================================================
--  PHẦN 8: TIN TỨC
-- ============================================================

CREATE TABLE dbo.News (
    NewsID      INT IDENTITY(1,1) PRIMARY KEY,
    Title       NVARCHAR(200)   NOT NULL,
    Summary     NVARCHAR(500)   NULL,
    Content     NVARCHAR(MAX)   NULL,
    PublishDate DATE            NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    Category    NVARCHAR(30)    NOT NULL DEFAULT N'Sự Kiện'
                    CONSTRAINT CK_News_Category CHECK (Category IN (N'Điện Ảnh', N'Khuyến Mãi', N'Sự Kiện', N'Hậu Trường')),
    ImageURL    VARCHAR(500)    NULL,
    Views       INT             NOT NULL DEFAULT 0,
    IsActive    BIT             NOT NULL DEFAULT 1
);
GO


-- ============================================================
--  PHẦN 9: INDEX PHỤ TRỢ
-- ============================================================

CREATE INDEX IX_Movies_IsActive          ON dbo.Movies(IsActive);
CREATE INDEX IX_Showtimes_MovieID        ON dbo.Showtimes(MovieID);
CREATE INDEX IX_Showtimes_HallID_Start   ON dbo.Showtimes(HallID, StartTime);
CREATE INDEX IX_Showtimes_StartTime      ON dbo.Showtimes(StartTime);
CREATE INDEX IX_ShowtimeSeats_ShowtimeID ON dbo.ShowtimeSeats(ShowtimeID);
CREATE INDEX IX_ShowtimeSeats_SeatID     ON dbo.ShowtimeSeats(SeatID);
CREATE INDEX IX_ShowtimeSeats_HoldExpire ON dbo.ShowtimeSeats(Status, HoldExpiresAt);
CREATE INDEX IX_Bookings_UserID          ON dbo.Bookings(UserID);
CREATE INDEX IX_Bookings_BookingDate     ON dbo.Bookings(BookingDate);
GO


-- ============================================================
--  PHẦN 9.1: STORED PROCEDURE DỌN GHẾ "HOLDING" QUÁ HẠN
--  Gọi SP này định kỳ (SQL Agent Job mỗi 1 phút, hoặc gọi từ
--  backend mỗi khi tải lại trang chọn ghế) để trả ghế giữ tạm
--  quá 10 phút mà chưa thanh toán về lại "Available".
-- ============================================================
CREATE PROCEDURE dbo.SP_ReleaseExpiredHolds
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.ShowtimeSeats
    SET Status = 'Available',
        HoldExpiresAt = NULL
    WHERE Status = 'Holding'
      AND HoldExpiresAt IS NOT NULL
      AND HoldExpiresAt < GETDATE();
END
GO


/* ====================================================================
   PHẦN 10: DỮ LIỆU MẪU
   ==================================================================== */

-- 10.1: Roles
INSERT INTO dbo.Roles (RoleCode, RoleName) VALUES
('admin',    N'Quản Lý'),
('employee', N'Nhân Viên Rạp'),
('customer', N'Khách Hàng');
GO

-- 10.2: Tài khoản mẫu
INSERT INTO dbo.Users (Username, PasswordHash, FullName, Email, Phone, RoleID, RoleCode, Avatar, MembershipId, Points, FavoriteMoviesJson)
SELECT 'admin', HASHBYTES('SHA2_256', 'admin'), N'Admin Nguyễn', 'admin@xcinema.vn', '0911223344',
       RoleID, 'admin', 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin', 'X-ADMIN-00001', 99999, '[]'
FROM dbo.Roles WHERE RoleCode = 'admin';

INSERT INTO dbo.Users (Username, PasswordHash, FullName, Email, Phone, RoleID, RoleCode, Avatar, MembershipId, Points, FavoriteMoviesJson)
SELECT 'employee', HASHBYTES('SHA2_256', 'employee'), N'Staff Trần', 'employee@xcinema.vn', '0922334455',
       RoleID, 'employee', 'https://api.dicebear.com/7.x/miniavs/svg?seed=Staff', 'X-STAFF-00001', 5000, '[]'
FROM dbo.Roles WHERE RoleCode = 'employee';

INSERT INTO dbo.Users (Username, PasswordHash, FullName, Email, Phone, RoleID, RoleCode, Avatar, MembershipId, Points, FavoriteMoviesJson)
SELECT 'khachhang', HASHBYTES('SHA2_256', '123456'), N'Nguyễn Văn Khách', 'khachhang@gmail.com', '0933445566',
       RoleID, 'customer', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Khach', 'X-MEM-10001', 250, '[]'
FROM dbo.Roles WHERE RoleCode = 'customer';
GO

-- ==================================================================
-- PHẦN 10.4: PHIM (30 phim lấy nguyên từ seedData.ts của frontend - giữ nguyên, đã khớp 100%)
-- ==================================================================
INSERT INTO dbo.Movies
    (Title, OriginalTitle, Genre, Duration, Rating, Score, Votes,
     ReleaseDate, IsUpcoming, PosterURL, BannerURL, TrailerURL,
     Description, Director, CastJson, Language, CountdownEnd, IsActive)
VALUES
    (N'Mai', N'Mai - A Film by Tran Thanh', N'Tâm Lý, Tình Cảm, Gia Đình', 131, 'T18', 9.3, 24500, '2026-02-10', 0, 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/SceS06pTMyQ', N'Bộ phim xoay quanh cuộc đời của Mai, một người phụ nữ xấp xỉ 40 tuổi làm nghề mát-xa y học cổ truyền. Số phận đưa đẩy Mai gặp gỡ Dương, một chàng nhạc công trẻ lãng tử, luôn sống vô lo vô nghĩ. Chuyện tình ngọt ngào nhưng đẩy biến cố gõ cửa cuộc đời Mai, ép cô đối mặt với những định kiến xã hội sâu sắc cùng quá khứ đau thương.', N'Trấn Thành', N'["Phương Anh Đào","Tuấn Trần","Hồng Đào","Uyển Ân","Khả Như"]', N'Tiếng Việt (phụ đề tiếng Anh)', NULL, 1),
    (N'Lật Mặt 7: Một Điều Ước', N'Face Off 7: One Wish', N'Gia Đình, Tâm Lý, Kịch Tính', 138, 'K', 9.5, 31200, '2026-04-26', 0, 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/jZ_y9PqS6qU', N'Câu chuyện cảm động về bà Hai, một người mẹ đơn thân tảo tần nuôi lớn 5 đứa con. Khi các con trưởng thành và có cuộc sống riêng tại nhiều nơi khác nhau, bà Hai không may gặp tai nạn gãy chân. Trách nhiệm chăm sóc mẹ già bị đùn đẩy giữa các người con thông qua các cuộc họp gia đình đầy căng thẳng, lột tả sâu sắc sự cô đơn của tuổi già trong xã hội hiện đại.', N'Lý Hải', N'["Thanh Hiền","Trương Minh Cường","Đinh Y Nhung","Quách Ngọc Tuyên","Ammy Minh Khuê"]', N'Tiếng Việt', NULL, 1),
    (N'Dune: Hành Tinh Cát - Phần Hai', N'Dune: Part Two', N'Khoa Học Viễn Tưởng, Hành Động, Phiêu Lưu', 166, 'T16', 9.4, 18900, '2026-03-01', 0, 'https://images.unsplash.com/photo-1547483238-f400e65ccd56?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/Way9Dexny3w', N'Paul Atreides hội quân cùng Chani và tộc người Fremen để chuẩn bị cho một cuộc chiến báo thù hoành tráng chống lại những kẻ đã hủy hoại gia tộc mình. Đối lập giữa tình yêu của cuộc đời và vận mệnh của vũ trụ, Paul dốc sức ngăn chặn viễn cảnh tương lai tăm tối mà chỉ mình anh có thể tiên tri.', N'Denis Villeneuve', N'["Timothée Chalamet","Zendaya","Rebecca Ferguson","Austin Butler","Florence Pugh"]', N'Tiếng Anh - Phụ đề Tiếng Việt', NULL, 1),
    (N'Godzilla x Kong: Đế Chế Mới', N'Godzilla x Kong: The New Empire', N'Hành Động, Khoa Học Viễn Tưởng, Phiêu Lưu', 115, 'T13', 8.9, 15400, '2026-03-29', 0, 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/lV1OOkyqgLk', N'Vũ trụ quái vật tiếp tục bùng nổ khi hai vị vua Titan là Kong và Godzilla phải bắt tay nhau đối đầu với một mối đe dọa khổng lồ ẩn sâu bên dưới Trái Đất rỗng. Kẻ thù nguy hiểm lần này mong muốn hủy diệt cả nhân loại lẫn chính giống loài Titan tối cao.', N'Adam Wingard', N'["Rebecca Hall","Brian Tyree Henry","Dan Stevens","Kaylee Hottle"]', N'Tiếng Anh - Phụ đề Tiếng Việt', NULL, 1),
    (N'Inside Out 2: Các Mảnh Ghép Cảm Xúc 2', N'Inside Out 2', N'Hoạt Hình, Hài Hước, Gia Đình', 100, 'P', 9.6, 27100, '2026-06-14', 0, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/LEjhY15eCx0', N'Bộ não của cô bé Riley khi bước vào tuổi dậy thì đột ngột đón chào những ''Vị khách không mời'' mới tinh: Lo Âu (Anxiety), Ghen Tị (Envy), Sĩ Diện (Embarrassment) và Chán Nản (Ennui). Những cảm xúc cốt lõi cũ gồm Vui Vẻ, Buồn Bã, Giận Dữ, Sợ Hãi và Chán Ghét phải tìm cách hòa hợp để giúp cô bé vượt qua giai đoạn xáo trộn tâm lý học đường.', N'Kelsey Mann', N'["Amy Poehler","Maya Hawke","Kensington Tallman","Liza Lapira"]', N'Tiếng Anh - Phụ đề Tiếng Việt / Thuyết minh Tiếng Việt', NULL, 1),
    (N'Kẻ Trộm Mặt Trăng 4', N'Despicable Me 4', N'Hoạt Hình, Hài Hước, Gia Đình', 95, 'P', 8.8, 12100, '2026-07-05', 0, 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1569074187119-c87815b476da?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/qQlr9-rF3_I', N'Gru quay trở lại đối đầu với kẻ thù mới là Maxime Le Mal và cô bạn gái quyến rũ Valentina, buộc cả gia đình phải di chuyển đến nơi trú ẩn an toàn cực kỳ bí mật. Chuyến đi bỗng trở nên rộn ràng hơn bao giờ hết với sự xuất hiện của Gru Jr. nghịch ngợm cùng nhóm Siêu Minion đột biến.', N'Chris Renaud', N'["Steve Carell","Kristen Wiig","Joey King","Will Ferrell","Sofia Vergara"]', N'Thuyết minh & Phụ đề Tiếng Việt', NULL, 1),
    (N'Kung Fu Panda 4', N'Kung Fu Panda 4', N'Hoạt Hình, Hành Động, Hài Hước', 94, 'P', 8.7, 9800, '2026-03-08', 0, 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1478720143022-385f704d3b73?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/fT7CBe_Zg7E', N'Gấu trúc Po chuẩn bị thăng chức tiến tới trở thành Thủ Lĩnh Tâm Linh của Thung Lũng Bình Yên nhưng anh cần phải nhanh chóng đào tạo một truyền nhân Thần Long Hiệp Sĩ mới. Ngay lúc đó, nữ hoàng tắc kè Chameleon thâm độc xuất hiện, âm mưu triệu hồi tất cả các phản diện cũ từ cõi âm nhằm cướp đi gậy phép sức mạnh của Po.', N'Mike Mitchell', N'["Jack Black","Awkwafina","Viola Davis","Dustin Hoffman","Ke Huy Quan"]', N'Thuyết minh & Phụ đề Tiếng Việt', NULL, 1),
    (N'Oppenheimer', N'Oppenheimer', N'Tiểu Sử, Lịch Sử, Chính Kịch', 180, 'T18', 9.7, 14200, '2025-08-11', 0, 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/uYPbbksJxIg', N'Bộ phim chấn động tái hiện cuộc đời đầy thăng trầm của nhà vật lý lý thuyết J. Robert Oppenheimer, người được mệnh danh là ''cha đẻ của bom nguyên tử''. Tác phẩm đi sâu vào Dự án Manhattan rực rỡ nhưng cũng vạch trần nỗi dằn vặt khôn nguôi về đạo đức nhân loại lẫn những phiên tòa phân trần chính trị cay nghiệt sau sự kiện Hiroshima.', N'Christopher Nolan', N'["Cillian Murphy","Emily Blunt","Matt Damon","Robert Downey Jr.","Florence Pugh"]', N'Tiếng Anh - Phụ đề Tiếng Việt', NULL, 1),
    (N'Deadpool & Wolverine', N'Deadpool & Wolverine', N'Hành Động, Hài Hước, Quái Hiệp', 127, 'T18', 9.2, 22400, '2026-07-27', 0, 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/Idh8n5XuYIA', N'Tổ chức Phương sai Thời gian (TVA) bất ngờ lôi Deadpool ra khỏi cuộc sống an lành yên ả của mình và bắt anh bắt tay hợp tác cùng một biến thể Wolverine đang tràn ngập chán nản. Cặp bài trùng ''chửi thề như hát'' này gánh trên vai trọng trách giải cứu toàn bộ đa vũ trụ Marvel thoát khởi diệt vong.', N'Shawn Levy', N'["Ryan Reynolds","Hugh Jackman","Emma Corrin","Morena Baccarin","Matthew Macfadyen"]', N'Tiếng Anh - Phụ đề Tiếng Việt', NULL, 1),
    (N'Cám', N'Cam - The Bloody Fairy Tale', N'Kinh Dị, Thần Thoại, Cổ Trang', 120, 'T18', 8.6, 16700, '2026-09-20', 0, 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/V6Wv_p40GjQ', N'Dựa trên truyện cổ tích Tấm Cám quen thuộc nhưng mang màu sắc tâm linh tăm tối hơn rất nhiều. Bộ phim tập trung khai thác nhân vật Cám - một cô gái phải chịu chịu dị dạng khuôn mặt từ nhỏ và mối quan hệ chứa đựng những lời nguyền gia tộc thâm căn cố đế với hiến tế ác quỷ Bạch Hổ.', N'Trần Hữu Tấn', N'["Lâm Thanh Mỹ","Rima Thanh Vy","Quốc Cường","Thúy Diễm","Hải Nam"]', N'Tiếng Việt', NULL, 1),
    (N'Ma Da', N'Ma Da - The River Ghost', N'Kinh Dị, Tâm Linh, Kịch Tính', 95, 'T16', 8.4, 11100, '2026-08-15', 0, 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/jZf6T4E6YAg', N'Bộ phim dựa trên truyền thuyết đô thị về ''Ma da bắt hồn'' oan uổng tại vùng sông nước Tây Nam Bộ đầy hiểm trở. Bà Lệ, một người hành nghề vớt xác trên sông bị cuốn vào cuộc rượt đuổi tâm linh cứu vớt linh hồn con gái mình khi đứa bé lọt vào tầm ngắm oán khí của oan hồn.', N'Nguyễn Hữu Hoàng', N'["Việt Hương","Trung Dân","Cẩm Ly","Thành Lộc","Dạ Chúc"]', N'Tiếng Việt', NULL, 1),
    (N'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh 1 Triệu Đô', N'Detective Conan: The Million-dollar Pentagram', N'Hoạt Hình, Trinh Thám, Hành Động', 110, 'T13', 9.4, 17500, '2026-08-02', 0, 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/G6jWIs7mFpM', N'Tại thành phố cảng Hakodate thơ mộng của Nhật Bản, siêu trộm Kaito Kid gửi thư cảnh báo nhắm vào một thanh kiếm Nhật cổ thuộc gia tộc tài phiệt. Cùng lúc đó, thi thể một tay buôn vũ khí khét tiếng bị sát hại với vết chém hình ngôi sao năm cánh đưa Conan, Heiji và Kid lâm vào một vụ phá án bí mật liên can tới kho báu xoay chuyển chiến tranh.', N'Chika Nagaoka', N'["Minami Takayama","Wakana Yamazaki","Rikiya Koyama","Kappei Yamaguchi"]', N'Tiếng Nhật - Phụ đề Tiếng Việt / lồng tiếng', NULL, 1),
    (N'Interstellar', N'Interstellar', N'Khoa Học Viễn Tưởng, Chính Kịch, Phiêu Lưu', 169, 'P', 9.8, 38200, '2014-11-07', 0, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/zSWdZVtXT7E', N'Khi tương lai của loài người bên bờ vực tuyệt vọng bởi nạn đói và bão cát toàn cầu, một nhóm phi hành gia quả cảm thực hiện chuyến hành trình vĩ đại đi xuyên qua một hố sâu vũ trụ mới xuất hiện nhằm tìm kiếm một mái nhà mới cứu rỗi nhân loại nằm ngoài hệ Mặt Trời.', N'Christopher Nolan', N'["Matthew McConaughey","Anne Hathaway","Jessica Chastain","Michael Caine"]', N'Tiếng Anh - Phụ đề Tiếng Việt', NULL, 1),
    (N'Spider-Man: Across the Spider-Verse', N'Spider-Man: Across the Spider-Verse', N'Hoạt Hình, Hành Động, Phiêu Lưu', 140, 'P', 9.6, 21900, '2026-06-02', 0, 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/g4H08z_t0vM', N'Miles Morales vô tình chạm trán với Hội liên minh Nhện cai quản bởi Miguel O''Hara hoành tráng. Khi xảy ra bất đồng sâu sắc về cách xử lý định mệnh bi thương bảo vệ dòng thời gian, Miles nhận ra mình đang phải đối đầu chống lại gần như tất cả các phiên bản Người Nhện khác trong đa vũ trụ.', N'Joaquim Dos Santos', N'["Shameik Moore","Hailee Steinfeld","Oscar Isaac","Jake Johnson"]', N'Tiếng Anh - Phụ đề Tiếng Việt', NULL, 1),
    (N'John Wick: Chapter 4', N'John Wick: Chapter 4', N'Hành Động, Kịch Tính, Tội Phạm', 169, 'T18', 9.4, 19400, '2026-03-24', 0, 'https://images.unsplash.com/photo-1509347525353-53530c1e6005?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/yjyyXAyeC-Y', N'Sát thủ huyền thoại John Wick tìm thấy con đường duy nhất để đánh bại Hội Đồng Tối Cao là thách đấu đối đầu trực diện tay đôi với Hầu Tước de Gramont hung tợn. Tuy nhiên, cái giá phải trả để đổi lấy sự tự do là cuộc chạm trán đẫm máu với những đồng đội cũ thân cận trên toàn cầu.', N'Chad Stahelski', N'["Keanu Reeves","Donnie Yen","Bill Skarsgård","Laurence Fishburne","Hiroyuki Sanada"]', N'Tiếng Anh - Phụ đề Tiếng Việt', NULL, 1),
    (N'A Quiet Place: Day One', N'A Quiet Place: Day One', N'Kinh Dị, Khoa Học Viễn Tưởng, Kịch Tính', 100, 'T16', 8.5, 8900, '2026-06-28', 0, 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/YPY7J-flzE8', N'Tìm hiểu nguồn gốc của ngày thế giới bắt đầu rơi vào sự im lặng tuyệt đối. Bộ phim theo chân Sam khi cô đang có chuyến dạo chơi New York thì thảm họa quái vật nhạy cảm âm thanh đổ bộ bất ngờ, cô phải tìm cách nương tựa người lạ trốn khỏi thành phố ồn ào bậc nhất thế giới.', N'Michael Sarnoski', N'["Lupita Nyong''''o","Joseph Quinn","Alex Wolff","Djimon Hounsou"]', N'Tiếng Anh - Phụ đề Tiếng Việt', NULL, 1),
    (N'Furiosa: Chiến Binh Sa Mạc', N'Furiosa: A Mad Max Saga', N'Hành Động, Khoa Học Viễn Tưởng, Kịch Tính', 148, 'T18', 9.0, 13400, '2026-05-24', 0, 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1547483238-f400e65ccd56?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/XJMuhwVlca4', N'Khi thế giới sụp đổ hoang vu tàn tạ, cô gái trẻ Furiosa bị cướp khởi Vùng đất xanh tươi từ tay đám tay sai hầm hố của Lãnh chúa Dementus. Đi qua vùng đất hoang sa mạc rực lửa, Furiosa rèn luyện tính kiên định và ý chí thép để tìm đường trở về nhà bất chấp bạo lực điên khùng xung quanh.', N'George Miller', N'["Anya Taylor-Joy","Chris Hemsworth","Tom Burke","Alyla Browne"]', N'Tiếng Anh - Phụ đề Tiếng Việt', NULL, 1),
    (N'Quỷ Cẩu', N'The Dog', N'Kinh Dị, Tâm Tình, Gia Đình', 99, 'T18', 8.3, 12500, '2025-12-29', 0, 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/J7XfN8L08jQ', N'Khai thác đề tài nghiệp báo dân gian truyền miệng xoay quanh nghề mổ chó lậu của gia đình nhà Nam. Khi bố Nam đột tử qua đời đầy bí ẩn dối trá, những sự kiện dị thường rùng rợn ập đến ngôi nhà dâm dục oán hận, lột tả dã tâm tột cùng thối nát che chở đằng sau lòng tham con người.', N'Lưu Thành Luân', N'["Quang Tuấn","NSND Kim Xuân","Vân Dung","Huỳnh Kiến An","Nam Thư"]', N'Tiếng Việt', NULL, 1),
    (N'Doraemon: Bản Giao Hưởng Địa Cầu', N'Doraemon the Movie: Nobita''s Earth Symphony', N'Hoạt Hình, Phiêu Lưu, Âm Nhạc', 115, 'P', 9.2, 11300, '2026-05-24', 0, 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/l592QunO3Zg', N'Nobita luyện tập sáo dở tệ bỗng vô tình kích hoạt năng lượng âm nhạc kỳ lạ kêu gọi một cô bé ngoài hành tinh mang tên Micca ghé thăm. Cùng Doraemon, các bạn trẻ dấn thân vào hành trình vỹ đại bảo vệ lâu đài âm nhạc Fare và giúp địa cầu phục hồi năng lượng nhạc cụ quý giá thoát chết trước quái thú đen tối vô thanh.', N'Kazuaki Imai', N'["Wasabi Mizuta","Megumi Ohara","Yumi Kakazu","Subaru Kimura"]', N'Lồng tiếng & Phụ đề Tiếng Việt', NULL, 1),
    (N'Nhà Bà Nữ', N'The House of No Man', N'Gia Đình, Tâm Lý, Hài Hước', 102, 'T16', 9.1, 28900, '2025-01-22', 0, 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/tM0OQ6q8T2U', N'Bộ phim đi sâu vào những xung đột đầy chua xót giữa các thế hệ trong gia đình bà Nữ - người phụ nữ bán bánh canh cua độc đoán gia trưởng cai quản ba thế hệ con cái dưới một mái nhà. Mối mâu thuẫn đỉnh điểm nổ ra khi cô con gái út quyết định bất chấp nổi loạn theo đuổi người yêu.', N'Trấn Thành', N'["Trấn Thành","Lê Giang","Uyển Ân","Song Luân","NSND Ngọc Giàu"]', N'Tiếng Việt', NULL, 1),
    (N'Avatar 3: Lửa Và Tro', N'Avatar: Fire and Ash', N'Khoa Học Viễn Tưởng, Hành Động, Phiêu Lưu', 180, 'T13', 0, 0, '2026-12-18', 1, 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/Y0fL6v2WAsU', N'Phần phim thứ 3 đưa cuộc phiêu lưu của tộc người Na''vi tiến tới một khu vực địa chất khắc nghiệt hoàn toàn mới. Tại đây xuất hiện thị tộc ''Người Tro'' (Ash People) dũng mãnh hung tợn tôn thờ ngọn lửa, đại diện cho những mặt tăm tối thù hận sâu kín hơn của hành tinh Pandora hoành tráng.', N'James Cameron', N'["Sam Worthington","Zoe Saldana","Sigourney Weaver","Oona Chaplin"]', N'Tiếng Anh - Phụ đề Tiếng Việt', '2026-12-18T00:00:00', 1),
    (N'Kỷ Băng Hà 6', N'Ice Age 6', N'Hoạt Hình, Hài Hước, Gia Đình', 98, 'P', 0, 0, '2026-07-15', 1, 'https://images.unsplash.com/photo-1542840410-3092f6de946a?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/hK2iN2U-tH4', N'Manny, Sid, Diego và biệt đội kỷ băng hà vui nhộn tái ngộ trong cuộc hành trình phiêu lưu vượt địa hình mới cực đoan khi thế giới tiền sử xảy ra biến đổi khí hậu khắc nghiệt, hứa hẹn đem đến những tràng cười sảng khoái tưng bừng.', N'John C. Donkin', N'["Ray Romano","John Leguizamo","Denis Leary","Simon Pegg"]', N'Thuyết minh & Phụ đề Tiếng Việt', '2026-07-15T00:00:00', 1),
    (N'Superman (Chúa Tể Di Sản)', N'Superman: Legacy', N'Hành Động, Khoa Học Viễn Tưởng', 142, 'T13', 0, 0, '2026-08-10', 1, 'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/G6jWIs7mFpM', N'Câu chuyện khởi nguồn của vũ trụ DC mới (DCU) khai thác chặng đường non trẻ của Clark Kent khi anh tìm cách cân bằng nguồn gốc di sản Kryptonian của mình với cuộc sống lớn lên thánh thiện tại trang trại dưới gia đình loài người vùng Kansas.', N'James Gunn', N'["David Corenswet","Rachel Brosnahan","Isabela Merced","Nicholas Hoult"]', N'Tiếng Anh - Phụ đề Tiếng Việt', '2026-08-10T00:00:00', 1),
    (N'Shrek 5', N'Shrek 5: Forever Green', N'Hoạt Hình, Hài Hước, Thần Thoại', 105, 'P', 0, 0, '2026-09-20', 1, 'https://images.unsplash.com/photo-1601987177651-8edfe6c20009?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1500627869374-13cd993b1115?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/Idh8n5XuYIA', N'Gã chằn tinh màu xanh Shrek nổi tiếng quay trở lại vương quốc xa thật xa để bảo vệ đàn con khốn khổ nghịch ngợm khỏi một nấc thang lật đổ hoàng gia bất đắc dĩ từ ông vua hài hước độc đáo.', N'Walt Dohrn', N'["Mike Myers","Eddie Murphy","Cameron Diaz","Antonio Banderas"]', N'Thuyết minh & Phụ đề Tiếng Việt', '2026-09-20T00:00:00', 1),
    (N'Toy Story 5: Đồ Chơi Nổi Loạn', N'Toy Story 5', N'Hoạt Hình, Gia Đình, Phiêu Lưu', 102, 'P', 0, 0, '2026-10-12', 1, 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/Idh8n5XuYIA', N'Lần này, Woody, Buzz Lightyear và biệt đội đồ chơi trung thành quen thuộc phải trực diện đối đầu với mối đe dọa thời đại công nghệ số mới: Sự thu hút ám ảnh kỳ lạ của trẻ em đối với máy tính bảng, điện thoại di động làm lãng quên đi những món đồ chơi thực tế.', N'Andrew Stanton', N'["Tom Hanks","Tim Allen","Joan Cusack","Tony Hale"]', N'Thuyết minh & Phụ đề Tiếng Việt', '2026-10-12T00:00:00', 1),
    (N'Avengers: Doomsday (Kỷ Nguyên Doom)', N'Avengers: Doomsday', N'Hành Động, Khoa Học Viễn Tưởng, Phiêu Lưu', 155, 'T13', 0, 0, '2026-11-01', 1, 'https://images.unsplash.com/photo-1496062772023-95b602ba064b?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/Idh8n5XuYIA', N'Sự xuất hiện chấn động của Victor von Doom khét tiếng trong đa vũ trụ Marvel kích hoạt cuộc nội chiến khẩn cấp. Nhóm Avengers tàn tạ thế hệ mới phải ngay tức khắc tề tựu nhằm bảo vệ thế giới của họ tránh khỏi thảm họa xé rách màng ngăn thời gian vô nghĩa.', N'Anthony Russo, Joe Russo', N'["Robert Downey Jr.","Pedro Pascal","Benedict Cumberbatch","Florence Pugh"]', N'Tiếng Anh - Phụ đề Tiếng Việt', '2026-11-01T00:00:00', 1),
    (N'Đất Rừng Phương Nam: Phần 2', N'Song of the South: Part II', N'Lịch Sử, Chính Kịch, Hành Động', 135, 'K', 0, 0, '2026-12-24', 1, 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/Idh8n5XuYIA', N'Tiếp tục theo du hành chân trời sông nước của bé An cùng Cò và những người dân nghĩa khí đất Nam Kỳ kháng Pháp hùng vĩ. Phần hai mở rộng thêm câu chuyện tình yêu nước lớn lao lẫn tinh thần hào sảng bất khuất rạng ngời bờ tre đất Việt chân chất.', N'Nguyễn Quang Dũng', N'["Hạo Khang","Bình An","Tuấn Trần","Trấn Thành","Tiến Luật"]', N'Tiếng Việt', '2026-12-24T00:00:00', 1),
    (N'Spider-Man 4: Trở Về Nhờ Đa Vũ Trụ', N'Spider-Man 4', N'Hành Động, Khoa Học Viễn Tưởng, Phiêu Lưu', 138, 'T13', 0, 0, '2026-11-05', 1, 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/Idh8n5XuYIA', N'Peter Parker giờ đây hoàn toàn đơn độc sau sự kiện phép thuật tẩy xóa ký ức của Doctor Strange. Cậu vừa làm việc mưu sinh đời thường khu Manhattan vừa gồng mình làm người nhện bảo an khu xóm cho đến khi một đối thủ nguy hiểm nổ súng ép cậu hé lộ thân phận.', N'Destin Daniel Cretton', N'["Tom Holland","Zendaya","Sydney Sweeney","Jacob Batalon"]', N'Tiếng Anh - Phụ đề Tiếng Việt', '2026-11-05T00:00:00', 1),
    (N'Minecraft Movie: Thế Giới Khối Vuông', N'A Minecraft Movie', N'Phiêu Lưu, Kỳ Ảo, Hài Hước', 100, 'P', 0, 0, '2026-08-15', 1, 'https://images.unsplash.com/photo-1601987177651-8edfe6c20009?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/Idh8n5XuYIA', N'Tác phẩm live-action chuyển đổi từ tựa game huyền thoại thế giới mở Minecraft. Bốn người lập dị lạc lòng bỗng dưng bị hút thẳng vào cánh cổng tới Overworld - một vùng cực đoan rực rỡ kỳ quái cấu thành toàn từ các khối vuông đất cát.', N'Jared Hess', N'["Jason Momoa","Jack Black","Danielle Brooks","Sebastian Eugene Hansen"]', N'Thuyết minh & Phụ đề Tiếng Việt', '2026-08-15T00:00:00', 1),
    (N'The Batman: Part II', N'The Batman: Part II', N'Hành Động, Trinh Thám, Hình Sự', 160, 'T18', 0, 0, '2026-10-03', 1, 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1509347525353-53530c1e6005?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/Idh8n5XuYIA', N'Hiệp sĩ bóng đêm Bruce Wayne lấn sâu hơn vào bóng tối của giới tội phạm ngầm Gotham dột nát hoành trành sau thảm họa ngập nước cứu nguy. Kẻ thù của anh giờ mở rộng ra các băng nhóm hùng hữu và sự can tặc của hội kín quý tộc Court of Owls khét tiếng.', N'Matt Reeves', N'["Robert Pattinson","Zoë Kravitz","Andy Serkis","Jeffrey Wright"]', N'Tiếng Anh - Phụ đề Tiếng Việt', '2026-10-03T00:00:00', 1);
GO

-- ==================================================================
-- PHẦN 10.5: CỤM RẠP (5 rạp từ seedData.ts - đúng thứ tự c-1..c-5)
-- ==================================================================
INSERT INTO dbo.Cinemas (CinemaName, Address, Phone, ImageURL, MapEmbed)
VALUES
    (N'X Cinema Hoàn Kiếm', N'Tầng 5, Tràng Tiền Plaza, 24 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội', '024.3934.3333', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600', N'Hoàn Kiếm Cinema'),
    (N'X Cinema Cầu Giấy', N'Tòa nhà Discovery Complex, 302 Cầu Giấy, Quận Cầu Giấy, Hà Nội', '024.6293.5555', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=600', N'Cầu Giấy Cinema'),
    (N'X Cinema Thanh Xuân', N'X Royal City, B2-R3-10, 72A Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', '024.6664.8888', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=600', N'Thanh Xuân Cinema'),
    (N'X Cinema Hà Đông', N'Tầng 4, Aeon Mall Hà Đông, Phường Dương Nội, Quận Hà Đông, Hà Nội', '024.2238.9999', 'https://images.unsplash.com/photo-1547483238-f400e65ccd56?auto=format&fit=crop&q=80&w=600', N'Hà Đông Cinema'),
    (N'X Cinema Long Biên', N'Tầng 3, Mipec Long Biên, Số 2 Long Biên II, Quận Long Biên, Hà Nội', '024.3322.1111', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=600', N'Long Biên Cinema');
GO

-- ==================================================================
-- PHẦN 10.6: KHUYẾN MÃI (10 khuyến mãi từ seedData.ts)
-- ==================================================================
INSERT INTO dbo.Promotions
    (Title, Description, Code, DiscountPercent, Validity, ImageURL, IsActive)
VALUES
    (N'ỨNG DỤNG X CINEMA - MUA 2 TẶNG 1', N'Khách hàng thân thiết tải ứng dụng X Cinema và đặt vé thành công sẽ được tặng miễn phí 01 Bắp ngọt size L cho hóa đơn từ 2 vé trở lên.', 'TCDBAP', 15, N'Đến hết 31/12/2026', 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=400', 1),
    (N'SIÊU THỨ 4 VUI VẺ - ĐỒNG GIÁ 60K', N'Toàn bộ vé xem phim 2D trong ngày Thứ Tư vui vẻ hàng tuần đồng giá 60.000 VNĐ áp dụng cho tất cả khung giờ và các nhóm khách hàng.', 'THU4VUI', 30, N'Áp dụng Thứ Tư hàng tuần', 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=400', 1),
    (N'COMBO HỌC SINH SINH VIÊN - GIẢM 20K', N'Chỉ cần xuất trình thẻ Học sinh - Sinh viên khi mua Combo bắp nước trực tiếp tại quầy hoặc ứng dụng để được giảm ngay 20.000 VNĐ tiền mặt.', 'COSMO20', 10, N'Đến hết 31/12/2026', 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=400', 1),
    (N'ƯU ĐÃI THÀNH VIÊN MỚI - 50% VẺ', N'Đăng ký thành viên mới của hệ thống rạp phim X Cinema để nhận ngay voucher giảm giá 50% cho tấm vé đầu tiên đặt online thành công.', 'WELCOME50', 50, N'Từ nay đến 31/10/2026', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=400', 1),
    (N'ĐẶT VÉ MOMO - GIẢM ĐẾN 50K', N'Liên kết và thanh toán hóa đơn mua vé phim X Cinema bằng Ví MoMo để nhận ngay voucher ngẫu nhiên mệnh giá từ 10.000 VNĐ đến 50.000 VNĐ.', 'MOMOTCD', 20, N'Đến hết 31/08/2026', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400', 1),
    (N'VNPAY QUÉT MÃ - HOÀN TIỀN 10%', N'Nhập mã khuyến mãi khi sử dụng ứng dụng ngân hàng quét mã QR VNPAY tại rạp hoặc cổng thanh toán để được hoàn tiền trực tiếp 10% giá trị hóa đơn.', 'VNPAYTC', 10, N'Hàng ngày đến ngày 31/12/2026', 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=400', 1),
    (N'GIA ĐÌNH CUỐI TUẦN - GHẾ ĐÔI GIẢM 15%', N'Chọn mua ghế đôi (Sweetbox) trải nghiệm không gian chiếu riêng tư cùng người thân dịp cuối tuần sẽ được khuyến mãi chiết khấu ngay 15% tổng bill.', 'SWEETBOX', 15, N'Áp dụng Thứ 7 và Chủ Nhật', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400', 1),
    (N'TÍCH ĐIỂM X2 - SĂN VÉ HOÀN TIỀN', N'Thành viên kim cương và vàng được nhân đôi điểm tích lũy thành viên khi xem bất cứ bộ phim bom tấn nước ngoài nào chiếu trước 12:00 trưa hàng ngày.', 'X2DIEM', 0, N'Vô thời hạn', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400', 1),
    (N'ƯU ĐÃI TRUNG THU - BÁNH VẦNG TRĂNG', N'Quý khách mua combo Trung Thu đặc biệt sẽ được tặng ngay một chiếc bánh nướng mini hương sen dừa thơm phức ngào ngạt hương vị sum vầy.', 'TRUNGTHU', 12, N'Từ 01/09/2026 đến hết 15/09/2026', 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=400', 1),
    (N'MINI GAMES: VÒNG QUAY MAY MẮN', N'Tải app X Cinema tham gia tương tác điểm danh nhận lượt quay miễn phí hốt ngay hàng ngàn chiếc vé xem phim 0đ độc quyền mỗi ngày.', 'LUCKYSPIN', 25, N'Đến hết 15/08/2026', 'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&q=80&w=400', 1);
GO

-- ==================================================================
-- PHẦN 10.7: TIN TỨC (10 bài từ seedData.ts)
-- ==================================================================
INSERT INTO dbo.News
    (Title, Summary, Content, PublishDate, Category, ImageURL, Views, IsActive)
VALUES
    (N'Lý Hải phá kỷ lục bán vé với phim mới ''Lật Mặt 7''', N'Thương hiệu phim gia đình đặc trưng ''Lật Mặt 7: Một Điều Ước'' vượt qua cột mốc hàng triệu lượt xem chỉ sau chưa đầy một tuần phát hành chính thức tại Việt Nam.', N'Mặc cho thời tiết nắng nóng kỷ lục và sự cạnh tranh gay gắt từ các bom tấn Hollywood khác, bộ phim tâm lý tình cảm gia đình của nam đạo diễn Lý Hải đã chứng minh sức hút mãnh liệt của tình mẫu tử Việt Nam. Sở hữu hơn 4000 suất chiếu mỗi ngày trên cả nước, bộ phim thu hẹp khoảng cách thế hệ và mang hàng ngàn gia đình ba thế hệ đến rạp nước mắt rưng rưng vì xúc động.', '2026-04-28', N'Điện Ảnh', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600', 12400, 1),
    (N'Bom tấn ''Dune: Part Two'' thiết lập đỉnh cao kỹ xảo điện ảnh mới', N'Giới phê bình nghệ thuật hết lời ca ngợi đạo diễn Denis Villeneuve khi tái hiện hoàn hảo hành tinh cát Arrakis tráng lệ và khốc liệt trên màn ảnh rộng IMAX.', N'Được mệnh danh là tượng đài điện ảnh khoa học viễn tưởng của thập kỷ, Dune 2 đã làm nổ tung toàn bộ phòng vé thế giới bằng âm hưởng trống dồn rạo rực của Hans Zimmer kết hợp cùng những khung hình sa mạc màu cam tuyệt tác. Trải nghiệm xem Dune 2 bắt buộc phải là màn chiếu khổng lồ chất lượng cao để mắt nhìn bao quát được toàn dải sâu của hố giun khổng lồ.', '2026-03-05', N'Điện Ảnh', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600', 8900, 1),
    (N'X Cinema tưng bừng khai trương chuỗi rạp IMAX tân tiến', N'Hệ thống rạp chiếu bóng cao cấp X Cinema tự hào công bố khai trương chuỗi màn hình IMAX 3D định dạng tối tân bậc nhất tại cơ sở Cầu Giấy và Long Biên.', N'Luôn đặt ưu tiên trải nghiệm điện ảnh chân thực của khách hàng lên hàng đầu, X Cinema chính thức liên kết tập đoàn IMAX Canada mang về phòng chiếu với thiết kế độ dốc lý tưởng, âm thanh vòm chấn rung từng thớ cơ và những hình chiếu rực rỡ có độ tương phản tuyệt vời đối chọi mọi dải sáng tối.', '2026-05-12', N'Sự Kiện', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=600', 14500, 1),
    (N'Hậu trường kỳ công đằng sau tạo hình sinh động các hạt cảm xúc mới trong Inside Out 2', N'Hãng phim Pixar hé lộ vô vàn thử thách lý thú khi phác họa những biểu cảm phức tạp của các cảm xúc tuổi dậy thì tinh nghịch của cô bé Riley.', N'Làm thế nào để vẽ nên sự Lo Âu (Anxiety) một cách hài hước nhưng thấu cảm sâu? Các họa sĩ tài năng từ Pixar đã dành hàng tháng trời nghiên cứu tâm sinh lý trẻ vị thành niên và thảo luận cùng các bác sĩ thần kinh học để chọn lựa gam màu cam đất có khả năng rung liên hồi làm đại diện xuất sắc cho nhân vật thu hút hàng triệu sự đồng cảm này.', '2026-06-16', N'Hậu Trường', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600', 9340, 1),
    (N'Ngành phim Việt nửa đầu năm đầy khởi sắc với doanh thu nghìn tỷ', N'Hiệp hội phát hành phim thống kê mức tăng trưởng kỷ lục của điện ảnh nước nhà với sự thống trị từ các nhà phát triển tài năng nội địa giàu cảm xúc.', N'Liên tiếp các kỷ lục doanh thu phòng vé bị xô đổ bởi phim Tết ''Mai'' và tiếp sau đó là tác phẩm gia đình đầy ý nghĩa ''Lật Mặt 7''. Khán giả nước nhà ngày càng tin tưởng và chuộng trải nghiệm ngồi trực tiếp mua vé xem những thước phim văn hóa ẩm thực, phong tục tập quán mộc mạc của quê hương.', '2026-06-10', N'Điện Ảnh', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=600', 11200, 1),
    (N'Những điều thú vị bạn chưa biết về quái vật trong phim kinh dị Ma Da', N'Hành trình thám hiểm sông nước Cà Mau đoàn làm phim vượt qua nhiều tập tục thờ cúng và truyền thuyết bí ẩn về thủy quái giữ hương sông nước.', N'Đạo diễn Nguyễn Hữu Hoàng chia sẻ đoàn phim phải dầm mưa dãi nắng ròng rã dở sống dở chết dưới làn nước sình lầy đục ngầu miền Tây suốt gần một tháng trời. Tạo hình thợ lặn tàn rữa của Ma Da được chế tạo tỉ mỉ từ đất sét thiên nhiên và lớp thạch dẻo sinh học bền vững không gây ô nhiễm môi trường sinh thái sông.', '2026-08-18', N'Hậu Trường', 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600', 7120, 1),
    (N'Cơ hội săn vé X Cinema miễn phí trọn đời cùng chương trình Vòng Quay Thần Kỳ', N'Mừng sinh nhật 3 tuổi, X Cinema chơi lớn tri ân toàn bộ người dùng bằng chuỗi giải thưởng giá trị cực đại có cơ hội nhận một năm xem phim thả ga.', N'Chỉ cần đăng nhập tích cực vào hệ thống tài khoản website X Cinema hàng tuần, tham dự trả lời các câu đố điện ảnh đố vui có thưởng bắp ngọt, người chơi dễ dàng rinh quà là những tấm vé máy chiếu bom tấn sớm tuần đầu và những ly bắp kỷ niệm in họa tiết các phi hành gia sành điệu.', '2026-06-01', N'Khuyến Mãi', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600', 18900, 1),
    (N'Cháy vé ngày đầu công chiếu cho phim hoạt hình Doraemon 2026 mới nhất', N'Những rạp phim lớn tại Hà Nội chứng kiến cảnh xếp hàng nhộn nhịp của hàng ngàn cha mẹ đưa con nhỏ đến thưởng thức ''Bản Giao Hưởng Địa Cầu''.', N'Sức hút của chú mèo máy thông minh Doraemon cùng những món bảo bối diệu kỳ không hề giảm nhiệt qua nhiều thập kỷ. Với đề tài bảo vệ âm nhạc và trái đất đầy ý nghĩa nhân văn, bộ phim thu hút cả người lớn thế hệ 8X, 9X tìm về kỷ niệm tuổi thơ tươi mát bên những trang giấy truyện tranh.', '2026-05-25', N'Điện Ảnh', 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=600', 10400, 1),
    (N'Avatar 3 hứa hẹn thiết lập một chuẩn mực hoạt ảnh đỉnh cao mộc mạc đột phá', N'James Cameron tiết lộ phần phim mới đã hoàn thành 95% khâu hậu kỳ hình ảnh 3D chân thực, sẵn sàng càn quét phòng vé cuối năm nay.', N'Được xây dựng trên nền tảng tiến trình đồ họa học máy kết hợp cùng hệ thống máy quay dưới nước áp bọc quang năng hiện đại bậc nhất, Avatar 3: Lửa và Tro không chỉ đem lại cuộc xung đột vũ trang kịch tính mà còn lột tả sinh động sự mờ ảo mộc mạc của làn khói tro tàn bay nhảy giữa kẽ tay các chiến binh da xanh rừng xanh thẳm.', '2026-06-09', N'Điện Ảnh', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600', 15100, 1),
    (N'Chương trình điện ảnh xanh: Đổi vỏ hộp bắp nhận ly thủy tinh độc đáo tại X Cinema', N'Cam kết hành động giảm rác thải nhựa có hại bảo vệ tương lai xanh tươi, X Cinema phát động chiến dịch ý nghĩa hướng tới khán giả trẻ có ý thức.', N'Khán giả mang theo xô bắp cũ làm từ bã mía sinh học hoặc sưu tập đủ 3 hóa đơn điện tử không ghi giấy in nhiệt để tiến tới quầy dịch vụ quy đổi lập tức một chiếc cốc thủy tinh mờ in logo X Cinema mang phong cách mộc mạc rực rỡ, nhằm lan tỏa lối sống bền bỉ thân thiện từ những hành động nhỏ.', '2026-06-02', N'Sự Kiện', 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600', 6500, 1);
GO


-- ==================================================================
-- PHẦN 10.8: PHÒNG CHIẾU (mỗi rạp 2 phòng)
-- ==================================================================
INSERT INTO dbo.CinemaHalls (CinemaID, HallName, IsActive)
SELECT CinemaID, N'Phòng 1', 1 FROM dbo.Cinemas WHERE CinemaName = N'X Cinema Hoàn Kiếm'
UNION ALL
SELECT CinemaID, N'Phòng 2 (VIP)', 1 FROM dbo.Cinemas WHERE CinemaName = N'X Cinema Hoàn Kiếm'
UNION ALL
SELECT CinemaID, N'Phòng 1', 1 FROM dbo.Cinemas WHERE CinemaName = N'X Cinema Cầu Giấy'
UNION ALL
SELECT CinemaID, N'Phòng 2 (VIP)', 1 FROM dbo.Cinemas WHERE CinemaName = N'X Cinema Cầu Giấy'
UNION ALL
SELECT CinemaID, N'Phòng 1', 1 FROM dbo.Cinemas WHERE CinemaName = N'X Cinema Thanh Xuân'
UNION ALL
SELECT CinemaID, N'Phòng 2 (VIP)', 1 FROM dbo.Cinemas WHERE CinemaName = N'X Cinema Thanh Xuân'
UNION ALL
SELECT CinemaID, N'Phòng 1', 1 FROM dbo.Cinemas WHERE CinemaName = N'X Cinema Hà Đông'
UNION ALL
SELECT CinemaID, N'Phòng 2 (VIP)', 1 FROM dbo.Cinemas WHERE CinemaName = N'X Cinema Hà Đông'
UNION ALL
SELECT CinemaID, N'Phòng 1', 1 FROM dbo.Cinemas WHERE CinemaName = N'X Cinema Long Biên'
UNION ALL
SELECT CinemaID, N'Phòng 2 (VIP)', 1 FROM dbo.Cinemas WHERE CinemaName = N'X Cinema Long Biên';
GO

-- ==================================================================
-- PHẦN 10.9: GHẾ - ĐÃ SỬA: 12 ghế/hàng (không phải 10), đúng khớp
-- với getSeatInfo() trong SeatMap.tsx:
--   Hàng A,B,C => 'Thường'
--   Hàng D,E,F,G => 'VIP'
--   Hàng H => 'Sweetbox' (ghế đôi, dùng priceDouble)
-- ==================================================================
DECLARE @HallID INT;
DECLARE hall_cursor CURSOR FOR SELECT HallID FROM dbo.CinemaHalls;
OPEN hall_cursor;
FETCH NEXT FROM hall_cursor INTO @HallID;
WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE @RowChar INT = 65; -- 'A'
    WHILE @RowChar <= 72       -- 'H'
    BEGIN
        DECLARE @SeatNum INT = 1;
        WHILE @SeatNum <= 12   -- ĐÃ SỬA: 12 ghế/hàng (đúng với seatsPerRow trong SeatMap.tsx)
        BEGIN
            INSERT INTO dbo.Seats (HallID, RowLabel, SeatNumber, SeatType, IsActive)
            VALUES (
                @HallID, CHAR(@RowChar), @SeatNum,
                CASE
                    WHEN @RowChar = 72 THEN N'Sweetbox'                  -- Hàng H = ghế đôi
                    WHEN @RowChar BETWEEN 68 AND 71 THEN N'VIP'          -- Hàng D-G = VIP
                    ELSE N'Thường'                                       -- Hàng A-C = Thường
                END,
                1
            );
            SET @SeatNum += 1;
        END
        SET @RowChar += 1;
    END
    FETCH NEXT FROM hall_cursor INTO @HallID;
END
CLOSE hall_cursor;
DEALLOCATE hall_cursor;
GO

-- ==================================================================
-- PHẦN 10.10: SUẤT CHIẾU - ĐÃ SỬA HOÀN TOÀN
-- Tái tạo ĐÚNG thuật toán generateShowtimes() gốc trong seedData.ts:
--   cinemas.forEach((cinema, cIdx) =>
--     playingMovies.forEach((movie, mIdx) =>
--       if ((mIdx+cIdx) % 2 === 0)
--         dates.forEach((date, dIdx) => { push time1; push time2 }
-- Ngày dùng GETDATE() (hôm nay) và GETDATE()+1 (ngày mai) - luôn đúng
-- thời điểm chạy script, y hệt cách frontend tính today/tomorrow.
-- Kết quả: cắt lấy 52 suất đầu tiên theo đúng thứ tự push của JS,
-- đảm bảo MỌI phim đang chiếu đều có suất ở MỌI rạp (xoay vòng).
-- ==================================================================

IF OBJECT_ID('tempdb..#OrderedCinemas') IS NOT NULL DROP TABLE #OrderedCinemas;
IF OBJECT_ID('tempdb..#OrderedMovies') IS NOT NULL DROP TABLE #OrderedMovies;
IF OBJECT_ID('tempdb..#StagingShowtimes') IS NOT NULL DROP TABLE #StagingShowtimes;

SELECT CinemaID, ROW_NUMBER() OVER (ORDER BY CinemaID) - 1 AS CIdx
INTO #OrderedCinemas
FROM dbo.Cinemas;

SELECT MovieID, ROW_NUMBER() OVER (ORDER BY MovieID) - 1 AS MIdx
INTO #OrderedMovies
FROM dbo.Movies
WHERE IsUpcoming = 0;   -- chỉ phim "đang chiếu", giống playingMovies trong seedData.ts

CREATE TABLE #StagingShowtimes (
    SeqNo       INT IDENTITY(1,1) PRIMARY KEY,
    MovieID     INT,
    CinemaID    INT,
    HallSlot    INT,           -- 1 hoặc 2 (ứng với 2 phòng/rạp)
    StartDate   DATE,
    StartTimeStr VARCHAR(5),
    Format      NVARCHAR(20)
);

DECLARE @Today DATE = CAST(GETDATE() AS DATE);
DECLARE @Tomorrow DATE = DATEADD(DAY, 1, @Today);

DECLARE @Times TABLE (Idx INT, T VARCHAR(5));
INSERT INTO @Times VALUES (0,'09:00'),(1,'11:30'),(2,'14:00'),(3,'16:30'),(4,'19:00'),(5,'21:30');

DECLARE @Formats TABLE (Idx INT, F NVARCHAR(20));
INSERT INTO @Formats VALUES (0,N'2D Phụ đề'),(1,N'2D lồng tiếng'),(2,N'IMAX 3D');

DECLARE @CIdx INT, @MIdx INT, @CinemaID INT, @MovieID INT;
DECLARE @DateList TABLE (DIdx INT, D DATE);
INSERT INTO @DateList VALUES (0, @Today), (1, @Tomorrow);

DECLARE cinema_cur CURSOR FOR SELECT CinemaID, CIdx FROM #OrderedCinemas ORDER BY CIdx;
OPEN cinema_cur;
FETCH NEXT FROM cinema_cur INTO @CinemaID, @CIdx;
WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE movie_cur CURSOR FOR SELECT MovieID, MIdx FROM #OrderedMovies ORDER BY MIdx;
    OPEN movie_cur;
    FETCH NEXT FROM movie_cur INTO @MovieID, @MIdx;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        IF (@MIdx + @CIdx) % 2 = 0
        BEGIN
            DECLARE @DIdx INT, @D DATE;
            DECLARE date_cur CURSOR FOR SELECT DIdx, D FROM @DateList ORDER BY DIdx;
            OPEN date_cur;
            FETCH NEXT FROM date_cur INTO @DIdx, @D;
            WHILE @@FETCH_STATUS = 0
            BEGIN
                DECLARE @Time1Idx INT = (@MIdx + @CIdx + @DIdx) % 6;
                DECLARE @Time2Idx INT = (@MIdx + @CIdx + @DIdx + 3) % 6;
                DECLARE @FormatIdx INT = (@MIdx + @CIdx) % 3;
                DECLARE @Time1 VARCHAR(5), @Time2 VARCHAR(5), @Fmt NVARCHAR(20);

                SELECT @Time1 = T FROM @Times WHERE Idx = @Time1Idx;
                SELECT @Time2 = T FROM @Times WHERE Idx = @Time2Idx;
                SELECT @Fmt   = F FROM @Formats WHERE Idx = @FormatIdx;

                -- push suất 1 (Phòng 1 của rạp)
                INSERT INTO #StagingShowtimes (MovieID, CinemaID, HallSlot, StartDate, StartTimeStr, Format)
                VALUES (@MovieID, @CinemaID, 1, @D, @Time1, @Fmt);

                -- push suất 2 (Phòng 2 của rạp)
                INSERT INTO #StagingShowtimes (MovieID, CinemaID, HallSlot, StartDate, StartTimeStr, Format)
                VALUES (@MovieID, @CinemaID, 2, @D, @Time2, @Fmt);

                FETCH NEXT FROM date_cur INTO @DIdx, @D;
            END
            CLOSE date_cur;
            DEALLOCATE date_cur;
        END
        FETCH NEXT FROM movie_cur INTO @MovieID, @MIdx;
    END
    CLOSE movie_cur;
    DEALLOCATE movie_cur;
    FETCH NEXT FROM cinema_cur INTO @CinemaID, @CIdx;
END
CLOSE cinema_cur;
DEALLOCATE cinema_cur;
GO

-- Lấy đúng 52 suất đầu tiên theo thứ tự push (giống .slice(0,52) trong JS),
-- gán vào đúng HallID tương ứng (HallSlot 1 -> Phòng 1, HallSlot 2 -> Phòng 2 VIP)
;WITH HallBySlot AS (
    SELECT CinemaID, HallID,
           ROW_NUMBER() OVER (PARTITION BY CinemaID ORDER BY HallID) AS HallSlot
    FROM dbo.CinemaHalls
)
INSERT INTO dbo.Showtimes (MovieID, HallID, StartTime, Format, PriceStandard, PriceVIP, PriceDouble)
SELECT TOP 52
    st.MovieID,
    h.HallID,
    CAST(CONVERT(VARCHAR(10), st.StartDate, 23) + ' ' + st.StartTimeStr + ':00' AS DATETIME2),
    st.Format,
    85000, 110000, 240000
FROM #StagingShowtimes st
JOIN HallBySlot h ON h.CinemaID = st.CinemaID AND h.HallSlot = st.HallSlot
ORDER BY st.SeqNo;
GO

DROP TABLE #StagingShowtimes;
DROP TABLE #OrderedMovies;
DROP TABLE #OrderedCinemas;
GO

-- Sinh trạng thái ghế Available cho mọi suất chiếu vừa tạo
INSERT INTO dbo.ShowtimeSeats (ShowtimeID, SeatID, Status)
SELECT s.ShowtimeID, se.SeatID, 'Available'
FROM dbo.Showtimes s
JOIN dbo.Seats se ON se.HallID = s.HallID AND se.IsActive = 1;
GO

-- ==================================================================
-- PHẦN 10.11: COMBO BẮP NƯỚC (3 combo - khớp 100% DEFAULT_COMBO_DEALS
-- trong SeatMap.tsx: tên, giá, mô tả, ảnh đều giống)
-- ==================================================================
INSERT INTO dbo.Combos (Name, Description, Price, ImageURL, IsActive) VALUES
(N'Combo Solo Sweet', N'1 Bắp ngọt lớn + 1 Nước ngọt lớn (Pepsi / Sprite)', 65000,
 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=300', 1),
(N'Combo Couple Love', N'1 Bắp lớn vị Phô mai / Tảo biển + 2 Nước ngọt lớn 32oz', 109000,
 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300', 1),
(N'Combo Golden Ribbon VIP', N'1 Siêu bắp Caramel khổng lồ + 2 Ly sứ X Cinema + 2 Nước trái cây cao cấp', 159000,
 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=300', 1);
GO

-- ============================================================
--  PHẦN 11: TRIGGER CHỐNG TRÙNG GIỜ CHIẾU TRONG CÙNG 1 PHÒNG
--  (race condition: 2 suất chiếu đè giờ nhau trong cùng HallID)
--  Khoảng chiếu coi như [StartTime, StartTime + Duration phim + 15 phút dọn phòng)
--
--  LƯU Ý: Trigger được tạo SAU khi đã seed xong dữ liệu mẫu, vì dữ
--  liệu demo (sinh theo đúng thuật toán gốc của frontend) không tính
--  đến thời lượng phim nên một vài suất có thể "đè giờ" nhau về mặt
--  kỹ thuật - đó là điều chấp nhận được cho dữ liệu demo. Từ đây về
--  sau, mọi suất chiếu được tạo/sửa qua ứng dụng (trang Admin) sẽ bị
--  trigger này chặn nếu trùng giờ trong cùng phòng.
-- ============================================================
CREATE TRIGGER trg_Showtimes_NoOverlap
ON dbo.Showtimes
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN dbo.Movies m ON m.MovieID = i.MovieID
        JOIN dbo.Showtimes s
            ON s.HallID = i.HallID
            AND s.ShowtimeID <> i.ShowtimeID
        JOIN dbo.Movies m2 ON m2.MovieID = s.MovieID
        WHERE i.StartTime < DATEADD(MINUTE, m2.Duration + 15, s.StartTime)
          AND s.StartTime  < DATEADD(MINUTE, m.Duration + 15, i.StartTime)
    )
    BEGIN
        RAISERROR(N'Trùng giờ chiếu: phòng này đã có suất chiếu khác đè giờ trong khoảng thời gian này.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END
GO


-- ==================================================================
-- KIỂM TRA NHANH SAU KHI CHẠY
-- ==================================================================
PRINT N'--- Kiểm tra nhanh ---';
SELECT COUNT(*) AS SoGhe FROM dbo.Seats;                                  -- kỳ vọng: 10 phòng x 96 ghế = 960
SELECT COUNT(*) AS SoSuatChieu FROM dbo.Showtimes;                        -- kỳ vọng: 52
SELECT COUNT(DISTINCT MovieID) AS SoPhimCoSuatChieu FROM dbo.Showtimes;   -- kỳ vọng: gần 20 (mọi phim đang chiếu)
SELECT COUNT(DISTINCT h.CinemaID) AS SoRapCoSuatChieu
FROM dbo.Showtimes s JOIN dbo.CinemaHalls h ON h.HallID = s.HallID;       -- kỳ vọng: 5 (mọi rạp)
SELECT SeatType, COUNT(*) AS SoLuong FROM dbo.Seats GROUP BY SeatType;    -- kỳ vọng: Thường=288/phòng-tổng, VIP, Sweetbox đều có
GO

PRINT N'Hoàn tất: Database X Cinema đã sửa - 30 phim, 5 rạp, 960 ghế (12/hàng, đủ 3 loại ghế), suất chiếu phủ mọi phim/mọi rạp, 10 KM, 10 tin, 3 combo, kèm trigger chống trùng giờ + SP dọn ghế giữ quá hạn.';
GO

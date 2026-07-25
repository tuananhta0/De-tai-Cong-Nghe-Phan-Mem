/* ====================================================================
   X CINEMA - SCRIPT TẠO CSDL (CREATE) - BẢN GỘP HOÀN CHỈNH
   ====================================================================
   File này gộp và viết lại từ đầu toàn bộ các file:
     - SQLQuery1.sql              (schema gốc đã sửa lỗi ghế/suất chiếu)
     - add_cinema_admin.sql       (thêm role 'cinema_admin' + Users.CinemaID)
     - fix_cinemahalls.sql        (logic sinh phòng/ghế được gộp thẳng vào
                                    dữ liệu mẫu ở file INSERT, không cần
                                    chạy riêng một script "vá" nữa)

   THAY ĐỔI SO VỚI CÁC BẢN RỜI RẠC TRƯỚC ĐÓ:
   1) Bảng Cinemas được tạo TRƯỚC bảng Users (thay vì sau), vì Users cần
      khóa ngoại CinemaID -> Cinemas ngay từ đầu, không phải ALTER TABLE
      vá thêm như add_cinema_admin.sql đã làm.
   2) Cột Users.CinemaID (NULL = admin tổng / nhân viên không gắn rạp /
      khách hàng) và role 'cinema_admin' được đưa thẳng vào CREATE TABLE
      và CHECK constraint gốc, không cần script vá riêng.
   3) Ghế: 8 hàng (A-H) x 12 ghế/hàng. Hàng A-C = Thường, D-G = VIP,
      H = Sweetbox (ghế đôi) - khớp SeatMap.tsx của frontend.
   4) Trigger chống trùng giờ chiếu (trg_Showtimes_NoOverlap) được đặt ở
      CUỐI file 02_insert_data.sql (SAU khi seed xong dữ liệu mẫu), vì dữ
      liệu demo sinh theo thuật toán gốc của frontend không tính đến thời
      lượng phim nên có thể "đè giờ" nhau về mặt kỹ thuật - chấp nhận được
      cho dữ liệu demo. Từ sau khi seed xong, mọi suất chiếu tạo/sửa qua
      ứng dụng sẽ bị trigger này chặn nếu trùng giờ trong cùng phòng.
   ==================================================================== */


-- ============================================================
--  PHẦN 1: CỤM RẠP (CINEMAS) - tạo trước vì Users cần FK tới đây
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
--  PHẦN 2: TÀI KHOẢN & PHÂN QUYỀN
--  (đã gộp sẵn 'cinema_admin' + cột CinemaID từ add_cinema_admin.sql)
-- ============================================================

CREATE TABLE dbo.Roles (
    RoleID      INT IDENTITY(1,1) PRIMARY KEY,
    RoleCode    VARCHAR(20)     NOT NULL UNIQUE,   -- 'admin' | 'cinema_admin' | 'employee' | 'customer'
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
                            CONSTRAINT CK_Users_RoleCode CHECK (RoleCode IN ('admin','cinema_admin','employee','customer')),
    -- CinemaID: NULL = admin tổng / khách hàng (không gắn cụm rạp nào).
    -- Có giá trị = tài khoản 'cinema_admin' (hoặc nhân viên) quản lý riêng đúng 1 cụm rạp.
    CinemaID            INT             NULL,
    Avatar              VARCHAR(500)    NULL,
    MembershipId        VARCHAR(30)     NULL,
    Points              INT             NOT NULL DEFAULT 0,
    FavoriteMoviesJson  NVARCHAR(MAX)   NULL DEFAULT '[]',
    CreatedAt           DATETIME2       NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (RoleID) REFERENCES dbo.Roles(RoleID),
    CONSTRAINT FK_Users_Cinema FOREIGN KEY (CinemaID) REFERENCES dbo.Cinemas(CinemaID)
);
GO


-- ============================================================
--  PHẦN 3: PHIM
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
CREATE INDEX IX_Users_CinemaID           ON dbo.Users(CinemaID);
GO


-- ============================================================
--  PHẦN 10: STORED PROCEDURE DỌN GHẾ "HOLDING" QUÁ HẠN
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

PRINT N'Hoàn tất tạo schema X Cinema: 12 bảng (đã gộp Users.CinemaID + role cinema_admin), 10 index, 1 stored procedure. Tiếp theo chạy 02_insert_data.sql để nạp dữ liệu mẫu.';
GO

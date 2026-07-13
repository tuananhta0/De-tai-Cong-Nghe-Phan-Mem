-- ============================================================
--  fix_cinemahalls.sql
--  Chạy script này trong SQL Server Management Studio (SSMS)
--  để kiểm tra và tự động thêm CinemaHalls còn thiếu,
--  nguyên nhân chính khiến "Không thể thêm suất chiếu".
-- ============================================================

-- BƯỚC 1: Kiểm tra xem rạp nào chưa có phòng chiếu IsActive
SELECT c.CinemaID, c.CinemaName,
       COUNT(h.HallID) AS SoPhongChieu
FROM dbo.Cinemas c
LEFT JOIN dbo.CinemaHalls h ON h.CinemaID = c.CinemaID AND h.IsActive = 1
GROUP BY c.CinemaID, c.CinemaName
ORDER BY c.CinemaID;

-- Nếu cột SoPhongChieu = 0 ở rạp nào -> rạp đó sẽ báo lỗi khi thêm suất chiếu.

-- ============================================================
-- BƯỚC 2: Tự động thêm Phòng 1 + Phòng 2 (VIP) cho mọi rạp
--         chưa có phòng chiếu nào IsActive
-- ============================================================
INSERT INTO dbo.CinemaHalls (CinemaID, HallName, IsActive)
SELECT c.CinemaID, N'Phòng 1', 1
FROM dbo.Cinemas c
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.CinemaHalls h
    WHERE h.CinemaID = c.CinemaID AND h.IsActive = 1
);

INSERT INTO dbo.CinemaHalls (CinemaID, HallName, IsActive)
SELECT c.CinemaID, N'Phòng 2 (VIP)', 1
FROM dbo.Cinemas c
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.CinemaHalls h
    WHERE h.CinemaID = c.CinemaID AND h.IsActive = 1
        AND h.HallName = N'Phòng 2 (VIP)'
);

-- ============================================================
-- BƯỚC 3: Tự động sinh ghế cho các phòng mới tạo (chưa có ghế)
-- Sinh đủ 8 hàng A-H x 12 ghế/hàng, đúng với SeatMap.tsx
-- ============================================================
DECLARE @HallID INT;
DECLARE hall_cursor CURSOR FOR
    SELECT h.HallID FROM dbo.CinemaHalls h
    WHERE NOT EXISTS (SELECT 1 FROM dbo.Seats s WHERE s.HallID = h.HallID AND s.IsActive = 1);

OPEN hall_cursor;
FETCH NEXT FROM hall_cursor INTO @HallID;
WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE @Row NVARCHAR(1);
    DECLARE @RowNum INT = 1;
    WHILE @RowNum <= 8
    BEGIN
        SET @Row = CHAR(64 + @RowNum); -- A=65
        DECLARE @Col INT = 1;
        WHILE @Col <= 12
        BEGIN
            DECLARE @SeatType NVARCHAR(20);
            SET @SeatType = CASE
                WHEN @Row IN ('A','B','C') THEN N'Thường'
                WHEN @Row IN ('D','E','F','G') THEN N'VIP'
                ELSE N'Sweetbox'
            END;
            INSERT INTO dbo.Seats (HallID, RowLabel, SeatNumber, SeatType, IsActive)
            VALUES (@HallID, @Row, @Col, @SeatType, 1);
            SET @Col = @Col + 1;
        END
        SET @RowNum = @RowNum + 1;
    END
    FETCH NEXT FROM hall_cursor INTO @HallID;
END
CLOSE hall_cursor;
DEALLOCATE hall_cursor;

-- BƯỚC 4: Xác nhận lại
SELECT c.CinemaName, h.HallID, h.HallName, h.IsActive,
       COUNT(s.SeatID) AS SoGhe
FROM dbo.Cinemas c
JOIN dbo.CinemaHalls h ON h.CinemaID = c.CinemaID
LEFT JOIN dbo.Seats s ON s.HallID = h.HallID AND s.IsActive = 1
GROUP BY c.CinemaName, h.HallID, h.HallName, h.IsActive
ORDER BY c.CinemaName, h.HallID;

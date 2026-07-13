import { Router, Request, Response } from 'express';[cite: 5]
import { DailyShowtime } from '../../src/types/showtime';

const router = Router();

router.get('/api/showtimes', (req: Request, res: Response) => {
  const { movieId } = req.query;

  if (!movieId) {
    return res.status(400).json({ message: 'Thiếu định danh phim (movieId)' });
  }

  // Dữ liệu mẫu chuẩn cấu trúc Group theo Ngày -> Rạp dựa trên mốc thời gian năm 2026
  const mockShowtimes: DailyShowtime[] = [
    {
      date: '2026-07-13',
      cinemas: [
        {
          cinemaId: 'tcd-lang-ha',
          cinemaName: 'TCD Cinema - Láng Hạ',
          slots: [
            { showtimeId: 'st-101', time: '09:30', format: '2D Phụ đề', price: 80000 },
            { showtimeId: 'st-102', time: '14:15', format: '2D Phụ đề', price: 80000 },
            { showtimeId: 'st-103', time: '19:30', format: '2D Phụ đề', price: 95000 }
          ]
        },
        {
          cinemaId: 'tcd-tran-duy-hung',
          cinemaName: 'TCD Cinema - Trần Duy Hưng',
          slots: [
            { showtimeId: 'st-201', time: '11:00', format: '2D Phụ đề', price: 80000 },
            { showtimeId: 'st-202', time: '16:45', format: '3D Lồng tiếng', price: 120000 }
          ]
        }
      ]
    },
    {
      date: '2026-07-14',
      cinemas: [
        {
          cinemaId: 'tcd-lang-ha',
          cinemaName: 'TCD Cinema - Láng Hạ',
          slots: [
            { showtimeId: 'st-104', time: '10:00', format: '2D Phụ đề', price: 80000 },
            { showtimeId: 'st-105', time: '20:15', format: '2D Phụ đề', price: 95000 }
          ]
        }
      ]
    }
  ];

  res.json(mockShowtimes);
});

export default router;

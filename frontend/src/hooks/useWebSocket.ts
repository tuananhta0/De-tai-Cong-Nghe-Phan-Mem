/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
//  services/useWebSocket.ts
//  Hook kết nối tới WebSocket backend C++ (ws://localhost:8080/ws, qua Vite
//  proxy nên dùng đường dẫn tương đối "/ws" lúc dev). Hỗ trợ tự kết nối lại
//  (auto-reconnect) khi mất kết nối, và gửi message "subscribe" theo room.
//
//  Cách dùng:
//    useShowtimeSeatEvents(showtimeId, (evt) => { ...cập nhật state ghế... });
//    useAdminBookingEvents((evt) => { ...cập nhật dashboard Admin... });
// ============================================================================

import { useEffect, useRef } from "react";

// Vite dev server proxy "/ws" -> "ws://localhost:8080/ws" (cấu hình trong vite.config.ts).
// Tự suy ra ws:// hay wss:// theo giao thức trang đang chạy (http -> ws, https -> wss).
function getWebSocketUrl(): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

export interface SeatEvent {
  type: "seat_locked" | "seats_booked";
  showtimeId: string;
  seatName?: string;
  seats?: string[];
}

export interface AdminEvent {
  type: "new_booking" | "booking_updated";
  code?: string;
  movieTitle?: string;
  totalAmount?: number;
  field?: string;
  isCheckedIn?: boolean;
  isComboRedeemed?: boolean;
  // BookingController gửi full booking object trong field "booking"
  booking?: {
    code: string;
    movieTitle: string;
    totalAmount: number;
    [key: string]: unknown;
  };
}

/**
 * Theo dõi real-time trạng thái ghế của 1 suất chiếu cụ thể. Tự động mở kết
 * nối, gửi "subscribe_showtime", và tự đóng khi component unmount hoặc
 * showtimeId đổi. Tự kết nối lại nếu mất mạng tạm thời (mỗi 3 giây).
 */
export function useShowtimeSeatEvents(showtimeId: string | null, onEvent: (evt: SeatEvent) => void) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!showtimeId) return;

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      socket = new WebSocket(getWebSocketUrl());

      socket.onopen = () => {
        socket?.send(JSON.stringify({ type: "subscribe_showtime", showtimeId }));
      };

      socket.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data) as SeatEvent;
          if (data.type === "seat_locked" || data.type === "seats_booked") {
            onEventRef.current(data);
          }
        } catch {
          // Bỏ qua message không phải JSON hợp lệ
        }
      };

      socket.onclose = () => {
        // Mất kết nối (backend restart, mạng chập chờn...) -> tự thử lại sau 3s
        if (!cancelled) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [showtimeId]);
}

/**
 * Theo dõi real-time đơn đặt vé mới / cập nhật trạng thái vé, dùng cho
 * Admin Panel và Staff Portal (để dashboard tự cập nhật không cần F5).
 */
export function useAdminBookingEvents(onEvent: (evt: AdminEvent) => void, enabled: boolean = true) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled) return;

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      socket = new WebSocket(getWebSocketUrl());

      socket.onopen = () => {
        socket?.send(JSON.stringify({ type: "subscribe_admin" }));
      };

      socket.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data) as AdminEvent;
          if (data.type === "new_booking" || data.type === "booking_updated") {
            onEventRef.current(data);
          }
        } catch {
          // Bỏ qua message không phải JSON hợp lệ
        }
      };

      socket.onclose = () => {
        if (!cancelled) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [enabled]);
}

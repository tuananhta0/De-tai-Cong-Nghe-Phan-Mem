/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Extracts a YouTube Video ID from any standard or custom YouTube URL format.
 * Extremely robust to ensure trailers play flawlessly under all circumstances (such as admin inputs).
 */
export function getYouTubeId(url: string | undefined | null): string {
  if (!url) return "Idh8n5XuYIA";

  try {
    const trimmed = url.trim();

    // Fallback if URL is exactly a 11-character video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    const regexes = [
      /youtube\.com\/watch\?v=([^&\s?#]+)/i,
      /youtube\.com\/embed\/([^&\s?#]+)/i,
      /youtu\.be\/([^&\s?#]+)/i,
      /youtube\.com\/shorts\/([^&\s?#]+)/i,
      /m\.youtube\.com\/watch\?v=([^&\s?#]+)/i,
    ];

    for (const regex of regexes) {
      const match = trimmed.match(regex);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch (error) {
    console.error("Error extracting YouTube ID: ", error);
  }

  return "Idh8n5XuYIA"; // Standard robust fallback
}

export function removeDiacritics(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/**
 * Formats a given number into the standard Vietnamese currency format (VND).
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Checks if a booking's showtime is already in the past compared to local time.
 * Date format usually is "DD/MM/YYYY". Supports "YYYY-MM-DD" as well.
 * Time format is "HH:MM".
 */
export function isBookingExpired(showDate: string, showTime: string): boolean {
  try {
    if (!showDate || !showTime) return false;

    let day = 0, month = 0, year = 0;
    if (showDate.includes("/")) {
      const parts = showDate.split("/");
      day = Number(parts[0]);
      month = Number(parts[1]);
      year = Number(parts[2]);
    } else if (showDate.includes("-")) {
      const parts = showDate.split("-");
      if (parts[0].length === 4) {
        year = Number(parts[0]);
        month = Number(parts[1]);
        day = Number(parts[2]);
      } else {
        day = Number(parts[0]);
        month = Number(parts[1]);
        year = Number(parts[2]);
      }
    }

    const timeParts = showTime.split(":");
    const hours = Number(timeParts[0]);
    const minutes = Number(timeParts[1]);

    if (!day || !month || !year || isNaN(hours) || isNaN(minutes)) {
      return false;
    }

    const movieDateTime = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();

    return now.getTime() > movieDateTime.getTime();
  } catch (e) {
    console.error("Error in isBookingExpired: ", e);
    return false;
  }
}


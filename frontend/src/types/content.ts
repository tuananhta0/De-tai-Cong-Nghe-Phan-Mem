export interface Promotion {
  id: string;
  title: string;
  description: string;
  code: string;
  discountPercent: number;
  validity: string;
  imageUrl: string;
}

export interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: "Điện Ảnh" | "Khuyến Mãi" | "Sự Kiện" | "Hậu Trường";
  imageUrl: string;
  views: number;
}

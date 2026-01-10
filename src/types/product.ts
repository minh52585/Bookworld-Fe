export interface IProducts {
  _id: string;
  name: string;
  author: string;
  namxuatban: number; // năm xuất bản
  nhaxuatban: string; // nhà xuất bản
  sotrang: number; // số trang
  slug?: string;
  description?: string;
  images: string[]; // Array of image URLs
  category: string; // ObjectId as string
  weight?: number;
  size?: string;
  status: "active" | "inactive";
  sku?: string;
  defaultVariant?: string; // ObjectId as string
  variants?: any[]; // Virtual field
  createdAt?: string;
  updatedAt?: string;
}
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}
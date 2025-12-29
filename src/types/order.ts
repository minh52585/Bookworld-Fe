export interface IOrderItem {
  product_id: {
    _id: string;
    name: string;
    price: number;
  };
  variant_id?: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

export interface IDiscount {
  code: string;
  type: string;
  value: number;
}

export interface IPayment {
  method: string;
  status: string;
  transaction_id?: string;
  paid_at?: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  province: string;
}

export interface IOrder {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
  };
  items: IOrderItem[];
  subtotal: number;
  shipping_fee: number;
  discount?: IDiscount;
  total: number;
  status: string;
  payment?: IPayment;
  shipping_address?: IShippingAddress;
  note: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
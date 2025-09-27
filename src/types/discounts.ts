export interface IDiscounts {
  _id: string;
  product:string
  productID: string;
  variantID: string;
  code:string
  discount_type: string;
  discount_value: string;
  status: string;
  date:Date[]
}

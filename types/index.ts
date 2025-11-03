export interface Product {
  id: string;
  name: string;
  sizes: {
    [size: string]: number; // size: quantity
  };
  price: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
}

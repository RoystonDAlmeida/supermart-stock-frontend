
// Product and sales related types
export type Category = 
  | "Groceries"
  | "Dairy"
  | "Bakery" 
  | "Meat"
  | "Produce"
  | "Beverages"
  | "Snacks"
  | "Household"
  | "Other";

export type ProductStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  stock: number;
  description?: string;
  salesCount: number;
  lastUpdated: Date;
  status: ProductStatus;
}

export interface SaleRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  date: Date;
}

export interface StockContextType {
  products: Product[];
  sales: SaleRecord[];
  addProduct: (product: Omit<Product, "id" | "lastUpdated" | "salesCount" | "status">) => void;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  recordSale: (productId: string, quantity: number) => void;
  getTotalRevenue: () => number;
  getTotalSold: () => number;
  getTotalStock: () => number;
  getProductById: (id: string) => Product | undefined;
  loading: boolean;
}

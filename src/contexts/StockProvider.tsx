import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import * as api from "@/services/api";
import StockContext from "./StockContext";
import { 
  Product, 
  SaleRecord, 
  ProductStatus, 
  StockContextType 
} from "./types";

// Fix: Create a proper React functional component
export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productsData = await api.getProducts();
        const salesData = await api.getSalesHistory();  // Ftech all sales data
        
        // Transform API data to match our interfaces
        const formattedProducts: Product[] = productsData.map((product: any) => ({
          id: product._id || product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock,
          description: product.description || "",
          salesCount: product.salesCount,
          lastUpdated: new Date(product.updatedAt || product.updated_at || Date.now()),
          status: product.status
        }));

        const formattedSales: SaleRecord[] = salesData.map((sale: any) => ({
          id: sale._id || sale.id,
          productId: sale.productId,
          productName: sale.productName,
          quantity: sale.quantity,
          totalAmount: sale.totalAmount,
          date: new Date(sale.date || sale.createdAt || sale.created_at || Date.now())
        }));

        setProducts(formattedProducts);
        setSales(formattedSales);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Error",
          description: "Failed to load data from server",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Only fetch the data if the user is authenticated - but don't put hooks in conditions
    if(api.isAuthenticated()) {
      fetchData();
    } else {
      setLoading(false); // Set loading to false if not authenticated
    }
  }, [toast]);

  const updateProductStatus = (product: Product): ProductStatus => {
    if (product.stock <= 0) return "Out of Stock";
    if (product.stock <= 10) return "Low Stock";
    return "In Stock";
  };

  const addProduct = async (productData: Omit<Product, "id" | "lastUpdated" | "salesCount" | "status">) => {
    try {
      const newProduct = await api.addProduct(productData);
      
      // Format the returned product to match our interface
      const formattedProduct: Product = {
        id: newProduct._id || newProduct.id,
        name: newProduct.name,
        category: newProduct.category as Product["category"],
        price: newProduct.price,
        stock: newProduct.stock,
        description: newProduct.description,
        salesCount: newProduct.salesCount || 0,
        lastUpdated: new Date(newProduct.updatedAt || newProduct.updated_at || Date.now()),
        status: newProduct.status as ProductStatus
      };

      setProducts((prev) => [...prev, formattedProduct]);
      toast({
        title: "Product Added",
        description: `${formattedProduct.name} has been added to inventory`,
      });
    } catch (error) {
      console.error("Failed to add product:", error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const updatedProduct = await api.updateProduct(id, productData);
      
      setProducts((prev) => 
        prev.map((product) => {
          if (product.id === id) {
            const formattedProduct = {
              ...product,
              ...updatedProduct,
              lastUpdated: new Date(updatedProduct.updatedAt || updatedProduct.updated_at || Date.now()),
              status: updatedProduct.status as ProductStatus
            };
            return formattedProduct;
          }
          return product;
        })
      );
      
      toast({
        title: "Product Updated",
        description: "The product has been updated successfully",
      });
    } catch (error) {
      console.error("Failed to update product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      const productToDelete = products.find(p => p.id === id);
      
      if (productToDelete) {
        setProducts((prev) => prev.filter((product) => product.id !== id));
        toast({
          title: "Product Deleted",
          description: `${productToDelete.name} has been removed from inventory`,
        });
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const recordSale = async (productId: string, quantity: number) => {
    try {
      const product = products.find((p) => p.id === productId);
      
      if (!product) {
        toast({
          title: "Error Recording Sale",
          description: "Product not found",
          variant: "destructive",
        });
        return;
      }

      if (product.stock < quantity) {
        toast({
          title: "Cannot Record Sale",
          description: "Insufficient stock",
          variant: "destructive",
        });
        return;
      }

      const saleData = await api.recordSale(productId, quantity);
      
      // Format the returned sale to match our interface
      const newSale: SaleRecord = {
        id: saleData._id || saleData.id,
        productId,
        productName: product.name,
        quantity,
        totalAmount: product.price * quantity,
        date: new Date(saleData.date || saleData.createdAt || saleData.created_at || Date.now())
      };

      setSales((prev) => [...prev, newSale]);
      
      // Update the product stock and sales count locally
      setProducts((prev) => 
        prev.map((p) => {
          if (p.id === productId) {
            const newStock = p.stock - quantity;
            // Use the ProductStatus type explicitly for status
            const newStatus: ProductStatus = 
              newStock <= 0 ? "Out of Stock" : 
              newStock <= 10 ? "Low Stock" : 
              "In Stock";
              
            return {
              ...p,
              stock: newStock,
              salesCount: p.salesCount + quantity,
              status: newStatus
            };
          }
          return p;
        })
      );

      toast({
        title: "Sale Recorded",
        description: `Sold ${quantity} units of ${product.name}`,
      });
    } catch (error) {
      console.error("Failed to record sale:", error);
      toast({
        title: "Error",
        description: "Failed to record sale",
        variant: "destructive",
      });
    }
  };

  const getTotalRevenue = () => {
    return sales.reduce((total, sale) => total + sale.totalAmount, 0);
  };

  const getTotalSold = () => {
    return sales.reduce((total, sale) => total + sale.quantity, 0);
  };

  const getTotalStock = () => {
    return products.reduce((total, product) => total + product.stock, 0);
  };

  const getProductById = (id: string) => {
    return products.find((product) => product.id === id);
  };

  const value: StockContextType = {
    products,
    sales,
    addProduct,
    updateProduct,
    deleteProduct,
    recordSale,
    getTotalRevenue,
    getTotalSold,
    getTotalStock,
    getProductById,
    loading
  };

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
};

// Fix: Define all functions properly inside the component
const updateProductStatus = (product: Product): ProductStatus => {
  if (product.stock <= 0) return "Out of Stock";
  if (product.stock <= 10) return "Low Stock";
  return "In Stock";
};

export default StockProvider;

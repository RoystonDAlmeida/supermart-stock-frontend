
import { createContext, useContext } from "react";
import { StockContextType } from "./types";

// Create context with a default empty value
const StockContext = createContext<StockContextType | undefined>(undefined);

// Custom hook for using the stock context
export const useStock = (): StockContextType => {
  const context = useContext(StockContext);
  
  if (context === undefined) {
    throw new Error("useStock must be used within a StockProvider");
  }
  
  return context;
};

export default StockContext;

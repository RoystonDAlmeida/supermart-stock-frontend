
import React from "react";
import { useStock } from "@/contexts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/ui/stat-card";
import { Package2, ShoppingCart, TrendingUp } from "lucide-react";
import StockTrendsChart from "@/components/analytics/StockTrendsChart";
import CategoryStockChart from "@/components/analytics/CategoryStockChart";

const Analytics = () => {
  const { getTotalStock, getTotalSold, getTotalRevenue, products, sales } = useStock();
  
  const averageOrderValue = React.useMemo(() => {
    if (sales.length === 0) return 0;
    return (getTotalRevenue() / sales.length).toFixed(2);
  }, [sales, getTotalRevenue]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Total Stock" 
          value={getTotalStock()} 
          icon={<Package2 className="h-4 w-4" />} 
          description="Units in inventory" 
        />
        <StatCard 
          title="Total Sold" 
          value={getTotalSold()} 
          icon={<ShoppingCart className="h-4 w-4" />} 
          description="Units sold to date" 
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${getTotalRevenue().toLocaleString()}`} 
          icon={<TrendingUp className="h-4 w-4" />} 
          description="Total sales revenue" 
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-1">
        <StockTrendsChart />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CategoryStockChart />
        
        <Card>
          <CardHeader>
            <CardTitle>Sales Metrics</CardTitle>
            <CardDescription>Key performance indicators for your business</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <dt className="text-sm font-medium">Average Order Value</dt>
                <dd className="text-sm font-semibold">₹{averageOrderValue}</dd>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <dt className="text-sm font-medium">Products Count</dt>
                <dd className="text-sm font-semibold">{products.length}</dd>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <dt className="text-sm font-medium">Total Orders</dt>
                <dd className="text-sm font-semibold">{sales.length}</dd>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <dt className="text-sm font-medium">Low Stock Items</dt>
                <dd className="text-sm font-semibold">{products.filter(p => p.status === "Low Stock").length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium">Out of Stock Items</dt>
                <dd className="text-sm font-semibold">{products.filter(p => p.status === "Out of Stock").length}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;

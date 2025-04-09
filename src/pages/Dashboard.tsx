import React from "react";
import { useStock } from "@/contexts";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package2, ShoppingCart, IndianRupee, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { products, getTotalRevenue, getTotalSold, getTotalStock } = useStock();
  
  const totalRevenue = getTotalRevenue();
  const totalSold = getTotalSold();
  const totalStock = getTotalStock();
  const lowStockProducts = products.filter(p => p.status === "Low Stock");
  const outOfStockProducts = products.filter(p => p.status === "Out of Stock");

  // Calculate top selling products
  const topSellingProducts = [...products]
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 5)
    .map(product => ({
      name: product.name,
      sales: product.salesCount
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link to="/products">
          <Button>Manage Products</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Products" 
          value={products.length} 
          icon={<Package2 className="h-4 w-4" />} 
          description="Total unique products" 
        />
        <StatCard 
          title="Total Stock" 
          value={totalStock} 
          icon={<Package2 className="h-4 w-4" />} 
          description="Units in inventory" 
        />
        <StatCard 
          title="Total Sold" 
          value={totalSold} 
          icon={<ShoppingCart className="h-4 w-4" />} 
          description="Units sold to date" 
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toFixed(2)}`} 
          icon={<IndianRupee className="h-4 w-4" />} 
          description="Generated revenue" 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSellingProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#0095AB" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Inventory Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {outOfStockProducts.length > 0 || lowStockProducts.length > 0 ? (
                <>
                  {outOfStockProducts.length > 0 && (
                    <div>
                      <h3 className="font-medium text-red-500 mb-2">Out of Stock ({outOfStockProducts.length})</h3>
                      <ul className="space-y-1">
                        {outOfStockProducts.map(product => (
                          <li key={product.id} className="text-sm p-2 bg-red-50 rounded flex justify-between">
                            <span>{product.name}</span>
                            <Link to={`/products/${product.id}`} className="text-supermart-500 underline text-xs">
                              Restock
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {lowStockProducts.length > 0 && (
                    <div>
                      <h3 className="font-medium text-amber-500 mb-2">Low Stock ({lowStockProducts.length})</h3>
                      <ul className="space-y-1">
                        {lowStockProducts.map(product => (
                          <li key={product.id} className="text-sm p-2 bg-amber-50 rounded flex justify-between">
                            <span>{product.name} <span className="text-xs text-gray-500">({product.stock} left)</span></span>
                            <Link to={`/products/${product.id}`} className="text-supermart-500 underline text-xs">
                              Restock
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No inventory alerts at this time</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

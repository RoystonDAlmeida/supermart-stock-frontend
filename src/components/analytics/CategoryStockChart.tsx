
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStock, Product } from "@/contexts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip
} from "recharts";

// Get stock data per category
const getStockByCategory = (products: Product[]) => {
  const categories: { [key: string]: number } = {};

  products.forEach((product) => {
    if (!categories[product.category]) {
      categories[product.category] = 0;
    }
    categories[product.category] += product.stock;
  });

  return Object.entries(categories).map(([name, value]) => ({
    name,
    value,
  }));
};

// A set of colors to use for the pie chart
const COLORS = ["#8b5cf6", "#10b981", "#f97316", "#0ea5e9", "#d946ef", "#eab308"];

const CategoryStockChart = () => {
  const { products } = useStock();
  
  const chartData = React.useMemo(() => {
    return getStockByCategory(products);
  }, [products]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock by Category</CardTitle>
        <CardDescription>
          Distribution of your inventory across product categories
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer 
          config={{
            stock: { color: "#8b5cf6" },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} units`, 'Stock']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryStockChart;

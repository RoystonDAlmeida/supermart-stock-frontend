
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStock, SaleRecord, Product } from "@/contexts";
import { format, subDays } from "date-fns";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Group sales by date, returning the total quantity and revenue for each day
const groupSalesByDate = (sales: SaleRecord[], days: number) => {
  const today = new Date();
  const startDate = subDays(today, days);
  const result: { [date: string]: { date: string; quantity: number; revenue: number } } = {};

  // Initialize result with all dates in the range
  for (let i = days; i >= 0; i--) {
    const currentDate = subDays(today, i);
    const dateString = format(currentDate, "MMM dd");
    result[dateString] = { date: dateString, quantity: 0, revenue: 0 };
  }

  // Add sales data
  sales.forEach(sale => {
    const saleDate = new Date(sale.date);
    if (saleDate >= startDate && saleDate <= today) {
      const dateString = format(saleDate, "MMM dd");
      if (result[dateString]) {
        result[dateString].quantity += sale.quantity;
        result[dateString].revenue += sale.totalAmount;
      }
    }
  });

  return Object.values(result);
};

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

type DateRange = 7 | 30 | 90;

const StockTrendsChart = () => {
  const { sales, products } = useStock();
  const [dateRange, setDateRange] = React.useState<DateRange>(30);
  const [chartType, setChartType] = React.useState<"sales" | "revenue">("sales");

  const chartData = React.useMemo(() => {
    return groupSalesByDate(sales, dateRange);
  }, [sales, dateRange]);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Stock Trends</CardTitle>
        <CardDescription>
          Analyze your sales and revenue trends over time
        </CardDescription>
        <div className="flex justify-between items-center mt-2">
          <Tabs defaultValue="sales" onValueChange={(v) => setChartType(v as "sales" | "revenue")}>
            <TabsList>
              <TabsTrigger value="sales">Sales Quantity</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-2">
            <button
              onClick={() => setDateRange(7)}
              className={`px-3 py-1 text-xs rounded ${
                dateRange === 7
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange(30)}
              className={`px-3 py-1 text-xs rounded ${
                dateRange === 30
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateRange(90)}
              className={`px-3 py-1 text-xs rounded ${
                dateRange === 90
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              90 Days
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer 
          config={{
            sales: { color: "#8b5cf6" },
            revenue: { color: "#10b981" },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => 
                  chartType === "revenue" ? `₹${value}` : `${value}`
                }
              />
              <Tooltip content={<ChartTooltipContent />} />
              {chartType === "sales" ? (
                <Line
                  dataKey="quantity"
                  name="sales"
                  stroke="var(--color-sales)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ) : (
                <Line
                  dataKey="revenue"
                  name="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default StockTrendsChart;

import React, { useState } from "react";
import { useStock, Product, ProductStatus } from "@/contexts";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { 
  Package2, 
  ShoppingCart, 
  Loader2, 
  ArrowUpDown, 
  Download, 
  Upload, 
  Search, 
  X 
} from "lucide-react";
import { toast } from "sonner";

const StockOverview = () => {
  const { products, getTotalStock, getTotalSold, recordSale, loading, addProduct, updateProduct } = useStock();
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product | ""; 
    direction: "asc" | "desc";
  }>({ key: "", direction: "asc" });
  
  const categories = React.useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
    return ["All", ...uniqueCategories];
  }, [products]);
  
  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      const statusMatches = statusFilter === "All" || product.status === statusFilter;
      const categoryMatches = categoryFilter === "All" || product.category === categoryFilter;
      const searchMatches = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatches && categoryMatches && searchMatches;
    });
  }, [products, statusFilter, categoryFilter, searchQuery]);
  
  const sortedProducts = React.useMemo(() => {
    if (!sortConfig.key) return filteredProducts;
    
    return [...filteredProducts].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredProducts, sortConfig]);
  
  const handleSort = (key: keyof Product) => {
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const handleRecordSale = () => {
    if (selectedProductId) {
      recordSale(selectedProductId, saleQuantity);
      setSaleDialogOpen(false);
      setSaleQuantity(1);
      setSelectedProductId(null);
    }
  };

  const openSaleDialog = (productId: string) => {
    setSelectedProductId(productId);
    setSaleDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Stock":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In Stock</Badge>;
      case "Low Stock":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Low Stock</Badge>;
      case "Out of Stock":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const maxQuantity = () => {
    if (!selectedProductId) return 1;
    const product = products.find(p => p.id === selectedProductId);
    return product ? product.stock : 1;
  };

  const exportToCSV = () => {
    const headers = ["Name", "Category", "Price", "Stock", "Status", "Description", "Last Updated"];
    
    const csvData = filteredProducts.map(product => [
      product.name,
      product.category,
      product.price,
      product.stock,
      product.status,
      product.description,
      product.lastUpdated.toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `stock-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Stock data exported successfully");
  };

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const allRows = text.split('\n').filter(row => row.trim());
        
        if (allRows.length <= 1) {
          toast.error("CSV file appears to be empty or contain only headers");
          return;
        }
        
        const rows = allRows.slice(1);
        
        const nameIndex = 0;
        const categoryIndex = 1;
        const priceIndex = 2;
        const stockIndex = 3;
        
        const productsToImport = rows.map(row => {
          const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
          
          if (values.length < 4) return null;
          
          return {
            name: values[nameIndex],
            category: values[categoryIndex] as Product["category"],
            price: parseFloat(values[priceIndex]),
            stock: parseInt(values[stockIndex]),
            description: ""
          };
        }).filter(Boolean) as Omit<Product, "id" | "lastUpdated" | "salesCount" | "status">[];

        let addedCount = 0;
        let updatedCount = 0;
        for (const productData of productsToImport) {
          const existingProduct = products.find(p => p.name === productData.name);
          if (existingProduct) {
            updateProduct(existingProduct.id, productData);
            updatedCount++;
          } else {
            addProduct(productData);
            addedCount++;
          }
        }

        toast.success(`CSV import complete: ${addedCount} products added, ${updatedCount} products updated.`);
      } catch (error) {
        console.error("Error processing CSV file:", error);
        toast.error("Error reading CSV file. Please check the format.");
      }
    };
    reader.readAsText(file);
    
    event.target.value = '';
  };

  const resetFilters = () => {
    setStatusFilter("All");
    setCategoryFilter("All");
    setSearchQuery("");
    setSortConfig({ key: "", direction: "asc" });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Stock Overview</h1>

      <div className="grid gap-4 md:grid-cols-2">
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
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>
                View and manage your current inventory
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2 items-center">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
              {searchQuery && (
                <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProductStatus | "All")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
            <div className="relative">
              <Input
                type="file"
                accept=".csv"
                onChange={importFromCSV}
                className="hidden"
                id="csv-upload"
              />
              <Button variant="outline" size="sm" onClick={() => document.getElementById('csv-upload')?.click()}>
                <Upload className="h-4 w-4 mr-1" /> Import CSV
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading inventory...</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:bg-muted/50">
                      Product <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortConfig.key === 'name' ? 'opacity-100' : 'opacity-40'}`} />
                    </TableHead>
                    <TableHead onClick={() => handleSort('category')} className="cursor-pointer hover:bg-muted/50">
                      Category <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortConfig.key === 'category' ? 'opacity-100' : 'opacity-40'}`} />
                    </TableHead>
                    <TableHead onClick={() => handleSort('price')} className="cursor-pointer hover:bg-muted/50">
                      Price <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortConfig.key === 'price' ? 'opacity-100' : 'opacity-40'}`} />
                    </TableHead>
                    <TableHead onClick={() => handleSort('stock')} className="cursor-pointer hover:bg-muted/50">
                      Stock <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortConfig.key === 'stock' ? 'opacity-100' : 'opacity-40'}`} />
                    </TableHead>
                    <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:bg-muted/50">
                      Status <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortConfig.key === 'status' ? 'opacity-100' : 'opacity-40'}`} />
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No products found with the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>₹{product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openSaleDialog(product.id)}
                            disabled={product.stock === 0}
                          >
                            Record Sale
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Record Sale</DialogTitle>
            <DialogDescription>
              Enter the quantity sold for this product.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </label>
              <div className="flex gap-2 items-center">
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={maxQuantity()}
                  value={saleQuantity}
                  onChange={(e) => setSaleQuantity(Number(e.target.value))}
                />
                <span className="text-muted-foreground text-sm">
                  (Max: {maxQuantity()})
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordSale}>Record Sale</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockOverview;

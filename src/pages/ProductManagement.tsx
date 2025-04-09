
import React, { useState } from "react";
import { useStock } from "@/contexts";
import { Product, Category } from "@/contexts/types";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Plus, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const categories: Category[] = [
  "Groceries",
  "Dairy",
  "Bakery",
  "Meat",
  "Produce",
  "Beverages",
  "Snacks",
  "Household",
  "Other"
];

const productSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  category: z.enum([
    "Groceries",
    "Dairy",
    "Bakery",
    "Meat",
    "Produce",
    "Beverages",
    "Snacks",
    "Household",
    "Other"
  ]),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  stock: z.coerce.number().int().nonnegative({
    message: "Stock must be a non-negative integer.",
  }),
  description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const EmptyProductForm: ProductFormValues = {
  name: "",
  category: "Groceries",
  price: 0,
  stock: 0,
  description: "",
};

const ProductForm = ({ 
  defaultValues = EmptyProductForm, 
  onSubmit, 
  onCancel,
  submitText = "Add Product"
}: { 
  defaultValues?: ProductFormValues;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
  submitText?: string;
}) => {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₹)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter product description" {...field} />
              </FormControl>
              <FormDescription>
                Add any additional details about the product.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{submitText}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

const ProductManagement = () => {
  const { products, addProduct, updateProduct, deleteProduct, loading } = useStock();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const { toast } = useToast();

  const userRole = user?.role || "cashier";
  const canModify = userRole === "manager" || userRole === "staff";
  const canDelete = userRole === "manager";

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = (values: ProductFormValues) => {
    if (!canModify) {
      setPermissionError("Permission denied: Only managers and staff can create products");
      setIsAddDialogOpen(false);
      toast({
        title: "Permission Denied",
        description: "Only managers and staff can create products",
        variant: "destructive",
      });
      return;
    }
    
    addProduct({
      name: values.name, 
      category: values.category,
      price: values.price,
      stock: values.stock,
      description: values.description || ""
    });
    setIsAddDialogOpen(false);
  };

  const handleEditProduct = (values: ProductFormValues) => {
    if (!canModify) {
      setPermissionError("Permission denied: Only managers and staff can update products");
      setIsEditDialogOpen(false);
      toast({
        title: "Permission Denied",
        description: "Only managers and staff can update products",
        variant: "destructive",
      });
      return;
    }
    
    if (currentProductId) {
      updateProduct(currentProductId, values);
      setIsEditDialogOpen(false);
      setCurrentProductId(null);
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (!canDelete) {
      setPermissionError("Permission denied: Only managers can delete products");
      toast({
        title: "Permission Denied",
        description: "Only managers can delete products",
        variant: "destructive",
      });
      return;
    }
    
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  const openEditDialog = (product: Product) => {
    if (!canModify) {
      setPermissionError("Permission denied: Only managers and staff can edit products");
      toast({
        title: "Permission Denied",
        description: "Only managers and staff can edit products",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentProductId(product.id);
    setIsEditDialogOpen(true);
  };

  const getCurrentProduct = (): ProductFormValues => {
    const product = products.find((p) => p.id === currentProductId);
    if (!product) return EmptyProductForm;

    return {
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description || "",
    };
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full sm:w-64 pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {canModify ? (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Add a new product to your inventory.
                  </DialogDescription>
                </DialogHeader>
                <ProductForm 
                  onSubmit={handleAddProduct} 
                  onCancel={() => setIsAddDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>
          ) : (
            <Button
              onClick={() => {
                setPermissionError("Permission denied: Only managers and staff can add products");
                toast({
                  title: "Permission Denied",
                  description: "Only managers and staff can add products",
                  variant: "destructive",
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          )}
        </div>
      </div>

      {permissionError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{permissionError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your product inventory. You have {products.length} products in total.
            {userRole === "cashier" && (
              <p className="text-amber-600 mt-1">
                Note: As a cashier, you have read-only access to products.
              </p>
            )}
            {userRole === "staff" && (
              <p className="text-amber-600 mt-1">
                Note: As staff, you can add and edit products but cannot delete them.
              </p>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading products...</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No products found. {canModify ? 'Click "Add Product" to add a new product.' : ''}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>₹{product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(product)}
                              disabled={!canModify}
                              title={!canModify ? "Only managers and staff can edit products" : "Edit product"}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={!canDelete}
                              title={!canDelete ? "Only managers can delete products" : "Delete product"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details.
            </DialogDescription>
          </DialogHeader>
          <ProductForm 
            defaultValues={getCurrentProduct()} 
            onSubmit={handleEditProduct} 
            onCancel={() => setIsEditDialogOpen(false)}
            submitText="Update Product" 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;

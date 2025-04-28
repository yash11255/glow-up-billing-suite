import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

interface ProductCategory {
  id: string;
  name: string;
}

interface Company {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category_id: string;
  company_id: string;
}

const Inventory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    stock: 0,
    category_id: "",
    company_id: ""
  });
  
  const [newCategory, setNewCategory] = useState({
    name: ""
  });
  
  const [newCompany, setNewCompany] = useState({
    name: ""
  });
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Fetch companies
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) {
        toast({
          title: "Error fetching companies",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      return data as Company[];
    },
    enabled: !!user
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
      
      if (error) {
        toast({
          title: "Error fetching categories",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      return data as ProductCategory[];
    },
    enabled: !!user
  });

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) {
        toast({
          title: "Error fetching products",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      return data as Product[];
    },
    enabled: !!user
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (product: Omit<Product, 'id'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...product, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsProductDialogOpen(false);
      setNewProduct({
        name: "",
        price: 0,
        stock: 0,
        category_id: "",
        company_id: ""
      });
      toast({
        title: "Success",
        description: "Product added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding product",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (product: Product) => {
      const { data, error } = await supabase
        .from('products')
        .update({ 
          name: product.name,
          price: product.price,
          stock: product.stock,
          category_id: product.category_id,
          company_id: product.company_id
        })
        .eq('id', product.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (category: { name: string }) => {
      const { data, error } = await supabase
        .from('product_categories')
        .insert([{ ...category, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsCategoryDialogOpen(false);
      setNewCategory({ name: "" });
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding category",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async (category: ProductCategory) => {
      const { data, error } = await supabase
        .from('product_categories')
        .update({ name: category.name })
        .eq('id', category.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating category",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Add company mutation
  const addCompanyMutation = useMutation({
    mutationFn: async (company: { name: string }) => {
      const { data, error } = await supabase
        .from('companies')
        .insert([{ ...company, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsCompanyDialogOpen(false);
      setNewCompany({ name: "" });
      toast({
        title: "Success",
        description: "Company added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding company",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (company: Company) => {
      const { data, error } = await supabase
        .from('companies')
        .update({ name: company.name })
        .eq('id', company.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsCompanyDialogOpen(false);
      setEditingCompany(null);
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating company",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Unknown Category';
  };

  // Function to get company name by ID
  const getCompanyName = (companyId: string) => {
    return companies.find(comp => comp.id === companyId)?.name || 'Unknown Company';
  };

  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category_id: product.category_id,
      company_id: product.company_id
    });
    setIsProductDialogOpen(true);
  };

  // Handle edit category
  const handleEditCategory = (category: ProductCategory) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name
    });
    setIsCategoryDialogOpen(true);
  };

  // Handle edit company
  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setNewCompany({
      name: company.name
    });
    setIsCompanyDialogOpen(true);
  };

  // Handle product form submission
  const handleProductSubmit = () => {
    if (editingProduct) {
      updateProductMutation.mutate({
        id: editingProduct.id,
        ...newProduct
      } as Product);
    } else {
      addProductMutation.mutate(newProduct);
    }
  };

  // Handle category form submission
  const handleCategorySubmit = () => {
    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        ...newCategory
      } as ProductCategory);
    } else {
      addCategoryMutation.mutate(newCategory);
    }
  };

  // Handle company form submission
  const handleCompanySubmit = () => {
    if (editingCompany) {
      updateCompanyMutation.mutate({
        id: editingCompany.id,
        ...newCompany
      } as Company);
    } else {
      addCompanyMutation.mutate(newCompany);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1 animate-fade-in">
          Inventory Management
        </h1>
        <p className="text-muted-foreground animate-fade-in animate-delay-100">
          Manage your salon product inventory
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl shadow-sm p-6 animate-fade-in animate-delay-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Products</h2>
            <Button onClick={() => {
              setEditingProduct(null);
              setNewProduct({
                name: "",
                price: 0,
                stock: 0,
                category_id: "",
                company_id: ""
              });
              setIsProductDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Add New Product
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 rounded-tl-lg">Product</th>
                  <th className="text-left p-3">Company</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-center p-3">Stock</th>
                  <th className="text-right p-3">Price</th>
                  <th className="text-right p-3 rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-muted/20">
                    <td className="p-3">{product.name}</td>
                    <td className="p-3">{getCompanyName(product.company_id)}</td>
                    <td className="p-3">{getCategoryName(product.category_id)}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        product.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-3 text-right">₹{product.price}</td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>Edit</Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this product?")) {
                            deleteProductMutation.mutate(product.id);
                          }
                        }}
                      >Delete</Button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="h-12 w-12 mb-2 opacity-30" />
                        <p>No products found</p>
                        <p className="text-sm">Add some products to get started</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="animate-fade-in animate-delay-300">
          <div className="bg-card rounded-xl shadow-sm p-6 mb-6">
            <h3 className="font-medium mb-4">Companies</h3>
            <div className="space-y-2">
              {companies.map((company) => (
                <div key={company.id} className="flex justify-between items-center p-2 hover:bg-muted/20 rounded-md">
                  <span>{company.name}</span>
                  <div>
                    <Button variant="ghost" size="sm" onClick={() => handleEditCompany(company)}>Edit</Button>
                  </div>
                </div>
              ))}
              {companies.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  <Store className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No companies found</p>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => {
                  setEditingCompany(null);
                  setNewCompany({ name: "" });
                  setIsCompanyDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Company
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm p-6">
            <h3 className="font-medium mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex justify-between items-center p-2 hover:bg-muted/20 rounded-md">
                  <span>{category.name}</span>
                  <div>
                    <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>Edit</Button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No categories found</p>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => {
                  setEditingCategory(null);
                  setNewCategory({ name: "" });
                  setIsCategoryDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Category
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update product details" : "Enter the details for the new product"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                placeholder="Enter price"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                placeholder="Enter stock amount"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newProduct.category_id}
                onValueChange={(value) => setNewProduct({ ...newProduct, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Select
                value={newProduct.company_id}
                onValueChange={(value) => setNewProduct({ ...newProduct, company_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProductSubmit}>
              {editingProduct ? "Update" : "Add"} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update category details" : "Enter the name for the new category"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCategorySubmit}>
              {editingCategory ? "Update" : "Add"} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company Dialog */}
      <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCompany ? "Edit Company" : "Add New Company"}</DialogTitle>
            <DialogDescription>
              {editingCompany ? "Update company details" : "Enter the name for the new company"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompanyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompanySubmit}>
              {editingCompany ? "Update" : "Add"} Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;

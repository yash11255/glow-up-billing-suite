
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
  categoryId: string;
  companyId: string;
}

const Inventory = () => {
  const [companies, setCompanies] = useState<Company[]>([
    { id: "company1", name: "L'Oréal" },
    { id: "company2", name: "Wella Professionals" },
    { id: "company3", name: "Schwarzkopf" },
  ]);

  const [categories, setCategories] = useState<ProductCategory[]>([
    { id: "cat1", name: "Shampoo" },
    { id: "cat2", name: "Conditioner" },
    { id: "cat3", name: "Hair Color" },
    { id: "cat4", name: "Styling Products" },
  ]);

  const [products, setProducts] = useState<Product[]>([
    {
      id: "prod1",
      name: "Professional Shampoo",
      price: 850,
      stock: 25,
      categoryId: "cat1",
      companyId: "company1",
    },
    {
      id: "prod2",
      name: "Deep Conditioner",
      price: 950,
      stock: 18,
      categoryId: "cat2",
      companyId: "company1",
    },
    {
      id: "prod3",
      name: "Hair Color - Dark Brown",
      price: 1200,
      stock: 15,
      categoryId: "cat3",
      companyId: "company2",
    },
    {
      id: "prod4",
      name: "Styling Gel - Strong Hold",
      price: 650,
      stock: 20,
      categoryId: "cat4",
      companyId: "company3",
    },
  ]);

  // Function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Unknown Category';
  };

  // Function to get company name by ID
  const getCompanyName = (companyId: string) => {
    return companies.find(comp => comp.id === companyId)?.name || 'Unknown Company';
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
            <Button>Add New Product</Button>
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
                    <td className="p-3">{getCompanyName(product.companyId)}</td>
                    <td className="p-3">{getCategoryName(product.categoryId)}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        product.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-3 text-right">₹{product.price}</td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                    </td>
                  </tr>
                ))}
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
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2">Add Company</Button>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm p-6">
            <h3 className="font-medium mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex justify-between items-center p-2 hover:bg-muted/20 rounded-md">
                  <span>{category.name}</span>
                  <div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2">Add Category</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, X } from "lucide-react";
import { CustomerFormData } from "./CustomerForm";
import { Service } from "../services/ServiceList";

interface Staff {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface BillFormProps {
  customer: CustomerFormData;
  services: Service[];
  staff: Staff[];
  products: Product[];
  onSubmit: (billData: any) => void;
}

export const BillForm = ({
  customer,
  services,
  staff,
  products,
  onSubmit,
}: BillFormProps) => {
  const [selectedServices, setSelectedServices] = useState<
    Array<{
      serviceId: string;
      staffId: string;
      price: number;
      name: string;
    }>
  >([]);
  
  const [selectedProducts, setSelectedProducts] = useState<
    Array<{
      productId: string;
      quantity: number;
      price: number;
      name: string;
    }>
  >([]);
  
  const [taxRate, setTaxRate] = useState(18); // 18% GST default
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");
  
  const subtotal = selectedServices.reduce((acc, service) => acc + service.price, 0) +
                  selectedProducts.reduce((acc, product) => acc + (product.price * product.quantity), 0);
  
  const discountValue = discountType === "percentage" 
    ? (subtotal * (discountAmount / 100)) 
    : discountAmount;
  
  const afterDiscount = subtotal - discountValue;
  const taxAmount = afterDiscount * (taxRate / 100);
  const total = afterDiscount + taxAmount;

  const handleServiceAdd = () => {
    setSelectedServices([
      ...selectedServices,
      { serviceId: "", staffId: "", price: 0, name: "" },
    ]);
  };

  const handleServiceChange = (index: number, serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    const updatedServices = [...selectedServices];
    updatedServices[index] = {
      ...updatedServices[index],
      serviceId,
      price: service.price,
      name: service.name,
    };
    setSelectedServices(updatedServices);
  };

  const handleStaffChange = (index: number, staffId: string) => {
    const updatedServices = [...selectedServices];
    updatedServices[index] = {
      ...updatedServices[index],
      staffId,
    };
    setSelectedServices(updatedServices);
  };

  const handleRemoveService = (index: number) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const handleProductAdd = () => {
    setSelectedProducts([
      ...selectedProducts,
      { productId: "", quantity: 1, price: 0, name: "" },
    ]);
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      productId,
      price: product.price,
      name: product.name,
    };
    setSelectedProducts(updatedProducts);
  };

  const handleProductQuantityChange = (index: number, quantity: number) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      quantity: Math.max(1, quantity),
    };
    setSelectedProducts(updatedProducts);
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      customer,
      services: selectedServices,
      products: selectedProducts,
      taxRate,
      discountAmount,
      discountType,
      subtotal,
      discountValue,
      taxAmount,
      total,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-muted/30 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Name</p>
            <p>{customer.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Phone</p>
            <p>{customer.phone}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Services</h3>
          <Button
            type="button"
            onClick={handleServiceAdd}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Service
          </Button>
        </div>

        {selectedServices.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No services added yet
          </p>
        ) : (
          selectedServices.map((service, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 items-center"
            >
              <div className="md:col-span-5">
                <label className="block text-xs font-medium mb-1">
                  Service
                </label>
                <select
                  value={service.serviceId}
                  onChange={(e) => handleServiceChange(index, e.target.value)}
                  required
                  className="block w-full rounded-md border-border px-3 py-2 bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
                >
                  <option value="">Select a service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - ₹{s.price}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-5">
                <label className="block text-xs font-medium mb-1">Staff</label>
                <select
                  value={service.staffId}
                  onChange={(e) => handleStaffChange(index, e.target.value)}
                  required
                  className="block w-full rounded-md border-border px-3 py-2 bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
                >
                  <option value="">Select staff member</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-medium mb-1">Price</label>
                <p className="px-3 py-2">₹{service.price}</p>
              </div>
              <div className="md:col-span-1 flex justify-end">
                <Button
                  type="button"
                  onClick={() => handleRemoveService(index)}
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Products</h3>
          <Button
            type="button"
            onClick={handleProductAdd}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Product
          </Button>
        </div>

        {selectedProducts.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No products added yet
          </p>
        ) : (
          selectedProducts.map((product, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 items-center"
            >
              <div className="md:col-span-6">
                <label className="block text-xs font-medium mb-1">
                  Product
                </label>
                <select
                  value={product.productId}
                  onChange={(e) => handleProductChange(index, e.target.value)}
                  required
                  className="block w-full rounded-md border-border px-3 py-2 bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
                >
                  <option value="">Select a product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ₹{p.price} ({p.stock} in stock)
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1">
                  Quantity
                </label>
                <div className="flex items-center">
                  <Button
                    type="button"
                    size="icon"
                    className="h-8 w-8"
                    variant="outline"
                    onClick={() =>
                      handleProductQuantityChange(index, product.quantity - 1)
                    }
                    disabled={product.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <input
                    type="number"
                    min="1"
                    value={product.quantity}
                    onChange={(e) =>
                      handleProductQuantityChange(index, parseInt(e.target.value))
                    }
                    className="w-12 text-center px-2 py-1 mx-2 border-border rounded"
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="h-8 w-8"
                    variant="outline"
                    onClick={() =>
                      handleProductQuantityChange(index, product.quantity + 1)
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium mb-1">
                  Price
                </label>
                <p className="px-3 py-2">
                  ₹{product.price * product.quantity} (₹{product.price} × {product.quantity})
                </p>
              </div>
              <div className="md:col-span-1 flex justify-end">
                <Button
                  type="button"
                  onClick={() => handleRemoveProduct(index)}
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-3">Tax</h3>
          <div className="flex items-center">
            <input
              type="number"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-16 px-3 py-2 border-border rounded-md mr-2"
            />
            <span>%</span>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">Discount</h3>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              min="0"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(Number(e.target.value))}
              className="w-24 px-3 py-2 border-border rounded-md"
            />
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "percentage" | "amount")}
              className="px-3 py-2 border-border rounded-md bg-background"
            >
              <option value="percentage">%</option>
              <option value="amount">₹</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t pt-4 mt-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span>₹{discountValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({taxRate}%)</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="submit">Create Bill</Button>
      </div>
    </form>
  );
};

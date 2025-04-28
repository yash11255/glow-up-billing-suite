
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, X } from "lucide-react";
import { CustomerFormData } from "./CustomerForm";
import { Service } from "../services/ServiceList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const [customerGST, setCustomerGST] = useState<string>("");
  const [businessGST, setBusinessGST] = useState<string>("");
  
  // Calculate subtotal separately for services and products
  const servicesSubtotal = selectedServices.reduce((acc, service) => acc + service.price, 0);
  const productsSubtotal = selectedProducts.reduce((acc, product) => acc + (product.price * product.quantity), 0);
  const subtotal = servicesSubtotal + productsSubtotal;
  
  const discountValue = discountType === "percentage" 
    ? (subtotal * (discountAmount / 100)) 
    : discountAmount;
  
  const afterDiscount = subtotal - discountValue;
  
  // Apply tax only to services, not to products
  const taxAmount = servicesSubtotal > 0 ? (servicesSubtotal - (servicesSubtotal * discountValue / subtotal)) * (taxRate / 100) : 0;
  const total = afterDiscount + taxAmount;

  // Fetch business GST from settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('general_settings')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  // Update business GST from settings
  useEffect(() => {
    if (settings?.general_settings?.businessGST) {
      setBusinessGST(settings.general_settings.businessGST);
    }
  }, [settings]);

  // Fetch customer GST if customer exists in database
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!customer.id) return;

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customer.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching customer details:", error);
        return;
      }

      if (data && data.gst_number) {
        setCustomerGST(data.gst_number);
      }
    };

    fetchCustomerDetails();
  }, [customer.id]);

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
      customer: {
        ...customer,
        gst_number: customerGST
      },
      services: selectedServices,
      products: selectedProducts,
      taxRate,
      discountAmount,
      discountType,
      subtotal,
      discountValue,
      taxAmount,
      total,
      businessGST,
      servicesSubtotal,
      productsSubtotal
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">GST Number (Optional)</label>
            <input
              type="text"
              value={customerGST}
              onChange={(e) => setCustomerGST(e.target.value)}
              placeholder="Enter customer GST number"
              className="mt-1 block w-full rounded-md border-border px-3 py-2 bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
            />
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
          <h3 className="font-medium mb-3">Tax (Applied only to services)</h3>
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
          {servicesSubtotal > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Tax is applied only to services: ₹{taxAmount.toFixed(2)} on ₹{servicesSubtotal.toFixed(2)}
            </p>
          )}
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

      <div>
        <h3 className="font-medium mb-3">Business GST Number</h3>
        <input
          type="text"
          value={businessGST}
          onChange={(e) => setBusinessGST(e.target.value)}
          placeholder="Enter your business GST number"
          className="w-full px-3 py-2 border-border rounded-md"
        />
      </div>

      <div className="border-t pt-4 mt-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Services Subtotal</span>
            <span>₹{servicesSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Products Subtotal</span>
            <span>₹{productsSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span>₹{discountValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({taxRate}%) - Applied to services only</span>
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


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CustomerForm, CustomerFormData } from "@/components/billing/CustomerForm";
import { BillForm } from "@/components/billing/BillForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Billing = () => {
  const [step, setStep] = useState<"customer" | "bill">("customer");
  const [customerData, setCustomerData] = useState<CustomerFormData | null>(null);
  const [isBillCreated, setIsBillCreated] = useState(false);
  const [currentBill, setCurrentBill] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<CustomerFormData[]>([]);

  // Fetch settings for default values
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch customers for searching
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*');
      
      if (error) throw error;
      return data.map(customer => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        birthday: customer.birthday,
        anniversary: customer.anniversary,
        gst_number: customer.gst_number,
        notes: customer.notes
      }));
    }
  });

  // Search for customers when user types
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 3 || !customers) {
      setSearchResults([]);
      return;
    }

    const filteredCustomers = customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      customer.phone.includes(searchTerm)
    );
    
    setSearchResults(filteredCustomers);
  }, [searchTerm, customers]);

  // Fetch staff
  const { data: staffMembers } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Mock data for demonstration
  const mockServices = [
    {
      id: "1",
      name: "Haircut & Styling",
      price: 850,
      duration: 60,
      description: "Professional haircut with styling",
    },
    {
      id: "2",
      name: "Hair Color",
      price: 1800,
      duration: 120,
      description: "Premium hair color with global application",
    },
    {
      id: "3",
      name: "Facial",
      price: 1200,
      duration: 45,
      description: "Rejuvenating facial treatment",
    },
    {
      id: "4",
      name: "Manicure",
      price: 600,
      duration: 30,
      description: "Nail care and polish application",
    },
  ];

  const mockProducts = [
    {
      id: "prod1",
      name: "Shampoo - Premium",
      price: 450,
      stock: 25,
    },
    {
      id: "prod2",
      name: "Hair Serum",
      price: 650,
      stock: 18,
    },
    {
      id: "prod3",
      name: "Styling Gel",
      price: 350,
      stock: 30,
    },
    {
      id: "prod4",
      name: "Face Cream",
      price: 550,
      stock: 15,
    },
  ];

  const handleCustomerSelect = (customer: CustomerFormData) => {
    setCustomerData(customer);
    setStep("bill");
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleCustomerSubmit = (customer: CustomerFormData) => {
    setCustomerData(customer);
    setStep("bill");
  };

  const handleBillSubmit = (billData: any) => {
    setCurrentBill({
      ...billData,
      id: `BILL-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    });
    setIsBillCreated(true);
  };

  const handleNewBill = () => {
    setCustomerData(null);
    setStep("customer");
    setIsBillCreated(false);
    setCurrentBill(null);
  };

  const handleSendBill = (method: "sms" | "whatsapp") => {
    alert(`Bill sent via ${method === "sms" ? "SMS" : "WhatsApp"}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1 animate-fade-in">
          Billing
        </h1>
        <p className="text-muted-foreground animate-fade-in animate-delay-100">
          Create bills for your customers
        </p>
      </div>

      {!isBillCreated ? (
        <div className="bg-card shadow-sm rounded-xl p-6 animate-fade-in animate-delay-200">
          <div className="mb-6">
            <div className="flex mb-4">
              <div
                className={`flex-1 pb-4 text-center border-b-2 ${
                  step === "customer" ? "border-primary" : "border-muted"
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                    step === "customer"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  } mr-2`}
                >
                  1
                </span>
                Customer Details
              </div>
              <div
                className={`flex-1 pb-4 text-center border-b-2 ${
                  step === "bill" ? "border-primary" : "border-muted"
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                    step === "bill"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  } mr-2`}
                >
                  2
                </span>
                Bill Creation
              </div>
            </div>
          </div>

          {step === "customer" ? (
            <>
              {/* Customer search */}
              <div className="mb-6">
                <label htmlFor="customerSearch" className="block text-sm font-medium mb-2">
                  Search Existing Customer
                </label>
                <input
                  id="customerSearch"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or phone (min 3 characters)"
                  className="w-full p-2 border rounded-md"
                />
                
                {searchResults.length > 0 && (
                  <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
                    {searchResults.map((customer) => (
                      <div 
                        key={customer.id} 
                        className="p-3 border-b cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-600">{customer.phone}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-4">New Customer</h3>
              </div>
              <CustomerForm onSubmit={handleCustomerSubmit} />
            </>
          ) : (
            <>
              {customerData && (
                <BillForm
                  customer={customerData}
                  services={mockServices}
                  staff={staffMembers || []}
                  products={mockProducts}
                  onSubmit={handleBillSubmit}
                />
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-card shadow-sm rounded-xl p-6 animate-fade-in">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-800 rounded-full mb-4">
              ✓
            </div>
            <h2 className="text-2xl font-semibold">Bill Created Successfully</h2>
            <p className="text-muted-foreground mt-1">
              Bill #{currentBill.id} has been created
            </p>
          </div>

          <div className="border rounded-lg p-6 mb-6">
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Bill Details</h3>
                <p className="text-sm text-muted-foreground">{currentBill.date}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">Bill #{currentBill.id}</p>
                {currentBill.businessGST && (
                  <p className="text-sm text-muted-foreground">Business GST: {currentBill.businessGST}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">Customer Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p>{currentBill.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p>{currentBill.customer.phone}</p>
                </div>
                {currentBill.customer.gst_number && (
                  <div>
                    <p className="text-sm font-medium">GST Number</p>
                    <p>{currentBill.customer.gst_number}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">Services</h4>
              {currentBill.services.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Service</th>
                      <th className="py-2 text-left">Staff</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBill.services.map((service: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{service.name}</td>
                        <td className="py-2">
                          {staffMembers && staffMembers.find(s => s.id === service.staffId)?.name || "N/A"}
                        </td>
                        <td className="py-2 text-right">₹{service.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted-foreground">No services</p>
              )}
            </div>

            {currentBill.products.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Products</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Product</th>
                      <th className="py-2 text-center">Quantity</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBill.products.map((product: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{product.name}</td>
                        <td className="py-2 text-center">{product.quantity}</td>
                        <td className="py-2 text-right">
                          ₹{product.price * product.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6">
              <div className="flex justify-between py-1">
                <span>Services Subtotal</span>
                <span>₹{currentBill.servicesSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Products Subtotal</span>
                <span>₹{currentBill.productsSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Total Subtotal</span>
                <span>₹{currentBill.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Discount</span>
                <span>₹{currentBill.discountValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>
                  Tax ({currentBill.taxRate}%) - Applied to services only
                </span>
                <span>₹{currentBill.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t mt-2 font-bold">
                <span>Total</span>
                <span>₹{currentBill.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => alert("Printing bill...")}
            >
              Print Bill
            </Button>
            <Button onClick={() => handleSendBill("sms")}>Send via SMS</Button>
            <Button onClick={() => handleSendBill("whatsapp")}>
              Send via WhatsApp
            </Button>
            <Button variant="secondary" onClick={handleNewBill}>
              Create New Bill
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;

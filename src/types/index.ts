
export interface Customer {
  id: string;
  name: string;
  phone: string;
  birthday?: string;
  anniversary?: string;
  notes?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
}

export interface StaffMember {
  id: string;
  name: string;
  position: string;
  phone: string;
  email?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  companyId: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  companyId: string;
}

export interface Company {
  id: string;
  name: string;
}

export interface Bill {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  services: BillService[];
  products: BillProduct[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountType: "percentage" | "amount";
  discountAmount: number;
  discountValue: number;
  total: number;
  createdAt: string;
  status: "completed" | "pending" | "cancelled";
}

export interface BillService {
  serviceId: string;
  serviceName: string;
  price: number;
  staffId: string;
  staffName: string;
}

export interface BillProduct {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface DashboardStats {
  totalSales: number;
  totalCustomers: number;
  totalServices: number;
  totalProducts: number;
  recentTransactions: Bill[];
  upcomingEvents: UpcomingEvent[];
  staffPerformance: StaffPerformance[];
}

export interface UpcomingEvent {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  type: "birthday" | "anniversary";
  date: string;
}

export interface StaffPerformance {
  id: string;
  name: string;
  position: string;
  servicesCompleted: number;
  revenue: number;
}

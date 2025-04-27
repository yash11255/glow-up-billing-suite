
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StaffMember {
  id: string;
  name: string;
  position: string;
  servicesCompleted: number;
  revenue: string | number;
}

interface StaffPerformanceProps {
  staffMembers: StaffMember[];
}

export const StaffPerformance = ({ staffMembers }: StaffPerformanceProps) => {
  // Format revenue to ensure string output
  const formatRevenue = (revenue: string | number): string => {
    if (typeof revenue === 'string') return revenue;
    return `₹${revenue.toLocaleString('en-IN')}`;
  };
  
  return (
    <div className="bg-card rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Staff Performance</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffMembers.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell className="font-medium">{staff.name}</TableCell>
                <TableCell>{staff.position}</TableCell>
                <TableCell>{staff.servicesCompleted}</TableCell>
                <TableCell>{formatRevenue(staff.revenue)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

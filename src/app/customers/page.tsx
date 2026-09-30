import { getCustomers } from "@/app/actions/customer";
import { CustomerClient } from "./client";

export default async function CustomersPage() {
  const customers = await getCustomers();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-gray-500">Manage your client database and projects.</p>
        </div>
      </div>
      
      <CustomerClient initialCustomers={customers} />
    </div>
  );
}

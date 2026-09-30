import { getCustomers } from "@/app/actions/customer";
import { CustomerClient } from "./client";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CustomersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
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

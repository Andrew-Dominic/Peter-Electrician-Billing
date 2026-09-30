import { getCustomers } from "@/app/actions/customer";
import { getActiveMaterials } from "@/app/actions/material";
import { getBillById } from "@/app/actions/bill";
import { BillEditor } from "./BillEditor";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewBillPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const params = await searchParams;
  const [customers, materials, settings] = await Promise.all([
    getCustomers(),
    getActiveMaterials(),
    prisma.settings.findFirst()
  ]);

  let initialBill = null;
  if (params.id) {
    initialBill = await getBillById(params.id);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-blue mb-1">
            {initialBill ? (initialBill.status === 'FINALIZED' ? 'View Bill' : 'Edit Draft') : 'Create New Bill'}
          </h1>
          <p className="text-sm sm:text-base text-gray-500">Fill in the details below to generate an invoice.</p>
        </div>
      </div>
      
      <BillEditor 
        key={initialBill?.id || "new"}
        customers={customers} 
        materials={materials} 
        initialBill={initialBill} 
        settings={settings} 
      />
    </div>
  );
}

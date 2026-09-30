import { getBills } from "@/app/actions/bill";
import { BillClient } from "./client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function BillsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  
  const [bills, settings] = await Promise.all([
    getBills(),
    prisma.settings.findFirst()
  ]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-gray-500">Manage your past and draft invoices.</p>
        </div>
        <Link href="/bills/new">
          <Button className="bg-brand-orange hover:bg-brand-orange-hover text-white">
            <Plus className="h-4 w-4 mr-2" /> Create New Bill
          </Button>
        </Link>
      </div>
      
      <BillClient initialBills={bills} settings={settings} />
    </div>
  );
}

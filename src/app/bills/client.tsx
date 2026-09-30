"use client";

import { useState } from "react";
import { Search, Eye, Edit, Trash2, Copy, FileDown, Printer } from "lucide-react";
import { Invoice } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteDraftBill, duplicateBill } from "@/app/actions/bill";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function BillClient({ initialBills }: { initialBills: any[] }) {
  const router = useRouter();
  const [bills, setBills] = useState(initialBills);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredBills = bills.filter(b => {
    const matchesSearch = 
      b.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (b.customerPhone && b.customerPhone.includes(search));
    
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this draft bill?")) {
      await deleteDraftBill(id);
      setBills(bills.filter(b => b.id !== id));
    }
  };

  const handleDuplicate = async (id: string) => {
    if (confirm("Create a new draft based on this bill?")) {
      const newBill = await duplicateBill(id);
      router.push(`/bills/new?id=${newBill.id}`);
    }
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search invoice number, customer..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "ALL")}>
            <SelectTrigger>
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Bills</SelectItem>
              <SelectItem value="DRAFT">Drafts</SelectItem>
              <SelectItem value="FINALIZED">Finalized</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount (₹)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                  No bills found.
                </TableCell>
              </TableRow>
            ) : (
              filteredBills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.invoiceNumber}</TableCell>
                  <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                  <TableCell>{bill.customerName}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${bill.status === 'FINALIZED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {bill.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">₹{bill.grandTotal.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/bills/new?id=${bill.id}`}>
                      <Button variant="ghost" size="icon" title={bill.status === "DRAFT" ? "Edit" : "View"}>
                        {bill.status === "DRAFT" ? <Edit className="h-4 w-4 text-brand-blue" /> : <Eye className="h-4 w-4 text-gray-600" />}
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" title="Duplicate" onClick={() => handleDuplicate(bill.id)}>
                      <Copy className="h-4 w-4 text-gray-500" />
                    </Button>
                    {bill.status === "DRAFT" && (
                      <Button variant="ghost" size="icon" title="Delete Draft" onClick={() => handleDelete(bill.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

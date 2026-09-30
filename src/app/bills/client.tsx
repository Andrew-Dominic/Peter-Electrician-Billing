"use client";

import { useState } from "react";
import { Search, Eye, Edit, Trash2, Copy, MoreVertical } from "lucide-react";
import { Invoice } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteBill, duplicateBill } from "@/app/actions/bill";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function BillClient({ initialBills }: { initialBills: any[] }) {
  const router = useRouter();
  const [bills, setBills] = useState(initialBills);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [billToDelete, setBillToDelete] = useState<string | null>(null);
  const [billToDuplicate, setBillToDuplicate] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const filteredBills = bills.filter(b => {
    const matchesSearch = 
      b.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (b.customerPhone && b.customerPhone.includes(search));
    
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!billToDelete) return;
    setIsDeleting(true);
    await deleteBill(billToDelete);
    setBills(bills.filter(b => b.id !== billToDelete));
    setBillToDelete(null);
    setIsDeleting(false);
  };

  const handleDuplicate = async () => {
    if (!billToDuplicate) return;
    setIsDuplicating(true);
    const newBill = await duplicateBill(billToDuplicate);
    router.push(`/bills/new?id=${newBill.id}`);
  };

  const ActionButtons = ({ bill }: { bill: any }) => (
    <>
      <Link href={`/bills/new?id=${bill.id}`}>
        <Button variant="outline" size="sm" className="gap-2 px-3" title={bill.status === "DRAFT" ? "Edit" : "Preview"}>
          {bill.status === "DRAFT" ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span>{bill.status === "DRAFT" ? "Edit" : "Preview"}</span>
        </Button>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setBillToDuplicate(bill.id)}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBillToDelete(bill.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <div className="space-y-4 bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
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

      {/* Desktop View */}
      <div className="hidden md:block border rounded-md overflow-x-auto">
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
                  <TableCell className="text-right flex items-center justify-end gap-1">
                    <ActionButtons bill={bill} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4 pt-2">
        {filteredBills.length === 0 ? (
          <div className="text-center py-10 text-gray-500 border rounded-lg">
            No bills found.
          </div>
        ) : (
          filteredBills.map((bill) => (
            <div key={bill.id} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col space-y-4 relative">
              <div className="flex justify-between items-start">
                <div className="pr-10">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{bill.customerName}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-brand-blue">{bill.invoiceNumber}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">{new Date(bill.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Total Amount</span>
                  <span className="font-bold text-lg text-gray-900">₹{bill.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${bill.status === 'FINALIZED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {bill.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1">
                  <Link href={`/bills/new?id=${bill.id}`} className="w-full block">
                    <Button variant="outline" className="w-full gap-2">
                      {bill.status === "DRAFT" ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {bill.status === "DRAFT" ? "Edit" : "Preview"}
                    </Button>
                  </Link>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setBillToDuplicate(bill.id)} className="py-2.5 cursor-pointer">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setBillToDelete(bill.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50 py-2.5 cursor-pointer">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Invoice
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={!!billToDelete} onOpenChange={(open) => !open && setBillToDelete(null)}>
        <DialogContent className="sm:max-w-md w-[90%] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Are you absolutely sure?</DialogTitle>
            <DialogDescription className="text-base pt-2">
              This action cannot be undone. This will permanently delete the invoice and remove its data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setBillToDelete(null)} disabled={isDeleting} className="w-full sm:w-auto h-11">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="w-full sm:w-auto h-11">
              {isDeleting ? "Deleting..." : "Delete Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={!!billToDuplicate} onOpenChange={(open) => !open && setBillToDuplicate(null)}>
        <DialogContent className="sm:max-w-md w-[90%] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Duplicate Invoice?</DialogTitle>
            <DialogDescription className="text-base pt-2">
              This will create a new draft invoice with the exact same items and customer details. You can edit it before finalizing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setBillToDuplicate(null)} disabled={isDuplicating} className="w-full sm:w-auto h-11">Cancel</Button>
            <Button onClick={handleDuplicate} disabled={isDuplicating} className="w-full sm:w-auto h-11 bg-brand-blue hover:bg-brand-blue-hover">
              {isDuplicating ? "Duplicating..." : "Yes, Duplicate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

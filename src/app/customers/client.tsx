"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Customer } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { addCustomer, updateCustomer, deleteCustomer } from "@/app/actions/customer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/contexts/I18nContext";

export function CustomerClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    siteName: "",
    siteAddress: "",
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.phone && c.phone.includes(search)) ||
    (c.siteName && c.siteName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      const updated = await updateCustomer(editingCustomer.id, formData);
      setCustomers(customers.map(c => c.id === updated.id ? updated : c));
    } else {
      const added = await addCustomer(formData);
      setCustomers([...customers, added]);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      await deleteCustomer(id);
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({ name: "", phone: "", address: "", siteName: "", siteAddress: "" });
    setEditingCustomer(null);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || "",
      address: customer.address || "",
      siteName: customer.siteName || "",
      siteAddress: customer.siteAddress || "",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder={t("customers.search")} 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger render={<Button className="bg-brand-blue hover:bg-brand-blue-hover" />}>
            <Plus className="h-4 w-4 mr-2" /> {t("customers.add")}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCustomer ? t("customers.edit") : t("customers.addNew")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("customers.name")}</Label>
                <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Ramesh Kumar" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("customers.phone")}</Label>
                <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="e.g. 9876543210" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t("customers.address")}</Label>
                <Input id="address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="e.g. 123 Main St" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Project/Site Name</Label>
                  <Input id="siteName" value={formData.siteName} onChange={e => setFormData({...formData, siteName: e.target.value})} placeholder="e.g. House Wiring" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteAddress">Site Address</Label>
                  <Input id="siteAddress" value={formData.siteAddress} onChange={e => setFormData({...formData, siteAddress: e.target.value})} placeholder="Optional" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-brand-blue hover:bg-brand-blue-hover">
                {editingCustomer ? t("customers.save") : t("customers.add")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("customers.tableName")}</TableHead>
              <TableHead>{t("customers.tablePhone")}</TableHead>
              <TableHead>Project/Site</TableHead>
              <TableHead className="text-right">{t("customers.tableActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-gray-500">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((cust) => (
                <TableRow key={cust.id}>
                  <TableCell className="font-medium">{cust.name}</TableCell>
                  <TableCell>{cust.phone || "-"}</TableCell>
                  <TableCell>{cust.siteName || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(cust)}>
                      <Edit className="h-4 w-4 text-brand-blue" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cust.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
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

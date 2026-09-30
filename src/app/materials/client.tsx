"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Material } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { addMaterial, updateMaterial, deleteMaterial } from "@/app/actions/material";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/contexts/I18nContext";

export function MaterialClient({ initialMaterials }: { initialMaterials: Material[] }) {
  const { t } = useTranslation();
  const [materials, setMaterials] = useState(initialMaterials);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: "Piece",
    sellingPrice: "",
  });

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    (m.category && m.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaterial) {
      const updated = await updateMaterial(editingMaterial.id, formData);
      setMaterials(materials.map(m => m.id === updated.id ? updated : m));
    } else {
      const added = await addMaterial(formData);
      setMaterials([...materials, added]);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this material?")) {
      await deleteMaterial(id);
      setMaterials(materials.filter(m => m.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({ name: "", category: "", unit: "Piece", sellingPrice: "" });
    setEditingMaterial(null);
  };

  const openEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      category: material.category || "",
      unit: material.unit,
      sellingPrice: material.sellingPrice.toString(),
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder={t("materials.search")} 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger render={<Button className="bg-brand-blue hover:bg-brand-blue-hover" />}>
            <Plus className="h-4 w-4 mr-2" /> {t("materials.add")}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMaterial ? t("materials.edit") : t("materials.addNew")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("materials.name")}</Label>
                <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. 2.5 sq.mm Wire" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">{t("materials.category")}</Label>
                  <Input id="category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Wire" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">{t("materials.unit")}</Label>
                  <Input id="unit" required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="e.g. Roll, Meter, Piece" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">{t("materials.sellingPrice")}</Label>
                <Input id="sellingPrice" type="number" step="0.01" required value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} placeholder="0.00" />
              </div>
              <Button type="submit" className="w-full bg-brand-blue hover:bg-brand-blue-hover">
                {editingMaterial ? t("materials.save") : t("materials.add")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("materials.tableName")}</TableHead>
              <TableHead>{t("materials.tableCategory")}</TableHead>
              <TableHead>{t("materials.tableUnit")}</TableHead>
              <TableHead className="text-right">{t("materials.tablePrice")}</TableHead>
              <TableHead className="text-right">{t("materials.tableActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMaterials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-gray-500">
                  No materials found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMaterials.map((mat) => (
                <TableRow key={mat.id}>
                  <TableCell className="font-medium">{mat.name}</TableCell>
                  <TableCell>{mat.category || "-"}</TableCell>
                  <TableCell>{mat.unit}</TableCell>
                  <TableCell className="text-right">₹{mat.sellingPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(mat)}>
                      <Edit className="h-4 w-4 text-brand-blue" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(mat.id)}>
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

import { getMaterials } from "@/app/actions/material";
import { MaterialClient } from "./client";

export default async function MaterialsPage() {
  const materials = await getMaterials();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Materials</h1>
          <p className="text-gray-500">Manage your product catalog and default prices.</p>
        </div>
      </div>
      
      <MaterialClient initialMaterials={materials} />
    </div>
  );
}

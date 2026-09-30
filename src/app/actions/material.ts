"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMaterials() {
  return prisma.material.findMany({
    orderBy: { name: "asc" }
  });
}

export async function getActiveMaterials() {
  return prisma.material.findMany({
    where: { active: true },
    orderBy: { name: "asc" }
  });
}

export async function addMaterial(data: any) {
  const result = await prisma.material.create({
    data: {
      name: data.name,
      category: data.category || null,
      unit: data.unit,
      sellingPrice: parseFloat(data.sellingPrice),
      costPrice: data.costPrice ? parseFloat(data.costPrice) : null,
      sku: data.sku || null,
      description: data.description || null,
      active: true,
    }
  });
  revalidatePath("/materials");
  return result;
}

export async function updateMaterial(id: string, data: any) {
  const result = await prisma.material.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category || null,
      unit: data.unit,
      sellingPrice: parseFloat(data.sellingPrice),
      costPrice: data.costPrice ? parseFloat(data.costPrice) : null,
      sku: data.sku || null,
      description: data.description || null,
      active: data.active ?? true,
    }
  });
  revalidatePath("/materials");
  return result;
}

export async function toggleMaterialStatus(id: string, active: boolean) {
  const result = await prisma.material.update({
    where: { id },
    data: { active }
  });
  revalidatePath("/materials");
  return result;
}

export async function deleteMaterial(id: string) {
  const result = await prisma.material.delete({
    where: { id }
  });
  revalidatePath("/materials");
  return result;
}

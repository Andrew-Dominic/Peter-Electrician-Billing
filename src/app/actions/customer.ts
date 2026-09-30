"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  return prisma.customer.findMany({
    orderBy: { name: "asc" }
  });
}

export async function addCustomer(data: any) {
  const result = await prisma.customer.create({
    data: {
      name: data.name,
      phone: data.phone || null,
      address: data.address || null,
      siteName: data.siteName || null,
      siteAddress: data.siteAddress || null,
    }
  });
  revalidatePath("/customers");
  return result;
}

export async function updateCustomer(id: string, data: any) {
  const result = await prisma.customer.update({
    where: { id },
    data: {
      name: data.name,
      phone: data.phone || null,
      address: data.address || null,
      siteName: data.siteName || null,
      siteAddress: data.siteAddress || null,
    }
  });
  revalidatePath("/customers");
  return result;
}

export async function deleteCustomer(id: string) {
  const result = await prisma.customer.delete({
    where: { id }
  });
  revalidatePath("/customers");
  return result;
}

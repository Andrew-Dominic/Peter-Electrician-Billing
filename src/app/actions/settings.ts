"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSettings(data: any) {
  const result = await prisma.settings.upsert({
    where: { id: "1" },
    update: {
      businessName: data.businessName,
      phone: data.phone,
      address: data.address,
      gstNumber: data.gstNumber,
      invoicePrefix: data.invoicePrefix,
      defaultTax: parseFloat(data.defaultTax) || 0,
      notes: data.notes
    },
    create: {
      id: "1",
      businessName: data.businessName,
      phone: data.phone,
      address: data.address,
      gstNumber: data.gstNumber,
      invoicePrefix: data.invoicePrefix,
      defaultTax: parseFloat(data.defaultTax) || 0,
      notes: data.notes
    }
  });
  revalidatePath("/settings");
  revalidatePath("/bills/new");
  return result;
}

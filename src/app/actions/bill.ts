"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getBills() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return prisma.invoice.findMany({
    orderBy: { date: "desc" },
    include: { customer: true }
  });
}

export async function getBillById(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return prisma.invoice.findUnique({
    where: { id },
    include: { items: true, customer: true }
  });
}

async function generateNextInvoiceNumber() {
  const settings = await prisma.settings.findFirst();
  const prefix = settings?.invoicePrefix || "PE-2026-";
  
  const lastInvoice = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: "desc" }
  });

  if (!lastInvoice) {
    return `${prefix}0001`;
  }

  const lastNumStr = lastInvoice.invoiceNumber.replace(prefix, "");
  const nextNum = parseInt(lastNumStr, 10) + 1;
  return `${prefix}${nextNum.toString().padStart(4, "0")}`;
}

export async function saveBill(data: any, id?: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  let finalInvoiceNumber = data.invoiceNumber;
  
  if (!id && !finalInvoiceNumber) {
    finalInvoiceNumber = await generateNextInvoiceNumber();
  }

  const payload = {
    invoiceNumber: finalInvoiceNumber,
    customerId: data.customerId || null,
    customerName: data.customerName,
    customerPhone: data.customerPhone || null,
    customerAddress: data.customerAddress || null,
    date: new Date(data.date),
    status: data.status || "DRAFT",
    paymentStatus: data.paymentStatus || "UNPAID",
    labourItems: JSON.stringify(data.labourItems || []),
    otherCharges: JSON.stringify(data.otherCharges || []),
    subtotal: data.subtotal,
    discountType: data.discountType || null,
    discountValue: data.discountValue || null,
    discountAmount: data.discountAmount || 0,
    taxEnabled: data.taxEnabled || false,
    taxRate: data.taxRate || null,
    taxAmount: data.taxAmount || 0,
    grandTotal: data.grandTotal,
    amountPaid: data.amountPaid || 0,
    balanceDue: data.balanceDue,
    notes: data.notes || null,
  };

  let result;
  if (id) {
    // Update existing
    // Delete existing items first
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
    
    result = await prisma.invoice.update({
      where: { id },
      data: {
        ...payload,
        items: {
          create: data.items.map((item: any) => ({
            materialId: item.materialId || null,
            name: item.name,
            unit: item.unit,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          }))
        }
      }
    });
  } else {
    // Create new
    result = await prisma.invoice.create({
      data: {
        ...payload,
        items: {
          create: data.items.map((item: any) => ({
            materialId: item.materialId || null,
            name: item.name,
            unit: item.unit,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          }))
        }
      }
    });
  }

  revalidatePath("/bills");
  revalidatePath("/");
  return result;
}

export async function finalizeBill(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  const result = await prisma.invoice.update({
    where: { id },
    data: { 
      status: "FINALIZED", 
      finalizedAt: new Date() 
    }
  });
  revalidatePath("/bills");
  revalidatePath("/");
  return result;
}

export async function duplicateBill(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  const existing = await getBillById(id);
  if (!existing) throw new Error("Bill not found");

  const newInvoiceNumber = await generateNextInvoiceNumber();

  const newBill = await prisma.invoice.create({
    data: {
      invoiceNumber: newInvoiceNumber,
      customerId: existing.customerId,
      customerName: existing.customerName,
      customerPhone: existing.customerPhone,
      customerAddress: existing.customerAddress,
      date: new Date(),
      status: "DRAFT",
      paymentStatus: "UNPAID",
      labourItems: existing.labourItems,
      otherCharges: existing.otherCharges,
      subtotal: existing.subtotal,
      discountType: existing.discountType,
      discountValue: existing.discountValue,
      discountAmount: existing.discountAmount,
      taxEnabled: existing.taxEnabled,
      taxRate: existing.taxRate,
      taxAmount: existing.taxAmount,
      grandTotal: existing.grandTotal,
      amountPaid: 0,
      balanceDue: existing.grandTotal,
      notes: existing.notes,
      items: {
        create: existing.items.map(item => ({
          materialId: item.materialId,
          name: item.name,
          unit: item.unit,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        }))
      }
    }
  });

  revalidatePath("/bills");
  return newBill;
}

export async function deleteBill(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/bills");
  revalidatePath("/");
}

export async function updatePaymentStatus(id: string, amountPaid: number) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  const bill = await prisma.invoice.findUnique({ where: { id } });
  if (!bill) throw new Error("Bill not found");

  const balanceDue = bill.grandTotal - amountPaid;
  let paymentStatus = "UNPAID";
  if (amountPaid > 0) paymentStatus = "PARTIALLY_PAID";
  if (balanceDue <= 0) paymentStatus = "PAID";

  const result = await prisma.invoice.update({
    where: { id },
    data: {
      amountPaid,
      balanceDue: balanceDue > 0 ? balanceDue : 0,
      paymentStatus
    }
  });
  
  revalidatePath("/bills");
  revalidatePath("/");
  return result;
}

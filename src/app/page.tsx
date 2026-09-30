import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/login");
  const [totalBills, billsThisMonth, totalSales, pendingAmount] = await Promise.all([
    prisma.invoice.count(),
    prisma.invoice.count({
      where: {
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        }
      }
    }),
    prisma.invoice.aggregate({
      _sum: { grandTotal: true },
      where: { status: "FINALIZED" }
    }),
    prisma.invoice.aggregate({
      _sum: { balanceDue: true },
      where: { status: "FINALIZED", balanceDue: { gt: 0 } }
    })
  ]);

  const recentBills = await prisma.invoice.findMany({
    take: 5,
    orderBy: { date: 'desc' },
    include: { customer: true }
  });

  return (
    <DashboardClient 
      totalBills={totalBills}
      billsThisMonth={billsThisMonth}
      totalSales={totalSales}
      pendingAmount={pendingAmount}
      recentBills={recentBills}
    />
  );
}

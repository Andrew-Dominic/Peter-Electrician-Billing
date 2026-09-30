import Link from "next/link";
import { PlusCircle, FileText, Users, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { useTranslation } from "@/contexts/I18nContext";

export default async function Dashboard() {
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

  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-gray-500 mt-2">{t("dashboard.subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white shadow-sm shadow-brand-blue/5 border-slate-100 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.totalBills")}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBills}</div>
            <p className="text-xs text-muted-foreground">
              {billsThisMonth} {t("dashboard.thisMonth")}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm shadow-brand-blue/5 border-slate-100 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.totalSales")}</CardTitle>
            <span className="h-4 w-4 text-muted-foreground font-bold">₹</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(totalSales._sum.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.fromFinalized")}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm shadow-brand-blue/5 border-slate-100 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.pendingAmount")}</CardTitle>
            <span className="h-4 w-4 text-muted-foreground font-bold text-red-500">₹</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{(pendingAmount._sum.balanceDue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.needsCollection")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/bills/new">
          <Card className="bg-gradient-to-r from-brand-orange to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-md shadow-brand-orange/20 border-orange-400 transition-colors cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
              <PlusCircle className="h-8 w-8 text-white mb-4" />
              <div className="font-semibold text-lg text-white">{t("dashboard.startNew")}</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/materials">
          <Card className="bg-white hover:bg-slate-50 transition-colors shadow-sm shadow-brand-blue/5 border-slate-100 rounded-2xl cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
              <Package className="h-8 w-8 text-gray-600 mb-4" />
              <div className="font-semibold text-lg">{t("dashboard.manageMaterials")}</div>
              <p className="text-sm text-gray-500 mt-1">{t("dashboard.updateCatalog")}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/customers">
          <Card className="bg-white hover:bg-slate-50 transition-colors shadow-sm shadow-brand-blue/5 border-slate-100 rounded-2xl cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
              <Users className="h-8 w-8 text-gray-600 mb-4" />
              <div className="font-semibold text-lg">{t("sidebar.customers")}</div>
              <p className="text-sm text-gray-500 mt-1">{t("dashboard.viewHistory")}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/bills">
          <Card className="bg-white hover:bg-slate-50 transition-colors shadow-sm shadow-brand-blue/5 border-slate-100 rounded-2xl cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
              <FileText className="h-8 w-8 text-gray-600 mb-4" />
              <div className="font-semibold text-lg">{t("dashboard.allBills")}</div>
              <p className="text-sm text-gray-500 mt-1">{t("dashboard.viewPrintPast")}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="bg-white shadow-sm shadow-brand-blue/5 border-slate-100 rounded-2xl">
        <CardHeader>
          <CardTitle>{t("dashboard.recentBills")}</CardTitle>
          <CardDescription>
            {t("dashboard.recentSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentBills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t("dashboard.noBills")}
            </div>
          ) : (
            <div className="space-y-4">
              {recentBills.map(bill => (
                <div key={bill.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{bill.customerName}</p>
                    <p className="text-sm text-gray-500">{bill.invoiceNumber} • {bill.date.toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{bill.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                    <div className="flex gap-2 justify-end mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${bill.status === 'FINALIZED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {bill.status}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${bill.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : bill.paymentStatus === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {bill.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

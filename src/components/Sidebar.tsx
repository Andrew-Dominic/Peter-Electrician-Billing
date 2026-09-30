"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Settings,
  PlusCircle,
  Menu,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { logout } from "@/app/actions/auth";
import { useTranslation } from "@/contexts/I18nContext";

const getNavItems = (t: any) => [
  { name: t("sidebar.dashboard"), href: "/", icon: LayoutDashboard },
  { name: t("sidebar.bills"), href: "/bills", icon: FileText },
  { name: t("sidebar.customers"), href: "/customers", icon: Users },
  { name: t("sidebar.materials"), href: "/materials", icon: Package },
  { name: t("sidebar.settings"), href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t, lang, setLang } = useTranslation();
  
  const navItems = getNavItems(t);

  const NavLinks = () => (
    <div className="space-y-1 py-4 flex flex-col h-full">
      <div className="flex-1">
        <Link href="/bills/new" className="block mb-6 px-3">
          <Button className="w-full justify-start gap-2 bg-brand-blue hover:bg-brand-blue-hover">
            <PlusCircle className="h-5 w-5" />
            {t("sidebar.createNewBill")}
          </Button>
        </Link>
      
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        // Exact match for dashboard
        const isActuallyActive = item.href === '/' ? pathname === '/' : isActive;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              isActuallyActive
                ? "bg-gray-50 text-brand-blue"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <item.icon className={cn("h-5 w-5", isActuallyActive ? "text-brand-blue" : "text-gray-400")} />
            {item.name}
          </Link>
        );
      })}
      </div>
      
      <div className="mt-8 pt-4 border-t px-3 space-y-4">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setLang('en')}
            className={cn("flex-1 text-sm py-1.5 rounded-md transition-colors", lang === 'en' ? "bg-white shadow-sm font-semibold" : "text-slate-500 hover:text-slate-900")}
          >
            English
          </button>
          <button 
            onClick={() => setLang('ta')}
            className={cn("flex-1 text-sm py-1.5 rounded-md transition-colors", lang === 'ta' ? "bg-white shadow-sm font-semibold" : "text-slate-500 hover:text-slate-900")}
          >
            தமிழ்
          </button>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="h-5 w-5" />
            {t("sidebar.logout")}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="lg:hidden flex items-center p-4 border-b bg-white">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="mr-2" />}>
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-6 pb-0 border-b">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">{t("sidebar.title")}</h2>
              <p className="text-sm text-gray-500 mb-4">{t("sidebar.subtitle")}</p>
            </div>
            <div className="px-3 h-[calc(100vh-100px)]">
              <NavLinks />
            </div>
          </SheetContent>
        </Sheet>
        <span className="font-bold text-lg">{t("sidebar.title")}</span>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 border-r bg-white h-screen fixed">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">{t("sidebar.title")}</h2>
          <p className="text-sm text-gray-500">{t("sidebar.subtitle")}</p>
        </div>
        <div className="flex-1 overflow-auto px-3 py-2 flex flex-col">
          <NavLinks />
        </div>
      </div>
    </>
  );
}

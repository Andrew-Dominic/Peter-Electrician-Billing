import prisma from "@/lib/prisma";
import { SettingsClient } from "./client";

export default async function SettingsPage() {
  const settings = await prisma.settings.findFirst() || {
    id: "1",
    businessName: "Peter Electricians",
    phone: "",
    address: "",
    gstNumber: "",
    invoicePrefix: "PE-2026-",
    defaultTax: 0,
    notes: ""
  };
  
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Settings</h1>
        <p className="text-gray-500">Configure your invoice defaults and business information.</p>
      </div>
      
      <SettingsClient initialSettings={settings} />
    </div>
  );
}

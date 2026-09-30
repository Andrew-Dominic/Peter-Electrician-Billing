"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSettings } from "@/app/actions/settings";

export function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const [formData, setFormData] = useState({
    businessName: initialSettings.businessName || "",
    phone: initialSettings.phone || "",
    address: initialSettings.address || "",
    gstNumber: initialSettings.gstNumber || "",
    invoicePrefix: initialSettings.invoicePrefix || "PE-2026-",
    defaultTax: initialSettings.defaultTax || 0,
    notes: initialSettings.notes || "",
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(formData);
      alert("Settings saved successfully.");
    } catch (error) {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} required />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>GST Number (Optional)</Label>
              <Input value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Business Address</Label>
            <Textarea rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Invoice Number Prefix</Label>
              <Input value={formData.invoicePrefix} onChange={e => setFormData({...formData, invoicePrefix: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Default Tax Rate (%)</Label>
              <Input type="number" value={formData.defaultTax} onChange={e => setFormData({...formData, defaultTax: parseFloat(e.target.value) || 0})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Default Invoice Footer Notes</Label>
            <Textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={saving} className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue-hover">
        <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}

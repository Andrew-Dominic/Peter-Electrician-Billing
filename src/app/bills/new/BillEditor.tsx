"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Printer, Save, CheckCircle, Search, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useReactToPrint } from "react-to-print";
import { InvoicePrint } from "./InvoicePrint";
import { saveBill, finalizeBill, updatePaymentStatus } from "@/app/actions/bill";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/contexts/I18nContext";

export function BillEditor({ customers, materials, initialBill, settings }: any) {
  const router = useRouter();
  const { t } = useTranslation();
  const printRef = useRef(null);

  // Bill Core State
  const [billId, setBillId] = useState(initialBill?.id || null);
  const [status, setStatus] = useState(initialBill?.status || "DRAFT");
  const [date, setDate] = useState(initialBill ? new Date(initialBill.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  
  // Customer State
  const [customerId, setCustomerId] = useState(initialBill?.customerId || "");
  const [customerName, setCustomerName] = useState(initialBill?.customerName || "");
  const [customerPhone, setCustomerPhone] = useState(initialBill?.customerPhone || "");
  const [customerAddress, setCustomerAddress] = useState(initialBill?.customerAddress || "");
  
  // Items State
  const [items, setItems] = useState<any[]>(initialBill?.items || []);
  const [labourItems, setLabourItems] = useState<any[]>(initialBill?.labourItems ? JSON.parse(initialBill.labourItems) : []);
  const [otherCharges, setOtherCharges] = useState<any[]>(initialBill?.otherCharges ? JSON.parse(initialBill.otherCharges) : []);
  
  // Totals & Config State
  const [discountType, setDiscountType] = useState(initialBill?.discountType || "FIXED");
  const [discountValue, setDiscountValue] = useState<number>(initialBill?.discountValue || 0);
  const [taxEnabled, setTaxEnabled] = useState(initialBill ? initialBill.taxEnabled : settings?.defaultTax > 0);
  const [taxRate, setTaxRate] = useState<number>(initialBill?.taxRate || settings?.defaultTax || 18);
  const [amountPaid, setAmountPaid] = useState<number>(initialBill?.amountPaid || 0);
  const [notes, setNotes] = useState(initialBill?.notes || settings?.notes || "");

  // Material selection
  const [materialSearch, setMaterialSearch] = useState("");
  const [isMaterialSelectorOpen, setIsMaterialSelectorOpen] = useState(false);

  // Computations
  const computed = useMemo(() => {
    let materialSubtotal = 0;
    const computedItems = items.map(item => {
      const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0);
      materialSubtotal += amount;
      return { ...item, amount };
    });

    const labourTotal = labourItems.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const otherTotal = otherCharges.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    
    const subtotal = materialSubtotal + labourTotal + otherTotal;
    
    let discountAmount = 0;
    if (discountType === "PERCENTAGE") {
      discountAmount = subtotal * (discountValue / 100);
    } else {
      discountAmount = discountValue;
    }
    
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    
    let taxAmount = 0;
    if (taxEnabled) {
      taxAmount = taxableAmount * (taxRate / 100);
    }
    
    const grandTotal = taxableAmount + taxAmount;
    const balanceDue = grandTotal - amountPaid;

    return {
      items: computedItems,
      materialSubtotal,
      labourTotal,
      otherTotal,
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal,
      balanceDue
    };
  }, [items, labourItems, otherCharges, discountType, discountValue, taxEnabled, taxRate, amountPaid]);

  const isReadOnly = status === "FINALIZED";

  // Actions
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${initialBill?.invoiceNumber || 'Draft'}`,
  });

  const handleSelectCustomer = (cid: string) => {
    const cust = customers.find((c: any) => c.id === cid);
    if (cust) {
      setCustomerId(cust.id);
      setCustomerName(cust.name);
      setCustomerPhone(cust.phone || "");
      let addr = cust.address || "";
      if (cust.siteName) addr += `\nSite: ${cust.siteName}`;
      setCustomerAddress(addr);
    } else {
      setCustomerId("");
    }
  };

  const handleAddMaterial = (mat: any) => {
    setItems([...items, {
      materialId: mat.id,
      name: mat.name,
      unit: mat.unit,
      quantity: 1,
      rate: mat.sellingPrice,
      amount: mat.sellingPrice
    }]);
    setIsMaterialSelectorOpen(false);
    setMaterialSearch("");
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const updateQuantity = (index: number, delta: number) => {
    const current = parseFloat(items[index].quantity) || 0;
    const next = Math.max(0, current + delta);
    updateItem(index, "quantity", next);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    if (!customerName) return alert("Customer Name is required.");
    if (items.length === 0 && labourItems.length === 0 && otherCharges.length === 0) {
      return alert("Add at least one item, labour, or charge.");
    }
    
    try {
      const payload = {
        invoiceNumber: initialBill?.invoiceNumber,
        customerId,
        customerName,
        customerPhone,
        customerAddress,
        date,
        status: "DRAFT",
        items: computed.items,
        labourItems,
        otherCharges,
        subtotal: computed.subtotal,
        discountType,
        discountValue,
        discountAmount: computed.discountAmount,
        taxEnabled,
        taxRate,
        taxAmount: computed.taxAmount,
        grandTotal: computed.grandTotal,
        amountPaid,
        balanceDue: computed.balanceDue,
        notes
      };

      const result = await saveBill(payload, billId);
      if (!billId) {
        setBillId(result.id);
        router.replace(`/bills/new?id=${result.id}`);
      }
      alert("Draft saved successfully.");
    } catch (e) {
      console.error(e);
      alert("Failed to save draft.");
    }
  };

  const handleFinalize = async () => {
    if (!billId) {
      alert("Please save the draft first before finalizing.");
      return;
    }
    if (confirm("Once finalized, this invoice will be locked from accidental changes. Continue?")) {
      await handleSaveDraft(); // Save latest changes
      await finalizeBill(billId);
      setStatus("FINALIZED");
      alert("Bill Finalized.");
    }
  };

  const filteredMaterials = materials.filter((m: any) => 
    m.name.toLowerCase().includes(materialSearch.toLowerCase())
  );

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4 border-b pb-4">
                <h3 className="text-xl font-bold text-brand-blue">{t("billEditor.customerInfo")}</h3>
                {!isReadOnly && (
                  <div className="w-full sm:w-64">
                    <Select onValueChange={handleSelectCustomer} value={customerId}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("billEditor.selectCustomer")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("billEditor.newCustom")}</SelectItem>
                        {customers.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("billEditor.name")}</Label>
                  <Input disabled={isReadOnly} value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer Name" />
                </div>
                <div className="space-y-2">
                  <Label>{t("billEditor.phone")}</Label>
                  <Input disabled={isReadOnly} value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone Number" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{t("billEditor.address")}</Label>
                  <Textarea disabled={isReadOnly} rows={2} value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Address details" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{t("billEditor.date")}</Label>
                  <Input disabled={isReadOnly} type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Materials Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h3 className="text-xl font-bold text-brand-blue">{t("billEditor.materialsUsed")}</h3>
                {!isReadOnly && (
                  <Dialog open={isMaterialSelectorOpen} onOpenChange={setIsMaterialSelectorOpen}>
                    <DialogTrigger render={<Button size="sm" className="bg-brand-blue hover:bg-brand-blue-hover shadow-sm" />}>
                    <Search className="h-4 w-4 mr-2" /> {t("billEditor.addMaterial")}
                  </DialogTrigger>
                    <DialogContent className="max-w-xl">
                      <DialogHeader>
                        <DialogTitle>{t("billEditor.searchMaterial")}</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <Input 
                          placeholder={t("billEditor.typeMaterial")} 
                          value={materialSearch} 
                          onChange={e => setMaterialSearch(e.target.value)}
                          autoFocus
                        />
                        <div className="mt-4 max-h-[300px] overflow-y-auto space-y-2 border rounded p-2">
                          {filteredMaterials.slice(0, 50).map((mat: any) => (
                            <div key={mat.id} 
                                 onClick={() => handleAddMaterial(mat)}
                                 className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                              <div>
                                <p className="font-medium">{mat.name}</p>
                                <p className="text-xs text-gray-500">{mat.category || "Uncategorized"}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-brand-blue">₹{mat.sellingPrice}</p>
                                <p className="text-xs text-gray-500">per {mat.unit}</p>
                              </div>
                            </div>
                          ))}
                          {filteredMaterials.length === 0 && <p className="text-center text-gray-500 py-4">{t("billEditor.noMaterialsFound")}</p>}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-400 bg-slate-50 rounded border border-dashed">
                  {t("billEditor.noMaterialsAdded")}
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center bg-slate-50 p-3 rounded border">
                      <div className="flex-1 font-medium text-sm sm:text-base">{item.name}</div>
                      
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:justify-end mt-2 sm:mt-0">
                        <div className="flex items-center">
                          <Button disabled={isReadOnly} variant="outline" size="icon" className="h-8 w-8 rounded-r-none" onClick={() => updateQuantity(idx, -1)}>-</Button>
                          <Input 
                            disabled={isReadOnly}
                            type="number" 
                            className="h-8 w-20 rounded-none text-center [appearance:textfield]" 
                            value={item.quantity}
                            onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                            step="any"
                          />
                          <Button disabled={isReadOnly} variant="outline" size="icon" className="h-8 w-8 rounded-l-none" onClick={() => updateQuantity(idx, 1)}>+</Button>
                        </div>
                        <div className="text-sm text-gray-500 w-12 text-center">{item.unit}</div>
                        
                        <div className="flex items-center">
                          <span className="text-gray-500 mx-2">×</span>
                          <span className="text-gray-500 mr-1">₹</span>
                          <Input 
                            disabled={isReadOnly}
                            type="number" 
                            className="h-8 w-24 text-right" 
                            value={item.rate}
                            onChange={(e) => updateItem(idx, "rate", e.target.value)}
                            step="any"
                          />
                        </div>

                        <div className="w-24 text-right font-bold text-gray-900">
                          ₹{computed.items[idx].amount.toFixed(2)}
                        </div>

                        {!isReadOnly && (
                          <Button variant="ghost" size="icon" onClick={() => removeItem(idx)} className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="text-right font-bold text-lg pt-4 border-t">
                    {t("billEditor.materialsSubtotal")} <span className="text-brand-blue">₹{computed.materialSubtotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Labour & Other Charges */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Labour */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">{t("billEditor.labourCharges")}</h3>
                    {!isReadOnly && (
                      <Button size="sm" variant="outline" onClick={() => setLabourItems([...labourItems, { description: t("billEditor.labourCharges"), amount: 0 }])}>
                        <Plus className="h-3 w-3 mr-1" /> {t("billEditor.add")}
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {labourItems.map((labour, idx) => (
                      <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                        <Input disabled={isReadOnly} value={labour.description} className="flex-1 min-w-[120px]" onChange={e => {
                          const arr = [...labourItems]; arr[idx].description = e.target.value; setLabourItems(arr);
                        }} placeholder={t("billEditor.description")} />
                        <Input disabled={isReadOnly} type="number" className="w-24 sm:w-32 text-right" value={labour.amount} onChange={e => {
                          const arr = [...labourItems]; arr[idx].amount = e.target.value; setLabourItems(arr);
                        }} placeholder="₹" />
                        {!isReadOnly && <Button variant="ghost" size="icon" onClick={() => setLabourItems(labourItems.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4 text-red-500" /></Button>}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Other Charges */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">{t("billEditor.otherCharges")}</h3>
                    {!isReadOnly && (
                      <Button size="sm" variant="outline" onClick={() => setOtherCharges([...otherCharges, { description: t("billEditor.otherCharges"), amount: 0 }])}>
                        <Plus className="h-3 w-3 mr-1" /> {t("billEditor.add")}
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {otherCharges.map((charge, idx) => (
                      <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                        <Input disabled={isReadOnly} value={charge.description} className="flex-1 min-w-[120px]" onChange={e => {
                          const arr = [...otherCharges]; arr[idx].description = e.target.value; setOtherCharges(arr);
                        }} placeholder={t("billEditor.description")} />
                        <Input disabled={isReadOnly} type="number" className="w-24 sm:w-32 text-right" value={charge.amount} onChange={e => {
                          const arr = [...otherCharges]; arr[idx].amount = e.target.value; setOtherCharges(arr);
                        }} placeholder="₹" />
                        {!isReadOnly && <Button variant="ghost" size="icon" onClick={() => setOtherCharges(otherCharges.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4 text-red-500" /></Button>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Summary & Actions */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-b from-slate-50 to-white border-slate-200/60 shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-xl font-bold border-b pb-2">{t("billEditor.invoiceSummary")}</h3>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("billEditor.materials")}</span>
                <span>₹{computed.materialSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("billEditor.labour")}</span>
                <span>₹{computed.labourTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-b pb-2">
                <span className="text-gray-600">{t("billEditor.other")}</span>
                <span>₹{computed.otherTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2">
                <span>{t("billEditor.subtotal")}</span>
                <span>₹{computed.subtotal.toFixed(2)}</span>
              </div>

              {/* Discount */}
              <div className="pt-4 space-y-2">
                <Label>{t("billEditor.discount")}</Label>
                <div className="flex gap-2">
                  <Select disabled={isReadOnly} value={discountType} onValueChange={setDiscountType}>
                    <SelectTrigger className="w-[110px] bg-white"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIXED">{t("billEditor.fixed")}</SelectItem>
                      <SelectItem value="PERCENTAGE">{t("billEditor.percent")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input disabled={isReadOnly} type="number" className="bg-white text-right" value={discountValue} onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)} />
                </div>
                {computed.discountAmount > 0 && (
                  <div className="text-right text-sm text-green-600 font-medium">- ₹{computed.discountAmount.toFixed(2)}</div>
                )}
              </div>

              {/* Tax */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <input disabled={isReadOnly} type="checkbox" id="tax" className="h-4 w-4 rounded" checked={taxEnabled} onChange={e => setTaxEnabled(e.target.checked)} />
                  <Label htmlFor="tax">{t("billEditor.applyTax")}</Label>
                </div>
                {taxEnabled && (
                  <div className="flex gap-2 items-center justify-end">
                    <span className="text-sm">{t("billEditor.rate")}</span>
                    <Input disabled={isReadOnly} type="number" className="w-20 bg-white text-right" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} />
                  </div>
                )}
                {taxEnabled && computed.taxAmount > 0 && (
                  <div className="text-right text-sm text-gray-600">+ ₹{computed.taxAmount.toFixed(2)}</div>
                )}
              </div>

              {/* Grand Total */}
              <div className="bg-gradient-to-br from-brand-blue to-[#0e1d40] text-white p-5 rounded-2xl flex justify-between items-center shadow-lg shadow-brand-blue/10 mt-6 relative overflow-hidden ring-1 ring-white/10 inset-ring inset-ring-white/10">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-orange/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
                <span className="text-lg font-medium text-blue-50 z-10">{t("billEditor.total")}</span>
                <span className="text-3xl font-bold tracking-tight z-10">₹{computed.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status (Only relevant if finalized or managing it) */}
          {status === "FINALIZED" && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold text-gray-800">{t("billEditor.paymentDetails")}</h3>
                <div className="flex justify-between items-center text-sm">
                  <span>{t("billEditor.status")}</span>
                  <span className={`font-bold ${computed.balanceDue === 0 ? "text-green-600" : "text-yellow-600"}`}>
                    {computed.balanceDue === 0 ? t("billEditor.paid") : t("billEditor.pending")}
                  </span>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <Label>{t("billEditor.amountPaid")}</Label>
                  <div className="flex gap-2">
                    <Input type="number" value={amountPaid} onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)} />
                    <Button variant="secondary" onClick={() => updatePaymentStatus(billId, amountPaid)}>{t("billEditor.update")}</Button>
                  </div>
                </div>
                <div className="flex justify-between font-bold pt-2 text-lg text-red-600">
                  <span>{t("billEditor.balanceDue")}</span>
                  <span>₹{computed.balanceDue.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 sticky top-6">
            {status === "DRAFT" && (
              <>
                <Button 
                  className="w-full h-14 bg-white text-brand-blue border-2 border-brand-blue/10 hover:border-brand-blue/30 hover:bg-brand-blue/5 rounded-2xl font-semibold text-lg shadow-sm transition-all flex items-center justify-center gap-2" 
                  onClick={handleSaveDraft}
                >
                  <Save className="h-5 w-5" /> {t("billEditor.saveDraft")}
                </Button>
                <Button 
                  className="w-full h-14 bg-gradient-to-b from-brand-orange to-[#e08218] hover:from-[#f59f33] hover:to-[#cf7613] text-white rounded-2xl font-bold text-lg shadow-[0_4px_14px_0_rgba(244,144,30,0.39)] hover:shadow-[0_6px_20px_rgba(244,144,30,0.23)] border border-[#d67b14] transition-all flex items-center justify-center gap-2" 
                  onClick={handleFinalize}
                >
                  <CheckCircle className="h-5 w-5 text-white/90" /> {t("billEditor.finalizeBill")}
                </Button>
              </>
            )}

            {(status === "FINALIZED" || billId) && (
              <Button className="w-full justify-start text-lg h-12 border-brand-blue text-brand-blue hover:bg-gray-100" variant="outline" onClick={() => handlePrint()}>
                <Printer className="mr-2 h-5 w-5" /> {t("billEditor.printPdf")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Print Area */}
      <div className="hidden">
        <InvoicePrint 
          ref={printRef} 
          bill={{
            ...initialBill,
            customerName, customerPhone, customerAddress, date,
            items: computed.items, labourItems, otherCharges,
            subtotal: computed.subtotal, discountAmount: computed.discountAmount, discountType, discountValue,
            taxEnabled, taxAmount: computed.taxAmount, taxRate,
            grandTotal: computed.grandTotal, amountPaid, balanceDue: computed.balanceDue, notes, status
          }} 
          settings={settings} 
        />
      </div>
    </>
  );
}

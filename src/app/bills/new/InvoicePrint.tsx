import React, { forwardRef } from "react";

export const InvoicePrint = forwardRef<HTMLDivElement, any>(({ bill, settings }, ref) => {
  return (
    <div ref={ref} className="p-10 bg-white text-black min-h-[297mm] w-[210mm] mx-auto box-border" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{settings?.businessName || "PETER ELECTRICIANS"}</h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">Electrical Works & Materials</p>
          <div className="mt-4 text-sm text-gray-600">
            <p>{settings?.address}</p>
            <p>Phone: {settings?.phone}</p>
            {settings?.gstNumber && <p>GST: {settings.gstNumber}</p>}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">TAX INVOICE</h2>
          <p className="text-sm"><strong>Invoice No:</strong> {bill.invoiceNumber || "DRAFT"}</p>
          <p className="text-sm"><strong>Date:</strong> {new Date(bill.date).toLocaleDateString("en-IN")}</p>
          {bill.status === "DRAFT" && (
            <p className="text-red-500 font-bold mt-2 border border-red-500 inline-block px-2 py-1">DRAFT</p>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-8 flex justify-between">
        <div className="w-1/2">
          <p className="text-sm text-gray-500 font-bold mb-1">BILL TO:</p>
          <p className="font-bold text-gray-900 text-lg">{bill.customerName}</p>
          <p className="text-sm text-gray-700">{bill.customerPhone}</p>
          <p className="text-sm text-gray-700 whitespace-pre-line">{bill.customerAddress}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left mb-6 border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-800 text-sm border-b-2 border-gray-800">
            <th className="p-2 w-12 font-bold text-center">#</th>
            <th className="p-2 font-bold">Description</th>
            <th className="p-2 w-20 font-bold text-center">Qty</th>
            <th className="p-2 w-20 font-bold text-center">Unit</th>
            <th className="p-2 w-24 font-bold text-right">Rate</th>
            <th className="p-2 w-32 font-bold text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {bill.items.map((item: any, idx: number) => (
            <tr key={idx} className="border-b border-gray-200">
              <td className="p-2 text-center text-gray-600">{idx + 1}</td>
              <td className="p-2 text-gray-900">{item.name}</td>
              <td className="p-2 text-center text-gray-900">{item.quantity}</td>
              <td className="p-2 text-center text-gray-600">{item.unit}</td>
              <td className="p-2 text-right text-gray-900">₹{parseFloat(item.rate).toFixed(2)}</td>
              <td className="p-2 text-right text-gray-900 font-medium">₹{parseFloat(item.amount).toFixed(2)}</td>
            </tr>
          ))}
          {bill.items.length === 0 && (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-400 italic">No materials added</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Labour & Other Charges Tables if any */}
      {bill.labourItems && bill.labourItems.length > 0 && (
        <div className="mb-6">
          <p className="font-bold text-sm text-gray-800 mb-2">Labour Charges</p>
          <table className="w-full text-left text-sm border-collapse">
            <tbody>
              {bill.labourItems.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="p-2 text-gray-900">{item.description || "Labour"}</td>
                  <td className="p-2 text-right text-gray-900 font-medium w-32">₹{parseFloat(item.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {bill.otherCharges && bill.otherCharges.length > 0 && (
        <div className="mb-6">
          <p className="font-bold text-sm text-gray-800 mb-2">Other Charges</p>
          <table className="w-full text-left text-sm border-collapse">
            <tbody>
              {bill.otherCharges.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="p-2 text-gray-900">{item.description || "Charge"}</td>
                  <td className="p-2 text-right text-gray-900 font-medium w-32">₹{parseFloat(item.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals Section */}
      <div className="flex justify-end mb-12">
        <div className="w-72">
          <div className="flex justify-between p-2 text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900 font-medium">₹{parseFloat(bill.subtotal).toFixed(2)}</span>
          </div>
          
          {parseFloat(bill.discountAmount) > 0 && (
            <div className="flex justify-between p-2 text-sm text-green-700">
              <span>Discount ({bill.discountType === 'PERCENTAGE' ? `${bill.discountValue}%` : 'Fixed'}):</span>
              <span>- ₹{parseFloat(bill.discountAmount).toFixed(2)}</span>
            </div>
          )}
          
          {bill.taxEnabled && parseFloat(bill.taxAmount) > 0 && (
            <div className="flex justify-between p-2 text-sm">
              <span className="text-gray-600">Tax ({bill.taxRate}%):</span>
              <span className="text-gray-900 font-medium">+ ₹{parseFloat(bill.taxAmount).toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between p-3 mt-2 bg-gray-100 text-lg font-bold text-gray-900 border-t-2 border-gray-800 rounded-sm">
            <span>GRAND TOTAL:</span>
            <span>₹{parseFloat(bill.grandTotal).toFixed(2)}</span>
          </div>

          {(bill.status === "FINALIZED" || parseFloat(bill.amountPaid) > 0) && (
            <>
              <div className="flex justify-between p-2 mt-2 text-sm border-t border-dashed">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="text-gray-900">₹{parseFloat(bill.amountPaid).toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-2 text-sm font-bold">
                <span className="text-gray-800">Balance Due:</span>
                <span className={bill.balanceDue > 0 ? "text-red-600" : "text-green-600"}>
                  ₹{parseFloat(bill.balanceDue).toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Notes */}
      <div className="border-t pt-4 text-sm text-gray-500 flex justify-between">
        <div>
          <p className="font-bold text-gray-700 mb-1">Notes / Terms:</p>
          <p className="whitespace-pre-line">{bill.notes || settings?.notes || "Thank you for your business!"}</p>
        </div>
        <div className="text-center w-48 pt-8">
          <div className="border-b border-gray-400 w-full mb-1"></div>
          <p className="text-xs">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
});

InvoicePrint.displayName = "InvoicePrint";

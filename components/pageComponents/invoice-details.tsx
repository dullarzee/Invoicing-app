"use client"

import { ArrowLeft, Download, Send, Edit2, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface InvoiceDetailsProps {
  onBack: () => void
}

export default function InvoiceDetails({ onBack }: InvoiceDetailsProps) {
  const invoice = {
    id: "INV-001",
    client: "Acme Corp",
    clientEmail: "billing@acmecorp.com",
    amount: "$2,500",
    date: "Oct 20, 2025",
    dueDate: "Oct 25, 2025",
    status: "Paid",
    items: [
      { description: "Web Development Services", quantity: 40, rate: 50, amount: 2000 },
      { description: "UI/UX Design", quantity: 10, rate: 50, amount: 500 },
    ],
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{invoice.id}</h1>
            <p className="text-muted-foreground mt-1">Invoice details and information</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-slate-200 hover:bg-slate-300 text-foreground flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Preview */}
          <Card className="p-8 border border-slate-200 bg-white">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">INVOICE</h2>
                  <p className="text-muted-foreground mt-1">{invoice.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Invoice Date</p>
                  <p className="font-semibold text-foreground">{invoice.date}</p>
                  <p className="text-sm text-muted-foreground mt-2">Due Date</p>
                  <p className="font-semibold text-foreground">{invoice.dueDate}</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Bill To</p>
                  <p className="font-semibold text-foreground">{invoice.client}</p>
                  <p className="text-sm text-muted-foreground">{invoice.clientEmail}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">From</p>
                  <p className="font-semibold text-foreground">Your Company</p>
                  <p className="text-sm text-muted-foreground">company@example.com</p>
                </div>
              </div>

              {/* Line Items */}
              <div className="border-t border-slate-200 pt-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-sm font-semibold text-foreground pb-3">Description</th>
                      <th className="text-right text-sm font-semibold text-foreground pb-3">Qty</th>
                      <th className="text-right text-sm font-semibold text-foreground pb-3">Rate</th>
                      <th className="text-right text-sm font-semibold text-foreground pb-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="border-b border-slate-200">
                        <td className="py-3 text-sm text-foreground">{item.description}</td>
                        <td className="text-right text-sm text-foreground">{item.quantity}</td>
                        <td className="text-right text-sm text-foreground">${item.rate}</td>
                        <td className="text-right text-sm font-semibold text-foreground">${item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">$2,500</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="text-foreground">$250</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-lg text-blue-500">$2,750</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="p-6 border border-slate-200">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Status</h3>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-lg font-bold text-foreground">{invoice.status}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Paid on Oct 22, 2025</p>
          </Card>

          {/* Amount Card */}
          <Card className="p-6 border border-slate-200">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Amount</h3>
            <p className="text-3xl font-bold text-foreground">{invoice.amount}</p>
            <p className="text-xs text-muted-foreground mt-2">Total amount due</p>
          </Card>

          {/* Actions */}
          <Card className="p-6 border border-slate-200">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Actions</h3>
            <div className="space-y-2">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Invoice
              </Button>
              <Button className="w-full bg-slate-200 hover:bg-slate-300 text-foreground flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Invoice
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

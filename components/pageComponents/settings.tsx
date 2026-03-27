"use client"

import { Save, Building2, FileText, CreditCard } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function Settings() {
  const [activeTab, setActiveTab] = useState("company")

  const tabs = [
    { id: "company", label: "Company Info", icon: Building2 },
    { id: "invoice", label: "Invoice Settings", icon: FileText },
    { id: "payment", label: "Payment Terms", icon: CreditCard },
  ]

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and invoice settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Company Info Tab */}
      {activeTab === "company" && (
        <Card className="p-6 border border-slate-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Company Name</label>
              <input
                type="text"
                defaultValue="Your Company"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                defaultValue="company@example.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
              <input
                type="tel"
                defaultValue="+1 (555) 000-0000"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Website</label>
              <input
                type="url"
                defaultValue="https://example.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Address</label>
            <textarea
              defaultValue="123 Business Street, Suite 100, City, State 12345"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </Card>
      )}

      {/* Invoice Settings Tab */}
      {activeTab === "invoice" && (
        <Card className="p-6 border border-slate-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Invoice Prefix</label>
              <input
                type="text"
                defaultValue="INV"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Next Invoice Number</label>
              <input
                type="number"
                defaultValue="002"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tax Rate (%)</label>
              <input
                type="number"
                defaultValue="10"
                step="0.1"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Currency</label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Invoice Footer</label>
            <textarea
              defaultValue="Thank you for your business!"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </Card>
      )}

      {/* Payment Terms Tab */}
      {activeTab === "payment" && (
        <Card className="p-6 border border-slate-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Default Payment Terms (Days)</label>
              <input
                type="number"
                defaultValue="30"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Late Payment Fee (%)</label>
              <input
                type="number"
                defaultValue="5"
                step="0.1"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Payment Instructions</label>
            <textarea
              defaultValue="Please make payment to: Bank Account: 1234567890"
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </Card>
      )}
    </div>
  )
}

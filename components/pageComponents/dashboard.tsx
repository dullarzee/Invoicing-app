"use client";

import { TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";
import { endpoints } from "@/constants/BEendpoints";
import { ClientFullResponseType, InvoiceWithLineItemsType } from "@/constants/types";

export default function Dashboard() {
  const [invoices, setInvoices] = useState<InvoiceWithLineItemsType[]>();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        await axios
          .get(`${endpoints.getInvoices}`)
          .then(({ data }: { data: InvoiceWithLineItemsType[] }) => {
            setInvoices(data);
          });
      } catch (error) {
        console.log("couldnt fetch clients: ", error);
      }
    };

    fetchClients();
  });
  const stats = [
    {
      label: "Total Invoiced",
      value: "$24,580",
      change: "+12.5%",
      icon: TrendingUp,
      color: "bg-blue-500",
    },
    {
      label: "Pending Payments",
      value: "$8,420",
      change: "3 invoices",
      icon: Clock,
      color: "bg-amber-500",
    },
    {
      label: "Paid This Month",
      value: "$16,160",
      change: "+8.2%",
      icon: CheckCircle,
      color: "bg-green-500",
    },
  ];

  const recentInvoices = [
    {
      id: "INV-001",
      client: "Acme Corp",
      amount: "$2,500",
      date: "Oct 20, 2025",
      status: "Paid",
    },
    {
      id: "INV-002",
      client: "Tech Solutions",
      amount: "$1,800",
      date: "Oct 18, 2025",
      status: "Pending",
    },
    {
      id: "INV-003",
      client: "Global Industries",
      amount: "$3,200",
      date: "Oct 15, 2025",
      status: "Paid",
    },
    {
      id: "INV-004",
      client: "StartUp Labs",
      amount: "$950",
      date: "Oct 12, 2025",
      status: "Overdue",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's your invoicing overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 border border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Invoices */}
      <Card className="border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-foreground">Recent Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Invoice ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {invoice.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {invoice.client}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    {invoice.amount}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {invoice.date}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        invoice.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : invoice.status === "Pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

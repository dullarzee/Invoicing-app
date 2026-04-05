"use client";

import { TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { use, useEffect, useState } from "react";
import axios from "axios";
import { endpoints } from "@/constants/BEendpoints";
import {
  ClientFullResponseType,
  InvoiceWithLineItemsType,
} from "@/constants/types";
import { calculateActiveTickIndex } from "recharts/types/util/ChartUtils";
import { Spinner } from "../ui/spinner";
import { separateThousands } from "@/lib/utils";

export default function Dashboard() {
  const [invoices, setInvoices] =
    useState<(InvoiceWithLineItemsType & { amount?: number })[]>();
  const [data, setData] = useState<InvoiceWithLineItemsType[]>([]);
  const [stats, setStats] = useState({
    totalInvoiced: 0,
    pendingPayments: 0,
    paidThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        await axios
          .get(`${endpoints.getInvoices}`)
          .then(({ data }: { data: InvoiceWithLineItemsType[] }) => {
            setData(data);
            setLoading(false);
          });
      } catch (error) {
        console.log("couldnt fetch clients: ", error);
        setLoading(false);
      }
    };
    const array: (InvoiceWithLineItemsType & { amount: number })[] = [];
    data?.map((invoice) => {
      let totalAmount = 0;
      invoice?.lineItems?.map((item) => {
        totalAmount += item.price * item.quantity;
      });
      array.push({ ...invoice, amount: totalAmount });
    });
    setInvoices(array);

    fetchClients();
  }, [invoices?.length, data?.length]);

  useEffect(() => {
    let totalInvoiced = 0;
    let pendingPayments = 0;
    let paidThisMonth = 0;

    invoices?.forEach((invoice) => {
      //for calculating total invoiced
      invoice?.amount && (totalInvoiced += invoice.amount);

      //for calculating pending invoices
      if (invoice.status === "PENDING") {
        pendingPayments += invoice.amount || 0;
      }

      //for calculating paid this month, we check if invoice is marked as PAID and if the createdAt date is within the current month
      const createdAt = new Date(invoice.createdAt);
      const now = new Date();
      if (
        invoice.status === "PAID" &&
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getFullYear() === now.getFullYear()
      ) {
        paidThisMonth += invoice.amount || 0;
      }
    });

    setStats({
      totalInvoiced,
      pendingPayments,
      paidThisMonth,
    });
  }, [invoices?.length]);

  console.log("invoices: ", invoices);

  const statsTemplateData = [
    {
      label: "Total Invoiced",
      value: stats.totalInvoiced,
      change: `${invoices?.length || 0} invoices`,
      icon: TrendingUp,
      color: "bg-blue-500",
    },
    {
      label: "Pending Payments",
      value: stats.pendingPayments,
      change: `${invoices?.filter((invoice) => invoice.status === "PENDING").length || 0} invoices`,
      icon: Clock,
      color: "bg-amber-500",
    },
    {
      label: "Paid This Month",
      value: stats.paidThisMonth,
      change: `${
        invoices?.filter((invoice) => {
          const createdAt = new Date(invoice.createdAt);
          const now = new Date();
          return (
            invoice.status === "PAID" &&
            createdAt.getMonth() === now.getMonth() &&
            createdAt.getFullYear() === now.getFullYear()
          );
        }).length || 0
      } invoices`,
      icon: CheckCircle,
      color: "bg-green-500",
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
        {statsTemplateData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 border border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    &#8358;{separateThousands(stat.value)}
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

      {loading ? (
        <div className=" flex flex-col items-center justify-center h-[300px]">
          <Spinner className="mx-auto h-12 w-12" />
          <p className="text-center text-muted-foreground">
            Loading recent invoices...
          </p>
        </div>
      ) : (
        <Card className="border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-foreground">
              Recent Invoices
            </h2>
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
                {invoices?.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {invoice?.client?.companyName}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      {invoice.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(invoice.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          invoice.status === "PAID"
                            ? "bg-green-100 text-green-700"
                            : invoice.status === "PENDING"
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
      )}
    </div>
  );
}

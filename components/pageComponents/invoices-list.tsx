"use client";

import { Search, Filter, Eye, Edit2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { RoutesEnum } from "@/constants/routeEnums";
import axios from "axios";
import { type clientsType, type lineItemsTypes } from "./create-invoice";
import { endpoints } from "@/constants/BEendpoints";
import useDisclosure from "@/lib/disclosure";
import { Modal } from "../modal";

interface ResponseInvoiceType {
  id: string;
  createdAt: string;
  dueDate: string;
  status: "PAID" | "PENDING" | "OVERDUE";
  client: clientsType;
  lineItems: lineItemsTypes[];
}

interface InvoiceType {
  invoiceId: string;
  createdAt: string;
  dueDate: string;
  status: "PAID" | "PENDING" | "OVERDUE";
  amount: number;
  clientName: string;
}

export default function InvoicesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const invoiceIdToDelete = useRef<string | null>(null);
  const modalClosure = useDisclosure();

  const router = useRouter();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const invoices = await axios.get(endpoints.getInvoices);

        setInvoices(transformInvoiceData(invoices.data));
      } catch (error) {
        console.log("fetching invoice unsuccessful");
      }
    };
    fetchInvoices();
  }, [invoices.length]);

  const transformInvoiceData = (invoices: ResponseInvoiceType[]) => {
    const array: InvoiceType[] = [];
    invoices.map((it) => {
      const {
        createdAt,
        dueDate,
        status,
        client,
        lineItems,
        id: invoiceId,
      } = it;
      const { companyName: clientName } = client;
      let amount = 0;
      lineItems.map((item) => {
        const { quantity, price } = item;
        amount += quantity * price;
      });
      array.push({
        createdAt: new Date(createdAt).toDateString(),
        dueDate: new Date(dueDate).toDateString(),
        status,
        clientName,
        amount,
        invoiceId,
      });
    });
    return array;
  };
  const handleDelete = async (id: string) => {
    try {
      await axios
        .delete(`${endpoints.deleteInvoice}/${id}`)
        .then(async (res) => {
          if (res.data.ok) {
            const invoices = await axios.get(endpoints.getInvoices);
            setInvoices(transformInvoiceData(invoices.data));
          }
        });
    } catch (error) {
      console.log("Failed to delete invoice: ", error);
    }
    modalClosure.setOpen(false);
  };
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || invoice.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your invoices
          </p>
        </div>
        <Button
          onClick={() => router.push(RoutesEnum.NEW_INVOICE)}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by invoice ID or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card className="border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Invoice ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Due Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.invoiceId}
                  className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {invoice.invoiceId}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {invoice.clientName}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    &#8358;{invoice.amount}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {invoice.createdAt}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {invoice.dueDate}
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
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                        onClick={() => {
                          invoiceIdToDelete.current = invoice.invoiceId;
                          modalClosure.setOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalClosure.open}
        setOpen={modalClosure.setOpen}
        heading="Delete Invoice"
      >
        <div className="flex flex-col gap-3">
          <p className="text-[1.2rem] my-4 ">
            Are you sure you want to delete this invoice?
          </p>
          <button
            onClick={() => handleDelete(invoiceIdToDelete.current as string)}
            className="py-3 text-[1.15rem] text-white bg-red-600 w-full rounded-lg"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

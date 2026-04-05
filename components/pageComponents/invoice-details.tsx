"use client";

import {
  ArrowLeft,
  Download,
  Send,
  Edit2,
  Trash2,
  Copy,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { endpoints } from "@/constants/BEendpoints";
import { type InvoiceFullResponseType } from "@/constants/types";
import { RoutesEnum } from "@/constants/routeEnums";
import Link from "next/link";
import { Modal } from "../modal";
import useDisclosure from "@/lib/disclosure";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import BackButton from "../ui/backButton";
import { separateThousands } from "@/lib/utils";

export default function InvoiceDetails() {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [invoiceDetails, setInvoiceDetails] =
    useState<InvoiceFullResponseType | null>(null);
  const params = useParams<{ invoiceId: string }>();
  const modalClosure = useDisclosure();
  const invoiceIdToDelete = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getInvoice = async () => {
      try {
        await axios
          .get(`${endpoints.getInvoiceById}/${params.invoiceId}`)
          .then((res) => {
            console.log("invoice details: ", res?.data?.data);
            setInvoiceDetails(res?.data?.data);
          });
      } catch (error) {
        console.log("error: ", error);
      }
    };
    getInvoice();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios
        .delete(`${endpoints.deleteInvoice}/${id}`)
        .then(async (res) => {
          if (res.data.ok) {
            const invoices = await axios.get(endpoints.getInvoices);
            toast.success("Invoice deleted successfully");
            router.back();
          }
        });
    } catch (error) {
      toast.error("Failed to delete invoice");
    }
    modalClosure.setOpen(false);
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await axios.get(
        `${endpoints.downloadInvoicePDF}/${params.invoiceId}`,
        {
          responseType: "blob",
        },
      );
      //
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${invoiceDetails?.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");

      console.log("pdf download response: ", res);
    } catch (error) {
      toast.error("Failed to download PDF");
      console.log("error downloading pdf: ", error);
    }
  };

  const getStatusIcon = () => {
    switch (invoiceDetails?.status) {
      case "PAID":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "PENDING":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "OVERDUE":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (invoiceDetails?.status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-amber-100 text-amber-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const copyPageLink = async () => {
    try {
      const url = `${window.location.origin}${RoutesEnum.INVOICE_DETAIL}/${params.invoiceId}`;
      await navigator.clipboard.writeText(url);
      toast.success("Invoice link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const shortenedInvoiceId = invoiceDetails?.id
    ? `INV-${invoiceDetails.id.slice(0, 8)}`
    : "Invoice ID";

  const getFormattedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalAmount = invoiceDetails?.lineItems?.reduce((total, item) => {
    return total + item.quantity * item.price;
  }, 0) as number;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex md:items-center gap-4 /border border-red-500 w-[120%] md:w-auto">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {shortenedInvoiceId}
            </h1>
            <p className="text-muted-foreground mt-1">
              Invoice details and information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDownloadPDF}
            className="bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-foreground flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Invoice
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
                  <h2 className="text-2xl font-bold text-foreground">
                    INVOICE
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {shortenedInvoiceId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Invoice Date</p>
                  <p className="font-semibold text-foreground">
                    {invoiceDetails
                      ? getFormattedDate(invoiceDetails?.createdAt || "")
                      : "null"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Due Date</p>
                  <p className="font-semibold text-foreground">
                    {invoiceDetails
                      ? getFormattedDate(invoiceDetails?.dueDate || "")
                      : "null"}
                  </p>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-8">
                <div className="overflow-x-auto">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Bill To
                  </p>
                  <p className="font-semibold text-foreground line-clamp-1">
                    {invoiceDetails?.client?.companyName || "Client Name"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {invoiceDetails?.client?.email || "Client Email"}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    From
                  </p>
                  <p className="font-semibold text-foreground">
                    G-R Tech Services
                  </p>
                  <p className="text-sm text-muted-foreground">
                    company@example.com
                  </p>
                </div>
              </div>

              {/* Line Items */}
              <div className="border-t border-slate-200 pt-6 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-center text-sm font-semibold text-foreground px-6 pb-3">
                        Description
                      </th>
                      <th className="text-center text-sm font-semibold text-foreground px-6 pb-3">
                        Qty
                      </th>
                      <th className="text-center text-sm font-semibold text-foreground px-6  pb-3">
                        price
                      </th>
                      <th className="text-center text-sm font-semibold text-foreground px-6  pb-3">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceDetails?.lineItems?.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-200 text-center"
                      >
                        <td className="py-3 text-sm text-foreground line-clamp-1 text-center">
                          {item?.itemName}
                        </td>
                        <td className="text-sm text-foreground text-center">
                          {item.quantity}
                        </td>
                        <td className="text-sm text-foreground text-center">
                          &#8358;{separateThousands(item.price)}
                        </td>
                        <td className="text-sm font-semibold text-foreground text-center">
                          &#8358;{separateThousands(item.quantity * item.price)}
                        </td>
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
                    <span className="text-foreground">
                      &#8358;{separateThousands(totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tax (
                      {!invoiceDetails?.taxInPercent
                        ? 0
                        : invoiceDetails.taxInPercent}
                      %)
                    </span>
                    <span className="text-foreground">
                      &#8358;
                      {separateThousands(
                        invoiceDetails?.taxInPercent
                          ? (totalAmount * invoiceDetails.taxInPercent) / 100
                          : 0,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-lg text-blue-500">
                      &#8358;
                      {separateThousands(
                        totalAmount +
                          (invoiceDetails?.taxInPercent
                            ? (totalAmount * invoiceDetails.taxInPercent) / 100
                            : 0),
                      )}
                    </span>
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
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
              Status
            </h3>
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon()}
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor()}`}
              >
                {invoiceDetails?.status || "Status Unknown"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {invoiceDetails?.status === "PAID"
                ? `Paid on ${getFormattedDate(invoiceDetails?.updateAt)}`
                : `Payment is ${invoiceDetails?.status?.toLowerCase() || "pending"}. Please follow up with the client.`}
            </p>
          </Card>

          {/* Amount Card */}
          <Card className="p-6 border border-slate-200">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
              Amount
            </h3>
            <p className="text-3xl font-bold text-foreground">
              &#8358;
              {separateThousands(
                totalAmount +
                  (invoiceDetails?.taxInPercent
                    ? (totalAmount * invoiceDetails.taxInPercent) / 100
                    : 0),
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Total amount due
            </p>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 border border-slate-200">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                onClick={handleDownloadPDF}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button className="w-full bg-slate-200 hover:bg-slate-300 text-foreground flex items-center justify-center gap-2">
                <Copy className="w-4 h-4" />
                Duplicate
              </Button>
              <div className="relative">
                <Button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="w-full bg-slate-200 hover:bg-slate-300 text-foreground flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                {showShareMenu && (
                  <div
                    onClick={() => setShowShareMenu(false)}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-10"
                  >
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 rounded">
                      Email to client
                    </button>
                    <button
                      onClick={copyPageLink}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 rounded"
                    >
                      Copy invoice link
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 rounded">
                      Share via WhatsApp
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Management Actions */}
          <Card className="p-6 border border-slate-200">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
              Management
            </h3>
            <div className="space-y-2">
              <Link href={`${RoutesEnum.EDIT_INVOICE}/${params.invoiceId}`}>
                <Button className="w-full bg-slate-100 hover:bg-slate-200 text-foreground flex items-center justify-center gap-2 mb-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Invoice
                </Button>
              </Link>
              <Button
                onClick={() => {
                  modalClosure.setOpen(true);
                  invoiceIdToDelete.current = params.invoiceId;
                }}
                className="w-full bg-red-100 hover:bg-red-200 text-red-700 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Invoice
              </Button>
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
                onClick={() =>
                  handleDelete(invoiceIdToDelete.current as string)
                }
                className="py-3 text-[1.15rem] text-white bg-red-600 w-full rounded-lg"
              >
                Delete
              </button>
            </div>
          </Modal>

          {/* Timeline */}
          {/*<Card className="p-6 border border-slate-200">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
              Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="w-px h-8 bg-slate-200"></div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Invoice Created
                  </p>
                  <p className="text-xs text-muted-foreground">Oct 20, 2025</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="w-px h-8 bg-slate-200"></div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Sent to Client
                  </p>
                  <p className="text-xs text-muted-foreground">Oct 21, 2025</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Payment Received
                  </p>
                  <p className="text-xs text-muted-foreground">Oct 22, 2025</p>
                </div>
              </div>
            </div>
          </Card>*/}
        </div>
      </div>
    </div>
  );
}

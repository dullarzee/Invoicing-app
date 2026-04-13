"use client";

import {
  Mail,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  Eye,
  Download,
  Eye as ViewIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BackButton from "../ui/backButton";
import axios from "axios";
import { endpoints } from "@/constants/BEendpoints";
import type { ClientFullResponseTypeSingle } from "@/constants/types";
import { RoutesEnum } from "@/constants/routeEnums";
import {
  InvoiceFullResponseType,
  InvoiceWithLineItemsType,
} from "@/constants/types";
import useDisclosure from "@/lib/disclosure";
import { Modal } from "../modal";
import { toast } from "sonner";
import {
  getFormattedDate,
  handleDownloadPDF,
  separateThousands,
} from "@/lib/utils";

export default function ClientDetails() {
  const { clientId } = useParams<{ clientId: string }>();
  const router = useRouter();
  const [client, setClient] = useState<ClientFullResponseTypeSingle>();
  const [clientEditState, setClientEditState] = useState(client);
  const [invoices, setInvoices] =
    useState<(InvoiceWithLineItemsType & { amount: number })[]>();
  const [stats, setStats] = useState({
    totalInvoiced: 0,
    pendingPayments: 0,
    paid: 0,
  });
  const [loading, setLoading] = useState(true);
  const editClientModal = useDisclosure();
  const deleteClientModal = useDisclosure();

  useEffect(() => {
    const getClient = async () => {
      try {
        await axios
          .get(`${endpoints.getClients}/${clientId}/?includeInvoices=true`)
          .then((res) => {
            console.log("invoice details: ", res?.data?.data);
            setClient(res?.data?.data);
            setClientEditState(res?.data?.data);
          });
      } catch (error) {
        console.log("error: ", error);
      }
    };
    const array: (InvoiceWithLineItemsType & { amount: number })[] = [];
    client?.invoices?.map((invoice) => {
      let totalAmount = 0;
      invoice?.lineItems?.map((item) => {
        totalAmount += item.price * item.quantity;
      });
      array.push({ ...invoice, amount: totalAmount });
      setInvoices(array);
    });
    getClient();
  }, [client]);

  useEffect(() => {
    let totalInvoiced = 0;
    let pendingPayments = 0;
    let paid = 0;

    invoices?.forEach(
      (invoice) => {
        //for calculating total invoiced

        const taxInPercent = invoice.taxInPercent;
        const tax = invoice.amount * (taxInPercent / 100);
        console.log("tax In percent: ", taxInPercent, "tax:", tax);

        invoice?.amount &&
          (totalInvoiced += taxInPercent
            ? tax + invoice.amount
            : invoice.amount);

        //for calculating pending invoices
        if (invoice.status === "PENDING") {
          pendingPayments += taxInPercent
            ? tax + invoice.amount
            : invoice.amount;
        }

        //
        if (invoice.status === "PAID") {
          paid += invoice.amount || 0;
        }
      },
      [invoices.length],
    );

    setStats({
      totalInvoiced,
      pendingPayments,
      paid,
    });
  }, [client]);

  const handleClientEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // setClientEditState((prev) => ({
    //   ...prev,
    //   [name]: value ,
    // }));
  };

  const handleDelete = async (id: string) => {
    try {
      await axios
        .delete(`${endpoints.deleteClient}/${id}`)
        .then(async (res) => {
          if (res.data.ok) {
            toast.success("Client deleted successfully");
            router.back();
          }
        });
    } catch (error) {
      toast.error("Failed to delete client. Please try again.");
    }
  };

  const clientEditHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios

        .patch(`${endpoints.updateClient}/${clientId}`, clientEditState)
        .then(async ({ data }) => {
          const res = data.ok && (await axios.get(endpoints.getClients));
          setClient(res.data);
        });
      editClientModal.setOpen(false);
      setLoading(false);
      toast.success("Client updated successfully");
    } catch (error) {
      console.log("error updating client: ", error);
      editClientModal.setOpen(false);
      setLoading(false);
      toast.error("Failed to update client.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-amber-100 text-amber-700";
      case "Overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {client?.companyName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Client information and invoice history
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => editClientModal.setOpen(true)}
            className="bg-slate-200 hover:bg-slate-300 text-foreground flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Client
          </Button>
          <Button
            onClick={() => deleteClientModal.setOpen(true)}
            className="bg-red-100 hover:bg-red-200 text-red-700 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information Card */}
          <Card className="p-8 border border-slate-200">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Client Information
            </h2>
            <div className="space-y-6">
              {/* Contact Details */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
                  Contact Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${client?.email}`}
                        className="text-foreground hover:text-blue-500"
                      >
                        {client?.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${client?.phoneNumber}`}
                        className="text-foreground hover:text-blue-500"
                      >
                        {client?.phoneNumber}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-foreground">Nul</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200"></div>

              {/* Contact Person */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
                  Primary Contact
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="text-foreground font-medium">
                      {client?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Client Since
                    </p>
                    <p className="text-foreground font-medium">
                      {getFormattedDate(client?.dateAdded || "")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Invoices Section */}
          <Card className="p-8 border border-slate-200">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Invoice History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left text-sm font-semibold text-foreground pb-3">
                      Invoice ID
                    </th>
                    <th className="text-left text-sm font-semibold text-foreground pb-3">
                      Date
                    </th>
                    <th className="text-left text-sm font-semibold text-foreground pb-3">
                      Due Date
                    </th>
                    <th className="text-right text-sm font-semibold text-foreground pb-3 px-3">
                      Amount
                    </th>
                    <th className="text-left text-sm font-semibold text-foreground pb-3">
                      Status
                    </th>
                    <th className="text-left text-sm font-semibold text-foreground pb-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices?.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 text-sm font-medium text-foreground">
                        {invoice.id}
                      </td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {getFormattedDate(invoice.createdAt)}
                      </td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {getFormattedDate(invoice.dueDate)}
                      </td>
                      <td className="py-4 text-sm font-semibold text-foreground text-right px-2">
                        &#8358;
                        {separateThousands(
                          invoice.amount +
                            (invoice.taxInPercent
                              ? invoice.taxInPercent * invoice.amount
                              : 0) /
                              100,
                        )}
                      </td>
                      <td className="py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              router.push(
                                `${RoutesEnum.INVOICE_DETAIL}/${invoice.id}`,
                              )
                            }
                            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                            title="View"
                          >
                            <ViewIcon className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(invoice.id)}
                            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card className="p-6 border border-slate-200">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
              Financial Summary
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground">Total Invoiced</p>
                <p className="text-2xl font-bold text-foreground">
                  {separateThousands(stats.totalInvoiced)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-green-700">Total Paid</p>
                <p className="text-2xl font-bold text-green-700">
                  {separateThousands(stats.paid)}
                </p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-xs text-amber-700">Pending Amount</p>
                <p className="text-2xl font-bold text-amber-700">
                  {separateThousands(stats.pendingPayments)}
                </p>
              </div>
            </div>
          </Card>

          {/* Payment Statistics */}
          <Card className="p-6 border border-slate-200">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
              Payment Stats
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold text-foreground">
                  {invoices?.length}
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 border border-slate-200">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                Send Email
              </Button>
              {/*<Button className="w-full bg-slate-200 hover:bg-slate-300 text-foreground flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Details
              </Button>*/}
            </div>
          </Card>
        </div>
      </div>

      {/*modal for editing client details*/}
      <Modal
        //open={editClientModal.open}
        open={editClientModal.open}
        setOpen={editClientModal.setOpen}
        heading={
          <span>
            Edit{" "}
            <span className="text-blue-400 font-medium">
              {client?.companyName}
            </span>{" "}
            Details
          </span>
        }
        className="md:w-[400px]"
        hideCloseButton
      >
        <div className="my-5 flex flex-col gap-4">
          <form onSubmit={clientEditHandler}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Client Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={clientEditState?.name}
                  onChange={handleClientEditChange}
                  placeholder="Enter client name"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={clientEditState?.email}
                  onChange={handleClientEditChange}
                  placeholder="client@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone
                </label>
                <input
                  name="phoneNumber"
                  type="number"
                  value={clientEditState?.phoneNumber}
                  onChange={handleClientEditChange}
                  placeholder="+234 80 000-0000"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Company
                </label>
                <input
                  name="companyName"
                  value={clientEditState?.companyName}
                  onChange={handleClientEditChange}
                  type="text"
                  placeholder="Company name"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300">
                Update Client
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  editClientModal.setOpen(false);
                }}
                className="bg-slate-200 hover:bg-slate-300 text-foreground"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/*modal for confirming client deletion*/}
      <Modal
        open={deleteClientModal.open}
        setOpen={deleteClientModal.setOpen}
        heading="Delete Client?"
        className="md:w-[400px]"
      >
        <div className="my-5 flex flex-col gap-4">
          <p>
            Are you sure you want to delete{" "}
            <span className="font-bold text-red-400 line-clamp-1">
              {client?.companyName}?
            </span>
            This action cannot be undone.
          </p>
          <button
            onClick={() => handleDelete(client?.id as string)}
            className="py-3 text-[1.15rem] text-white bg-red-600 w-full rounded-lg"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { ArrowLeft, LineChart, Plus, Save, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import BackButton from "../ui/backButton";
import { useRouter } from "next/navigation";
import axios from "axios";
import { backend_domain } from "@/constants/URLs";
import { toast } from "sonner";
import { separateThousands, stripCommas } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

export const dynamic = "force-dynamic";

export interface lineItemsTypes {
  id: number;
  name: string;
  quantity: number;
  price: number;
  amount: number;
}
export interface clientsType {
  id: string;
  name: string;
  email: string;
  address: string;
  phoneNumber: string;
  companyName: string;
  dateAdded: string;
}
export interface invoiceType {
  id: string;
  createdAt: string;
  dueDate: string;
  status: "PAID" | "PENDING" | "OVERDUE";
}

export default function CreateInvoice() {
  const [clients, setclients] = useState<clientsType[]>([]);
  const [isFormInvalid, setIsFormInvalid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lineItems, setLineItems] = useState<lineItemsTypes[]>([
    { id: Date.now(), name: "", quantity: 0, price: 0, amount: 0 },
  ]);
  const [invoiceInfo, setInvoiceInfo] = useState({
    clientName: "",
    company: "",
    clientId: "",
    createdDate: "",
    dueDate: "",
    noteAttached: "",
    taxPercent: "",
    status: "PENDING",
  });
  const [errors, setErrors] = useState({
    invoiceInfo: "",
    lineItems: "",
  });
  const [cummulatives, setCummulatives] = useState({
    subTotal: 0,
    tax: 0,
    total: 0,
  });

  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    const dueDate = new Date(invoiceInfo.dueDate).toISOString();
    const clientId = invoiceInfo.clientId;
    const note = invoiceInfo.noteAttached;
    const taxInPercent = Number(invoiceInfo.taxPercent);
    const status = invoiceInfo.status;

    const data = {
      clientId,
      dueDate,
      note,
      lineItems,
      taxInPercent,
      status,
    };

    try {
      await axios.post(`${backend_domain}/api/invoices/create`, data);
      toast.success("Invoice created successfully");
      setLoading(false);
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to create invoice");
      setLoading(false);
    }
  };

  const validateLineItems = (): boolean => {
    let fail: boolean = false;
    //trying to break out of loop early if any compulsory field is empty
    lineItems.map((it) => {
      if (!it.name || !it.quantity || !it.price) {
        fail = true;
      }
    });
    return fail;
  };

  useEffect(() => {
    const validateForm = () => {
      if (
        !invoiceInfo.clientName ||
        !invoiceInfo.clientId ||
        !invoiceInfo.company
      ) {
        setIsFormInvalid(true); //true to disable submit button
        return;
      } else if (validateLineItems()) {
        setErrors((prev) => ({ ...prev, lineItems: "Fill in all fields" }));
        console.log("line items not completely filled");
        setIsFormInvalid(true);
        return;
      }
      setIsFormInvalid(false);
    };
    validateForm();
  }, [invoiceInfo, lineItems]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${backend_domain}/api/clients`);
        setclients((res.data as clientsType[]) || []);
        console.log("fetched clients successfully");
      } catch (error) {
        console.log("Error fetching clients:", error);
      }
    };
    fetch();
  }, []);

  console.log("Enviroment is: ", process.env.ENVIRONMENT);

  const handleChange = (value: string, type: string, index: number) => {
    if (type === "price") {
      setLineItems((prev) => {
        return prev.map((it, idx) =>
          idx === index ? { ...it, price: Number(value) } : it,
        );
      });
    } else if (type === "quantity") {
      setLineItems((prev) => {
        return prev.map((it, idx) =>
          idx === index ? { ...it, quantity: Number(value) } : it,
        );
      });
    } else if (type === "desc") {
      setLineItems((prev) => {
        return prev.map((it, idx) =>
          idx === index ? { ...it, name: value } : it,
        );
      });
    }

    //setting total amount of items on change
    setLineItems((prev) => {
      return prev.map((it) => {
        const item = it;
        item.amount = it.quantity * it.price;
        return item;
      });
    });
  };

  const preventNonNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now(),
        name: "",
        quantity: 0,
        price: 0,
        amount: 0,
      },
    ]);
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    const client = clients.find((it) => it.id === clientId);
    if (client) {
      setInvoiceInfo((prev) => ({
        ...prev,
        clientId: client.id,
        clientName: client.name,
        company: client.companyName,
      }));
    } else {
      setInvoiceInfo((prev) => ({
        ...prev,
        clientId: "",
        clientName: "",
        company: "",
      }));
    }
    console.log("changed select value");
  };

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    setInvoiceInfo((prev) => ({
      ...prev,
      status: status,
    }));
  };

  const invoiceStatuses = [
    { id: "PAID", label: "Paid" },
    { id: "PENDING", label: "Pending" },
    { id: "OVERDUE", label: "Overdue" },
  ];

  //useEffect to check orderliness of dates
  useEffect(() => {
    const startInMilliSeconds = Math.floor(
      new Date(invoiceInfo.createdDate).getTime(),
    );
    const endInMilliSeconds = Math.floor(
      new Date(invoiceInfo.dueDate).getTime(),
    );
    if (endInMilliSeconds < startInMilliSeconds) {
      setErrors((prev) => ({
        ...prev,
        invoiceInfo: "Due date must be greater than creation date",
      }));
    } else
      setErrors((prev) => ({
        ...prev,
        invoiceInfo: "",
      }));
  }, [invoiceInfo]);

  let price: number = 0;
  useEffect(() => {
    lineItems.map((it, idx) => {
      //calculating subtotal
      const priceOfLine = it.quantity * it.price;
      price = price + priceOfLine;

      //on reaching last item
      if (idx === lineItems.length - 1) {
        //calculating tax
        const tax = (Number(invoiceInfo.taxPercent) / 100) * price;
        setCummulatives((prev) => ({
          ...prev,
          tax: tax,
          subTotal: price,
          total: price + tax,
        }));
      }
    });
  }, [lineItems, invoiceInfo]);

  const removeLineItem = (id: number) => {
    if (lineItems.length === 1) return; //leave at least one line item
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Invoice</h1>
          <p className="text-muted-foreground mt-1">
            Create a new invoice for your client
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Header */}
          <Card className="p-6 border border-slate-200">
            {<p className="text-red-500 text-center">{errors.invoiceInfo}</p>}
            <h2 className="text-lg font-bold text-foreground mb-4">
              Invoice Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoiceInfo.createdDate}
                  onChange={
                    (e) =>
                      setInvoiceInfo((prev) => ({
                        ...prev,
                        createdDate: e.target.value,
                      }))
                    // console.log(e.target.value);
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={invoiceInfo.dueDate}
                  onChange={(e) =>
                    setInvoiceInfo((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Client
                  <span className="text-red-500"> *</span>
                </label>
                <select
                  onChange={handleClientChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={""}>Select a client</option>
                  {clients?.map((it) => {
                    return (
                      <option key={it.id} value={it.id}>
                        {it.companyName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tax
                </label>
                <input
                  type="text"
                  placeholder="X%"
                  value={invoiceInfo.taxPercent}
                  onChange={(e) =>
                    setInvoiceInfo((prev) => ({
                      ...prev,
                      taxPercent: e.target.value,
                    }))
                  }
                  onKeyDown={preventNonNumbers}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Invoice status <i> (default: PENDING)</i>
                </label>
                <select
                  onChange={handleStatusChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={""}>-- select status --</option>
                  {invoiceStatuses?.map((it) => {
                    return (
                      <option key={it.id} value={it.id}>
                        {it.label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </Card>

          {/* Line Items */}
          <Card className="p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Line Items</h2>
              <Button
                onClick={addLineItem}
                className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>

            <div className="overflow-x-auto">
              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Name/Description
                      </label>
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) =>
                          handleChange(e.target.value, "desc", index)
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div className="w-20">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Qty
                      </label>
                      <input
                        //type="number"
                        value={separateThousands(item.quantity)}
                        onChange={(e) =>
                          handleChange(
                            stripCommas(e.target.value),
                            "quantity",
                            index,
                          )
                        }
                        onKeyDown={preventNonNumbers}
                        className="w-15 md:w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Price (&#8358;) {/*naira*/}
                      </label>
                      <input
                        //type="number"
                        value={separateThousands(item.price)}
                        onChange={(e) =>
                          handleChange(
                            stripCommas(e.target.value),
                            "price",
                            index,
                          )
                        }
                        onKeyDown={preventNonNumbers}
                        placeholder="0.00"
                        className="w-15 md:w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Amount
                      </label>
                      <input
                        type="text"
                        disabled
                        value={separateThousands(item.amount)}
                        className="w-20 md:w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm"
                      />
                    </div>
                    <button
                      onClick={() => removeLineItem(item.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Notes */}
          {/*later limit the number of characters*/}
          <Card className="p-6 border border-slate-200">
            <label className="block text-sm font-medium text-foreground mb-2">
              Notes
            </label>
            <textarea
              placeholder="Add any additional notes or payment instructions..."
              rows={4}
              value={invoiceInfo.noteAttached}
              onChange={(e) => {
                setInvoiceInfo((prev) => ({
                  ...prev,
                  noteAttached: e.target.value,
                }));
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 border border-slate-200 sticky top-8">
            <h2 className="text-lg font-bold text-foreground mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">
                  &#8358; {cummulatives.subTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Tax ({invoiceInfo.taxPercent}%)
                </span>
                <span className="font-medium text-foreground">
                  &#8358; {cummulatives.tax.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-blue-500">
                  &#8358;{" "}
                  {separateThousands(parseInt(cummulatives.total.toFixed(2)))}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                onClick={handleSubmit}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300 cursor-pointer"
                disabled={isFormInvalid}
              >
                {loading ? (
                  <Spinner className="w-5 h-5" />
                ) : (
                  <span className="contents">
                    <Save className="w-4 h-4" />
                    Save Invoice
                  </span>
                )}
              </Button>
              <Button className="w-full bg-slate-200 hover:bg-slate-300 text-foreground">
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

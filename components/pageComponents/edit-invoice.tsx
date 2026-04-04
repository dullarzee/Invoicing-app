"use client";

"use client";

import { ArrowLeft, LineChart, Plus, Trash2, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import BackButton from "../ui/backButton";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { backend_domain } from "@/constants/URLs";
import { endpoints } from "@/constants/BEendpoints";
import { InvoiceWithLineItemsType } from "@/constants/types";

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
  const params = useParams<{ invoiceId: string }>();

  const handleSubmit = async () => {
    const dueDate = new Date(invoiceInfo.dueDate).toISOString();
    const note = invoiceInfo.noteAttached;
    const taxInPercent = Number(invoiceInfo.taxPercent);
    const status = invoiceInfo.status;

    const data = {
      dueDate,
      note,
      lineItems,
      taxInPercent,
      status,
    };

    try {
      await axios.patch(
        `${backend_domain}/api/invoices/${params.invoiceId}`,
        data,
      );
      router.push("/dashboard");
    } catch (error) {
      console.log("failed to update invoice: ", error);
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
  //useEffect to get invoice details and populate UI
  useEffect(() => {
    const getInvoiceDetails = async () => {
      try {
        await axios
          .get(`${endpoints.getInvoiceById}/${params.invoiceId}`)
          .then(({ data }: { data: { data: InvoiceWithLineItemsType } }) => {
            const {
              clientId,
              createdAt,
              dueDate,
              status,
              NoteToClient,
              client,
              taxInPercent,
              lineItems,
            } = data.data;
            setInvoiceInfo({
              company: client!.companyName,
              clientId: clientId,
              clientName: client!.name,
              createdDate: createdAt,
              dueDate: dueDate,
              noteAttached: NoteToClient,
              taxPercent: taxInPercent ? String(taxInPercent) : "0",
              status: status,
            });
            console.log("fetched data", data);

            const array = lineItems.map((it) => ({
              id: it.id,
              name: it.itemName,
              quantity: it.quantity,
              price: it.price,
              amount: it.quantity * it.price,
            }));
            setLineItems(array);
          });
      } catch (error) {
        console.log(error);
      }
    };
    getInvoiceDetails();
  }, []);

  console.log("Enviroment is: ", process.env.ENV);

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

  const getYYYYMMDD = (date: string): string => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Invoice</h1>
            <p className="text-muted-foreground mt-1">
              Update invoice details and line items
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.back()}
            className="bg-slate-200 hover:bg-slate-300 text-foreground flex items-center gap-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isFormInvalid}
            className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
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
                  Due Date
                </label>
                <input
                  type="date"
                  value={getYYYYMMDD(invoiceInfo.dueDate)}
                  onChange={(e) => {
                    setInvoiceInfo((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }));
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/*<div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Client
                  <span className="text-red-500"> *</span>
                </label>
                <select
                  onChange={handleClientChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={invoiceInfo.clientId}
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
              </div>*/}

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
                  Invoice status
                </label>
                <select
                  onChange={handleStatusChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={invoiceInfo.status}
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
                      value={item.quantity}
                      onChange={(e) =>
                        handleChange(e.target.value, "quantity", index)
                      }
                      onKeyDown={preventNonNumbers}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Price (&#8358;) {/*naira*/}
                    </label>
                    <input
                      //type="number"
                      value={item.price}
                      onChange={(e) =>
                        handleChange(e.target.value, "price", index)
                      }
                      onKeyDown={preventNonNumbers}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      disabled
                      value={item.amount}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm"
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
                  &#8358; {cummulatives.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button
                onClick={handleSubmit}
                disabled={isFormInvalid}
                className="w-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
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

/*import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useParams } from "next/navigation";

type paramsType = { invoiceId: string };

export default function EditInvoice({}) {
  const params = useParams<paramsType>();
  const [lineItems, setLineItems] = useState([
    {
      id: 1,
      description: "Web Development Services",
      quantity: 40,
      rate: 50,
      amount: 2000,
    },
    { id: 2, description: "UI/UX Design", quantity: 10, rate: 50, amount: 500 },
  ]);

  const [formData, setFormData] = useState({
    invoiceNumber: "INV-001",
    invoiceDate: "2025-10-20",
    dueDate: "2025-10-25",
    client: "Acme Corp",
    notes: "Thank you for your business!",
  });

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now(),
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const removeLineItem = (id: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: number, field: string, value: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return item;
      }),
    );
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Invoice</h1>
            <p className="text-muted-foreground mt-1">
              Update invoice details and line items
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-slate-200 hover:bg-slate-300 text-foreground flex items-center gap-2">
            Cancel
          </Button>
          <Button className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-foreground mb-6">
              Invoice Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Invoice Date
                </label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Client
                </label>
                <select
                  name="client"
                  value={formData.client}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                >
                  <option>Acme Corp</option>
                  <option>Tech Solutions</option>
                  <option>Global Industries</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Line Items</h2>
              <Button
                onClick={addLineItem}
                className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">

              <div className="hidden md:grid grid-cols-12 gap-3 pb-4 border-b border-slate-200">
                <div className="col-span-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Description
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Qty
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Rate
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Amount
                  </p>
                </div>
                <div className="col-span-1"></div>
              </div>

              {lineItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-3 items-end"
                >
                  <div className="col-span-12 md:col-span-5">
                    <label className="block text-xs font-medium text-muted-foreground mb-1 md:hidden">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(item.id, "description", e.target.value)
                      }
                      placeholder="Item description"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-foreground"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1 md:hidden">
                      Qty
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(
                          item.id,
                          "quantity",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-foreground"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1 md:hidden">
                      Rate
                    </label>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        updateLineItem(
                          item.id,
                          "rate",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-foreground"
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1 md:hidden">
                      Amount
                    </label>
                    <input
                      type="number"
                      disabled
                      value={item.amount.toFixed(2)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm text-foreground cursor-not-allowed"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length === 1}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border border-slate-200">
            <label className="block text-sm font-medium text-foreground mb-3">
              Notes & Terms
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add any additional notes, payment instructions, or terms..."
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
            />
          </Card>

          <Card className="p-6 border border-slate-200 bg-slate-50">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Additional Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Created</p>
                <p className="text-sm font-medium text-foreground">
                  Oct 20, 2025
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Last Modified
                </p>
                <p className="text-sm font-medium text-foreground">Just now</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border border-slate-200 sticky top-8">
            <h2 className="text-lg font-bold text-foreground mb-6">Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span className="font-medium text-foreground">
                  ${tax.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-4 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-blue-500">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              <Button className="w-full bg-slate-200 hover:bg-slate-300 text-foreground">
                Cancel
              </Button>
            </div>
          </Card>

          <Card className="p-6 border border-slate-200 bg-blue-50">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">
              Editing Tips
            </h3>
            <ul className="space-y-2 text-xs text-blue-800">
              <li>• Amounts calculate automatically</li>
              <li>• You can add/remove line items</li>
              <li>• Changes won't be saved until you click Save</li>
              <li>• Client will see updated version</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}*/

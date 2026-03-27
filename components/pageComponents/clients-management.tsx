"use client";

import { Search, Plus, Edit2, Trash2, Mail, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { endpoints } from "@/constants/BEendpoints";
import { ClientFullResponseType } from "@/constants/types";
import useDisclosure from "@/lib/disclosure";
import { Modal } from "../modal";
import { set } from "react-hook-form";

interface ClientType {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  invoices: number;
  totalAmount: number;
}

export default function ClientsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<ClientType[]>([]);
  const [newClientData, setNewClientData] = useState({
    name: "",
    companyName: "",
    email: "",
    phoneNumber: "",
  });
  const deleteModal = useDisclosure();
  const editClientModal = useDisclosure();
  const clientIdToDelete = React.useRef<{ name: string; id: string | null }>({
    name: "",
    id: "",
  });
  const [clientToEdit, setClientToEdit] = React.useState({
    name: "",
    companyName: "",
    email: "",
    phoneNumber: "",
    id: "",
  });

  const isFormValid = !Object.values(newClientData).every(
    (value) => value.trim() !== "",
  );

  const isEditFormValid = !Object.values(clientToEdit).every(
    (value) => value?.trim() !== "",
  );
  const [showForm, setShowForm] = useState(false);

  const transformClientData = (data: ClientFullResponseType): ClientType[] => {
    const array: ClientType[] = [];
    data.map((it) => {
      const { id, name, companyName, email, phoneNumber, invoices } = it;
      let amount = 0;
      it?.invoices?.map((inv) =>
        inv?.lineItems?.map((Item) => (amount += Item.price * Item.quantity)),
      );
      array.push({
        id,
        companyName,
        name,
        email,
        phoneNumber,
        invoices: invoices?.length,
        totalAmount: amount,
      });
    });
    return array;
  };
  const handleDelete = async (id: string) => {
    try {
      await axios
        .delete(`${endpoints.deleteClient}/${id}`)
        .then(async (res) => {
          if (res.data.ok) {
            const clients = await axios.get(endpoints.getClients);
            setClients(transformClientData(clients.data));
          }
        });
    } catch (error) {
      console.log("Failed to delete invoice: ", error);
    }
    deleteModal.setOpen(false);
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await axios.get(
          `${endpoints.getClients}?includeInvoices=true`,
        );
        console.log(data);
        setClients(transformClientData(data as ClientFullResponseType));
      } catch (error) {
        console.error("Error fetching clients: ", error);
      }
    };
    fetchClients();
  }, [clients.length]);

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClientData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClientEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientToEdit((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clientCreationHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await axios.post(endpoints.postClient, newClientData).then(({ data }) => {
      if (data.ok) {
        setShowForm(false);
        axios.get(endpoints.getClients).then(({ data }) => {
          setClients(transformClientData(data as ClientFullResponseType));
        });
      }
    });
  };

  const clientEditHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios
        .patch(`${endpoints.updateClient}/${clientToEdit.id}`, clientToEdit)
        .then(async ({ data }) => {
          const res = data.ok && (await axios.get(endpoints.getClients));
          setClients(transformClientData(res.data as ClientFullResponseType));
        });
      editClientModal.setOpen(false);
    } catch (error) {
      console.log("error updating client: ", error);
      editClientModal.setOpen(false);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Manage your client information
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      </div>
      {/* Add Client Form */}
      {showForm && (
        <form onSubmit={clientCreationHandler}>
          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Add New Client
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Client Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={newClientData.name}
                  onChange={handleClientChange}
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
                  value={newClientData.email}
                  onChange={handleClientChange}
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
                  value={newClientData.phoneNumber}
                  onChange={handleClientChange}
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
                  onChange={handleClientChange}
                  type="text"
                  value={newClientData.companyName}
                  placeholder="Company name"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                disabled={isFormValid}
                className="bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300"
              >
                Save Client
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setShowForm(false);
                }}
                className="bg-slate-200 hover:bg-slate-300 text-foreground"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </form>
      )}
      {/* Search */}
      <Card className="p-4 border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>
      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredClients.map((client) => (
          <Card
            key={client.id}
            className="p-6 border border-slate-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {client.companyName}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {client.invoices} invoices
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setClientToEdit({
                      id: client.id,
                      name: client.name,
                      companyName: client.companyName,
                      email: client.email,
                      phoneNumber: client.phoneNumber,
                    });
                    editClientModal.setOpen(true);
                  }}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => {
                    clientIdToDelete.current.id = client.id;
                    clientIdToDelete.current.name = client.companyName;
                    deleteModal.setOpen(true);
                  }}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a
                  href={`mailto:${client.email}`}
                  className="hover:text-blue-500"
                >
                  {client.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{client.phoneNumber}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-muted-foreground">Total Invoiced</p>
              <p className="text-xl font-bold text-foreground">
                &#8358;{client.totalAmount}
              </p>
            </div>
          </Card>
        ))}
      </div>
      {/*modal for confirming client deletion*/}
      <Modal
        open={deleteModal.open}
        setOpen={deleteModal.setOpen}
        heading="Delete Client?"
        className="md:w-[400px]"
      >
        <div className="my-5 flex flex-col gap-4">
          <p>
            Are you sure you want to delete{" "}
            <span className="font-bold text-red-400 line-clamp-1">
              {clientIdToDelete.current.name}?
            </span>
            This action cannot be undone.
          </p>
          <button
            onClick={() => handleDelete(clientIdToDelete.current.id as string)}
            className="py-3 text-[1.15rem] text-white bg-red-600 w-full rounded-lg"
          >
            Delete
          </button>
        </div>
      </Modal>
      {/*modal for editing client details*/}
      <Modal
        //open={editClientModal.open}
        open={editClientModal.open}
        setOpen={editClientModal.setOpen}
        heading={
          <span>
            Edit{" "}
            <span className="text-blue-400 font-medium">
              {clientToEdit.companyName}
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
                  value={clientToEdit.name}
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
                  value={clientToEdit.email}
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
                  value={clientToEdit.phoneNumber}
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
                  value={clientToEdit.companyName}
                  onChange={handleClientEditChange}
                  type="text"
                  placeholder="Company name"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                disabled={isEditFormValid}
                className="bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300"
              >
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
    </div>
  );
}

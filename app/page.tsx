"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import Dashboard from "@/components/pageComponents/dashboard"
import InvoicesList from "@/components/pageComponents/invoices-list"
import CreateInvoice from "@/components/pageComponents/create-invoice"
import InvoiceDetails from "@/components/pageComponents/invoice-details"
import ClientsManagement from "@/components/pageComponents/clients-management"
import Settings from "@/components/pageComponents/settings"
import { redirect } from "next/navigation"

export default function Home() {
  redirect("/dashboard")
}

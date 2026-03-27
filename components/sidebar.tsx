"use client"

import { FileText, BarChart3, Users, Settings, Plus } from "lucide-react"
import { RoutesEnum } from "@/constants/routeEnums"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"


export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  console.log("pathname: ", pathname);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, route:RoutesEnum.DASHBOARD },
    { id: "invoices", label: "Invoices", icon: FileText, route:RoutesEnum.INVOICES_LIST },
    { id: "clients", label: "Clients", icon: Users, route:RoutesEnum.CLIENTS_PAGE },
    { id: "settings", label: "Settings", icon: Settings, route:RoutesEnum.SETTINGS },
  ]

  return (
    <aside className="fixed top-0 left-0 w-64 h-full hidden md:block bg-slate-900 text-white flex flex-col border-r border-slate-800">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold">InvoiceHub</h1>
        </div>
      </div>

      {/* Create Invoice Button */}
      <div className="p-4">
        <Button
          onClick={()=>router.push(RoutesEnum.NEW_INVOICE)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.route;
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.route)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? "bg-blue-500 text-white" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">Company</p>
          <p>Acme Inc.</p>
        </div>
      </div>
    </aside>
  )
}

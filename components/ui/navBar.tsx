"use client";

import { X } from "lucide-react";
import useDisclosure from "@/lib/disclosure";
import { Card } from "./card";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { RoutesEnum } from "@/constants/routeEnums";
import { useEffect } from "react";

export default function NavBar() {
  const { open, setOpen } = useDisclosure();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  return (
    <section className="flex justify-between items-center w-full h-16 bg-slate-900 text-white px-5 border-b border-slate-800">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-xs font-bold">G-R</span>
        </div>
        <h1 className="text-xl font-bold">InvoiceHub</h1>
      </div>
      <button onClick={() => setOpen(!open)} className="md:hidden">
        {open ? (
          <X />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17">
            <g fill="#D0D6F9" fillRule="evenodd">
              <path d="M0 0h24v3H0zM0 9h24v3H0zM0 18h24v3H0z" />
            </g>
          </svg>
        )}
      </button>

      {open && (
        <AnimatePresence>
          <motion.section
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            exit={{ opacity: 0, y: 100, transition: { duration: 0.3 } }}
            className="flex md:hidden flex-col justify-center fixed top-16 right-0 w-64 h-[calc(100vh-4rem)] bg-slate-900 text-white border-l border-slate-800 p-4 z-100"
          >
            <nav>
              <ul className="space-y-9">
                <li onClick={() => router.push(RoutesEnum.DASHBOARD)}>
                  <a
                    href="#"
                    className={`hover:text-blue-400 ${pathname === RoutesEnum.DASHBOARD ? "text-blue-400 text-[2rem]" : ""}`}
                  >
                    Home
                  </a>
                </li>
                <li onClick={() => router.push(RoutesEnum.INVOICES_LIST)}>
                  <a
                    href="#"
                    className={`hover:text-blue-400 ${pathname === RoutesEnum.INVOICES_LIST ? "text-blue-400 text-[2rem]" : ""}`}
                  >
                    Invoices
                  </a>
                </li>
                <li onClick={() => router.push(RoutesEnum.CLIENTS_PAGE)}>
                  <a
                    href="#"
                    className={`hover:text-blue-400 ${pathname === RoutesEnum.CLIENTS_PAGE ? "text-blue-400 text-[2rem]" : ""}`}
                  >
                    Customers
                  </a>
                </li>
                <li onClick={() => router.push(RoutesEnum.SETTINGS)}>
                  <a
                    href="#"
                    className={`hover:text-blue-400 ${pathname === RoutesEnum.SETTINGS ? "text-blue-400 text-[2rem]" : ""}`}
                  >
                    Settings
                  </a>
                </li>
              </ul>
            </nav>
          </motion.section>
        </AnimatePresence>
      )}
    </section>
  );
}

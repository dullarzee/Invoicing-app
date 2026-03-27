//since i cant implement redux toolkit for the endpoints right now, im compiling all endpoints in one file and exporting for easy maintenance

import { create } from "domain";
import { backend_domain } from "./URLs";

export const endpoints = {
  getClients: `${backend_domain}/api/clients`, //flags: ?includeInvoices=true/false,
  getInvoices: `${backend_domain}/api/invoices`,
  postClient: `${backend_domain}/api/clients/create`,
  postInvoice: `${backend_domain}/api/invoices/create`,
  updateClient: `${backend_domain}/api/clients`,
  updateInvoice: `${backend_domain}/api/invoices`,
  deleteInvoice: `${backend_domain}/api/invoices`,
  deleteClient: `${backend_domain}/api/clients`,
};

export interface LineItemType {
  id: number;
  name: string;
  description: string | null;
  quantity: number;
  price: number;
  invoiceId: string;
}
export interface ClientsType {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  dateAdded: string;
}

export interface InvoiceType {
  id: string;
  NoteToClient: string;
  createdAt: string;
  dueDate: string;
  clientId: string;
  status: "PAID" | "PENDING" | "OVERDUE";
}

export interface InvoiceWithLineItemsType extends InvoiceType {
  lineItems: LineItemType[];
}

export type ClientFullResponseType = (ClientsType & {
  invoices: InvoiceWithLineItemsType[];
})[];

export interface LineItemType {
  id: number;
  itemName: string;
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
  client?: ClientsType;
  status: "PAID" | "PENDING" | "OVERDUE";
  taxInPercent: number;
  updateAt: string;
}

export interface InvoiceWithLineItemsType extends InvoiceType {
  lineItems: LineItemType[];
}

export type ClientFullResponseType = (ClientsType & {
  invoices: InvoiceWithLineItemsType[];
})[];

export type InvoiceFullResponseType = InvoiceType & {
  lineItems?: LineItemType[];
};

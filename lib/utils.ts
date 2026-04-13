import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { endpoints } from "@/constants/BEendpoints";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const separateThousands = (amount: number) => {
  return amount
    ?.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/\.00$/, "");
};

export const stripCommas = (value: string) => {
  return value.replaceAll(/,/g, "");
};

export const getFormattedDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const handleDownloadPDF = async (invoiceId: string) => {
  try {
    const res = await axios.get(
      `${endpoints.downloadInvoicePDF}/${invoiceId}`,
      {
        responseType: "blob",
      },
    );
    //
    const url = URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${invoiceId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("PDF downloaded successfully");

    console.log("pdf download response: ", res);
  } catch (error) {
    toast.error("Failed to download PDF");
    console.log("error downloading pdf: ", error);
  }
};

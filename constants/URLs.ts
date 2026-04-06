export const dynamic = "force-dynamic";

export const backend_domain =
  process.env.ENVIRONMENT === "dev"
    ? "http://localhost:8001"
    : "https://invoicing-app-backend.onrender.com";

export const dynamic = "force-dynamic";

export const backend_domain =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "dev"
    ? "http://localhost:8001"
    : "https://invoicing-app-backend.onrender.com";

console.log("Environment: ", process.env.NEXT_PUBLIC_ENVIRONMENT);
console.log("backend_domain: ", backend_domain);

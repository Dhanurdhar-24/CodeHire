import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ClerkProvider 
          publishableKey={PUBLISHABLE_KEY}
          appearance={{
            layout: {
              logoImageUrl: "/codehire.svg",
            }
          }}
          localization={{
            signIn: {
              start: {
                title: "Sign in to CodeHire",
                subtitle: "to continue to CodeHire",
              }
            },
            signUp: {
              start: {
                title: "Create your account",
                subtitle: "to continue to CodeHire",
              }
            }
          }}
        >
          <App />
        </ClerkProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);

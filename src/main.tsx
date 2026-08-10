import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import { ApiError } from "./api/errors";


const retryColdStart = (failureCount: number, error: unknown) => {
  if (failureCount >= 1) return false;
  if (!(error instanceof ApiError)) return false;
  return error.kind === "network" || error.status >= 500;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: retryColdStart,
      retryDelay: 2000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: retryColdStart,
      retryDelay: 2000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/:view" element={<App />} />
          <Route path="/:view/:bookId" element={<App />} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);

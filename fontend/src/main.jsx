import React from "react";
import ReactDOM from "react-dom/client";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sepolia } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";
import App from "./App";
import "./index.css";

// IMPORTANT: Replace with your WalletConnect projectId via env if you have one
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "CHANGE_ME_PROJECT_ID";

const config = getDefaultConfig({
  appName: "链上红包",
  projectId,
  chains: [sepolia],
  ssr: false,
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);

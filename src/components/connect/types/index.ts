export { type GetSnapsResponse, type Snap } from "./snap";
export { type Account } from "./account";

interface EthereumProvider {
  isMetaMask?: boolean; // True if the provider is MetaMask
  detected?: Array<any>; // Array of detected providers
  request: (request: { method: string; params?: any }) => Promise<any>;
  setProvider: (provider: string) => void; // Add this line
  providers: Array<any>; // Array of providers
}

declare global {
  interface Window {
    ethereum: EthereumProvider;
  }
}

export type Account = {
  publicId: string;
  privateKey?: string;
  alias: string;
};

export type WalletConnectAccount = {
  address: string;
  name: string;
  amount: number;
};

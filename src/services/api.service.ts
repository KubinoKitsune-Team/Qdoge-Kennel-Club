import type { Asset, AssetOrder, AveragePrice, EntityOrder, IssuedAsset, Trade, Transfer } from "@/types";

const API_URL = "https://api.quhub.app/service";

// Assets
export const fetchAssets = async (): Promise<Asset[]> => {
  const response = await fetch(`${API_URL}/v1/qx/assets`);
  const data = await response.json();
  return data;
};

// Trades
export const fetchTrades = async (): Promise<Trade[]> => {
  const response = await fetch(`${API_URL}/v1/qx/trades`);
  const data = await response.json();
  return data;
};

// Transfers
export const fetchTransfers = async (): Promise<Transfer[]> => {
  const response = await fetch(`${API_URL}/v1/qx/transfers`);
  const data = await response.json();
  return data;
};

// Issued Assets
export const fetchIssuedAssets = async (): Promise<IssuedAsset[]> => {
  const response = await fetch(`${API_URL}/v1/qx/issued-assets`);
  const data = await response.json();
  return data;
};

// Entity endpoints
export const fetchEntityAskOrders = async (entity: string): Promise<EntityOrder[]> => {
  const response = await fetch(`${API_URL}/v1/qx/entity/${entity}/asks`);
  const data = await response.json();
  return data;
};

export const fetchEntityBidOrders = async (entity: string): Promise<EntityOrder[]> => {
  const response = await fetch(`${API_URL}/v1/qx/entity/${entity}/bids`);
  const data = await response.json();
  return data;
};

export const fetchEntityTrades = async (entity: string): Promise<Trade[]> => {
  const response = await fetch(`${API_URL}/v1/qx/entity/${entity}/trades`);
  const data = await response.json();
  return data;
};

export const fetchEntityTransfers = async (entity: string): Promise<Transfer[]> => {
  const response = await fetch(`${API_URL}/v1/qx/entity/${entity}/transfers`);
  const data = await response.json();
  return data;
};

// Asset endpoints
export const fetchAssetAskOrders = async (issuer: string, asset: string): Promise<AssetOrder[]> => {
  const response = await fetch(`${API_URL}/v1/qx/issuer/${issuer}/asset/${asset}/asks`);
  const data = await response.json();
  return data;
};

export const fetchAssetBidOrders = async (issuer: string, asset: string): Promise<AssetOrder[]> => {
  const response = await fetch(`${API_URL}/v1/qx/issuer/${issuer}/asset/${asset}/bids`);
  const data = await response.json();
  return data;
};

export const fetchAssetTrades = async (issuer: string, asset: string): Promise<Trade[]> => {
  const response = await fetch(`${API_URL}/v1/qx/issuer/${issuer}/asset/${asset}/trades`);
  const data = await response.json();
  return data;
};

export const fetchAssetTransfers = async (issuer: string, asset: string): Promise<Transfer[]> => {
  const response = await fetch(`${API_URL}/v1/qx/issuer/${issuer}/asset/${asset}/transfers`);
  const data = await response.json();
  return data;
};

export const fetchAssetChartAveragePrice = async (issuer: string, asset: string): Promise<AveragePrice[]> => {
  const response = await fetch(`${API_URL}/v1/qx/issuer/${issuer}/asset/${asset}/chart/average-price`);
  const data = await response.json();
  return data;
};

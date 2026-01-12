export type TickInfo = {
  tick: number;
  duration: number;
  epoch: number;
  initialTick: number;
};

export type Balance = {
  id: string;
  balance: number;
  validForTick: number;
  latestIncomingTransferTick: number;
  latestOutgoingTransferTick: number;
  incomingAmount: number;
  outgoingAmount: number;
  numberOfIncomingTransfers: number;
  numberOfOutgoingTransfers: number;
};

export interface IQuerySC {
  contractIndex: number;
  inputType: number;
  inputSize: number;
  requestData: string;
}

export interface IQuerySCResponse {
  responseData: string;
}

export interface IEndedStakeStatus {
  unLockedAmount: number;
  rewardedAmount: number;
  status?: boolean;
}

export interface TxStatus {
  txId: string;
  moneyFlew: boolean;
}

export interface LatestStats {
  timestamp: string;
  circulatingSupply: string;
  activeAddresses: number;
  price: number;
  marketCap: string;
  epoch: number;
  currentTick: number;
  ticksInCurrentEpoch: number;
  emptyTicksInCurrentEpoch: number;
  epochTickQuality: number;
  burnedQus: string;
}

export interface RichList {
  pagination: {
    totalRecords: number;
    currentPage: number;
    totalPages: number;
  };
  epoch: number;
  richList: {
    entities: { identity: string; balance: string }[];
  };
}

export interface Transaction {
  sourceId: string;
  destId: string;
  amount: string;
  tickNumber: number;
  inputType: number;
  inputSize: number;
  inputHex: string;
  signatureHex: string;
  txId: string;
}
export interface TxHistory {
  transactions: {
    tickNumber: number;
    identity: string;
    transactions: {
      transaction: Transaction;
      timestamp: string;
      moneyFlew: boolean;
    }[];
  }[];
}

export interface EpochTicks {
  pagination: {
    totalRecords: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    nextPage: number;
    previousPage: number;
  };
  ticks: { tickNumber: number; isEmpty: boolean }[];
}

export interface TickEvents {
  tick: number;
  txEvents: {
    txId: string;
    events: IEvent[];
  }[];
}

export interface IEvent {
  header: {
    epoch: number;
    tick: number;
    tmp: number;
    eventId: string;
    eventDigest: string;
  };
  eventType: number;
  eventSize: number;
  eventData: string;
}

import { QubicDefinitions } from "@qubic-lib/qubic-ts-library/dist/QubicDefinitions";
import { QubicTransferQXOrderPayload } from "@qubic-lib/qubic-ts-library/dist/qubic-types/transacion-payloads/QubicTransferQXOrderPayload";
import { PublicKey } from "@qubic-lib/qubic-ts-library/dist/qubic-types/PublicKey";
import { QubicTransaction } from "@qubic-lib/qubic-ts-library/dist/qubic-types/QubicTransaction";
import { Long } from "@qubic-lib/qubic-ts-library/dist/qubic-types/Long";
import { valueOfAssetName } from "@/utils/base.utils";
import { fetchQuerySC } from "./rpc.service";
import { IFees } from "@/types/qx.types";
import { base64ToUint8Array, createPayload } from "@/utils/tx.utils";
import { createSCTx } from "./tx.service";

export const createQXOrderTx = async (
  senderId: string,
  targetTick: number,
  payload: QubicTransferQXOrderPayload,
  actionType: number,
): Promise<QubicTransaction> => {
  const transaction = new QubicTransaction()
    .setSourcePublicKey(new PublicKey(senderId))
    .setDestinationPublicKey(QubicDefinitions.QX_ADDRESS)
    .setTick(targetTick)
    .setInputSize(payload.getPackageSize())
    .setAmount(new Long(0))
    .setInputType(actionType)
    .setPayload(payload);

  switch (actionType) {
    case QubicDefinitions.QX_ADD_BID_ORDER:
      transaction.setAmount(new Long(payload.getTotalAmount()));
      break;
    case QubicDefinitions.QX_ADD_ASK_ORDER:
    case QubicDefinitions.QX_REMOVE_BID_ORDER:
    case QubicDefinitions.QX_REMOVE_ASK_ORDER:
      transaction.setAmount(new Long(0));
      break;
  }

  return transaction;
};

export const createQXOrderPayload = (
  issuer: string,
  assetName: string,
  price: number,
  amount: number,
): QubicTransferQXOrderPayload => {
  return new QubicTransferQXOrderPayload({
    issuer: new PublicKey(issuer),
    assetName: new Long(BigInt(valueOfAssetName(assetName))),
    price: new Long(BigInt(price)),
    numberOfShares: new Long(BigInt(amount)),
  });
};

export const getFees = async (): Promise<IFees> => {
  const query = {
    contractIndex: 1,
    inputType: 1,
    inputSize: 0,
    requestData: "",
  };

  const res = await fetchQuerySC(query);

  if (!res.responseData)
    return {
      assetIssuanceFee: 0,
      transferFee: 0,
      tradeFee: 0,
    };

  const responseView = new DataView(base64ToUint8Array(res.responseData).buffer);
  const getValue = (offset: number) => Number(responseView.getUint32(offset, true));

  return {
    assetIssuanceFee: getValue(0),
    transferFee: getValue(4),
    tradeFee: getValue(8),
  };
};

interface IssueAssetPayload {
  assetName: bigint;
  numberOfShares: bigint;
  unitOfMeasurement: bigint;
  numberOfDecimalPlaces: number;
}

export const issueAsset = async (sourceID: string, amount: number, tick: number, data: IssueAssetPayload) => {
  const payload = createPayload([
    { data: data.assetName, type: "bigint64" },
    { data: data.numberOfShares, type: "bigint64" },
    { data: data.unitOfMeasurement, type: "bigint64" },
    { data: data.numberOfDecimalPlaces, type: "uint8" },
  ]);

  return await createSCTx(sourceID, 1, 1, payload.getPackageSize(), amount, tick, payload);
};

interface TransferShareOwnershipAndPossessionPayload {
  issuer: Uint8Array;
  newOwnerAndPossessor: Uint8Array;
  assetName: number;
  numberOfShares: number;
}

export const transferShareOwnershipAndPossession = async (sourceID: string, amount: number, tick: number, data: TransferShareOwnershipAndPossessionPayload) => {
  const payload = createPayload([
    { data: data.issuer, type: "id" },
    { data: data.newOwnerAndPossessor, type: "id" },
    { data: data.assetName, type: "bigint64" },
    { data: data.numberOfShares, type: "bigint64" },
  ]);

  return await createSCTx(sourceID, 1, 2, payload.getPackageSize(), amount, tick, payload);
}

interface TransferShareManagementRightsPayload {
  issuer: Uint8Array;
  assetName: number;
  numberOfShares: number;
  newManagingContractIndex: number;
}

export const transferShareManagementRights = async (sourceID: string, amount: number, tick: number, data: TransferShareManagementRightsPayload) => {
  const payload = createPayload([
    { data: data.issuer, type: "id" },
    { data: data.assetName, type: "bigint64" },
    { data: data.numberOfShares, type: "bigint64" },
    { data: data.newManagingContractIndex, type: "uint32" },
  ]);
  return await createSCTx(sourceID, 1, 9, payload.getPackageSize(), amount, tick, payload);
}

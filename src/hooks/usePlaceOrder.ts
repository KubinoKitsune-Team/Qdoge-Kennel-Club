import { QubicDefinitions } from "@qubic-lib/qubic-ts-library/dist/QubicDefinitions";
import { useState } from "react";
import { useAtom } from "jotai";
import { settingsAtom } from "@/store/settings";
import { useQubicConnect } from "@/components/connect/QubicConnectContext";
import { createQXOrderTx } from "@/services/qx.service";
import { createQXOrderPayload } from "@/services/qx.service";
import { broadcastTx } from "@/services/rpc.service";
import { tickInfoAtom } from "@/store/tickInfo";
import { assetsAtom } from "@/store/assets";
import toast from "react-hot-toast";
import { useTxMonitor } from "@/store/txMonitor";
import { fetchAssetAskOrders, fetchAssetBidOrders, fetchEntityTrades } from "@/services/api.service";
import { refetchAtom } from "@/store/action";
import { decodeUint8ArrayTx } from "@/utils/tx.utils";

const usePlaceOrder = () => {
  const [showProgress, setShowProgress] = useState(false);
  const { wallet, getSignedTx } = useQubicConnect();
  const [settings] = useAtom(settingsAtom);
  const [tickInfo] = useAtom(tickInfoAtom);
  const [assets] = useAtom(assetsAtom);
  const [, setRefetch] = useAtom(refetchAtom);

  const { startMonitoring } = useTxMonitor();

  const placeOrder = async (
    assetName: string,
    type: "buy" | "sell" | "rmBuy" | "rmSell",
    price: number,
    amount: number,
    isMaker?: boolean,
  ): Promise<void> => {
    if (!wallet?.publicKey) return;

    setShowProgress(true);

    const issuer = assets.find((asset) => asset.name === assetName)?.issuer;
    if (!issuer || !tickInfo) return;

    const orderPayload = createQXOrderPayload(issuer, assetName, price, amount);

    const actionType = {
      buy: QubicDefinitions.QX_ADD_BID_ORDER,
      sell: QubicDefinitions.QX_ADD_ASK_ORDER,
      rmBuy: QubicDefinitions.QX_REMOVE_BID_ORDER,
      rmSell: QubicDefinitions.QX_REMOVE_ASK_ORDER,
    }[type];

    const transaction = await createQXOrderTx(
      wallet?.publicKey,
      tickInfo?.tick + settings.tickOffset,
      orderPayload,
      actionType,
    );

    const signedTx = await getSignedTx(transaction);
    const res = await broadcastTx(signedTx.tx);

    const decodedTx = decodeUint8ArrayTx(signedTx.tx);
    const targetTick = decodedTx.tick;

    if (res.transactionId) {
      toast.success("Transaction sent successfully");
    } else {
      toast.error("Transaction broadcast failed");
      return;
    }

    const taskId = `place-order-${assetName}-${price}-${amount}-${Date.now()}`; // Unique task ID
    const checker = async () => {
      switch (type) {
        case "buy":
          if (isMaker) {
            const bidOrders = await fetchAssetBidOrders(issuer, assetName);
            return bidOrders.some((order) => order.price === price && order.entityId === wallet?.publicKey);
          } else {
            const trades = await fetchEntityTrades(wallet?.publicKey);
            return trades.some((trade) => trade.price === price && trade.taker === wallet?.publicKey);
          }
        case "sell":
          if (isMaker) {
            const askOrders = await fetchAssetAskOrders(issuer, assetName);
            return askOrders.some((order) => order.price === price && order.entityId === wallet?.publicKey);
          } else {
            const trades = await fetchEntityTrades(wallet?.publicKey);
            return trades.some((trade) => trade.price === price && trade.taker === wallet?.publicKey);
          }
        case "rmBuy":
          {
            const rmAskOrders = await fetchAssetAskOrders(issuer, assetName);
            return !rmAskOrders.some((order) => order.price === price && order.entityId === wallet?.publicKey);
          }
        case "rmSell":
          {
            const rmBidOrders = await fetchAssetBidOrders(issuer, assetName);
            return !rmBidOrders.some((order) => order.price === price && order.entityId === wallet?.publicKey);
          }
        default:
          return false;
      }
    };

    const onSuccess = async () => {
      if (type.includes("rm")) {
        toast.success("Order removed successfully");
      } else if (isMaker) {
        toast.success("Order placed successfully");
      } else {
        toast.success("Order filled successfully");
      }
      setRefetch((prev) => !prev);
    };

    const onFailure = async () => {
      if (type.includes("rm")) {
        toast.error("Order removal failed");
      } else if (isMaker) {
        toast.error("Order placement failed");
      } else {
        toast.error("Order fill failed");
      }
    };

    startMonitoring(taskId, { checker, onSuccess, onFailure, targetTick });
  };

  return { showProgress, setShowProgress, placeOrder };
};

export default usePlaceOrder;

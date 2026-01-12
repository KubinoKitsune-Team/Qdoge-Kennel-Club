import { useState, useEffect } from "react";
import { useQubicConnect } from "@/components/connect/QubicConnectContext";
import { issueAsset, getFees } from "@/services/qx.service";
import { broadcastTx, fetchBalance, fetchTickInfo, fetchOwnedAssets } from "@/services/rpc.service";
import { valueOfAssetName } from "@/utils/base.utils";
import toast from "react-hot-toast";
import { useTxMonitor } from "@/store/txMonitor";
import { useAtom } from "jotai";
import { refetchAtom } from "@/store/action";
import { settingsAtom } from "@/store/settings";
import { assetsAtom } from "@/store/assets";
import { decodeUint8ArrayTx } from "@/utils/tx.utils";

export interface IssueAssetParams {
  assetName: string;
  numberOfShares: number;
  unitOfMeasurement: string;
  numberOfDecimalPlaces: number;
}

// SI base units
export const SI_UNITS = {
  AMPERE: 0,
  CANDELA: 1,
  KELVIN: 2,
  KILOGRAM: 3,
  METER: 4,
  MOLE: 5,
  SECOND: 6,
};

// Convert unit string to bigint representation
export const formatUnitOfMeasurement = (unitString: string): bigint => {
  // Default unit array (all zeros)
  const unitArray = [0, 0, 0, 0, 0, 0, 0];

  // Parse the unit string and update the array
  // For predefined units, we'll use specific configurations
  switch (unitString) {
    case "0": // None
      break;
    case "1": // Piece
      // Piece is just a count, no SI units
      break;
    case "2": // Second
      unitArray[SI_UNITS.SECOND] = 1;
      break;
    case "3": // Byte
      // Byte is not an SI unit, but we'll treat it as a count
      break;
    case "4": // Gram (we'll represent as kg with -3 power)
      unitArray[SI_UNITS.KILOGRAM] = 1;
      // Note: In a real implementation, we might want to adjust for gram vs kilogram
      break;
    case "5": // Meter
      unitArray[SI_UNITS.METER] = 1;
      break;
    case "6": // Joule (kg·m²·s⁻²)
      unitArray[SI_UNITS.KILOGRAM] = 1;
      unitArray[SI_UNITS.METER] = 2;
      unitArray[SI_UNITS.SECOND] = -2;
      break;
    // Add more predefined units as needed
  }

  // Convert the array to a bigint using bit shifting
  // Each unit gets 8 bits, with values from -128 to 127
  let result = 0n;
  for (let i = 0; i < 7; i++) {
    // Convert to 8-bit signed integer and shift to the right position
    const value = BigInt(unitArray[i] & 0xff);
    result |= value << BigInt(i * 8);
  }

  return result;
};

export const useIssueAsset = () => {
  const { wallet, getSignedTx } = useQubicConnect();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fees, setFees] = useState({ assetIssuanceFee: 0 });
  const { startMonitoring } = useTxMonitor();
  const [, setRefetch] = useAtom(refetchAtom);
  const [settings] = useAtom(settingsAtom);
  const [assets] = useAtom(assetsAtom);

  useEffect(() => {
    const loadFees = async () => {
      try {
        const feesData = await getFees();
        setFees(feesData);
      } catch (error) {
        console.error("Failed to load fees:", error);
      }
    };

    loadFees();
  }, []);

  const issueNewAsset = async (data: IssueAssetParams): Promise<void> => {
    if (!wallet?.publicKey) {
      toast.error("Please connect your wallet");
      return;
    }

    const balance = await fetchBalance(wallet.publicKey);
    if (balance.balance < fees.assetIssuanceFee) {
      toast.error("Insufficient balance");
      return;
    }

    // check duplicate asset
    const asset = assets.find((asset: any) => asset.name === data.assetName && asset.issuerId === wallet.publicKey);
    if (asset) {
      toast.error("Asset already exists");
      return;
    }

    setIsSubmitting(true);
    try {
      const tickInfo = await fetchTickInfo();

      const assetNameValue = valueOfAssetName(data.assetName);
      const unitOfMeasurementValue = formatUnitOfMeasurement(data.unitOfMeasurement);

      const tx = await issueAsset(wallet.publicKey, fees.assetIssuanceFee, tickInfo.tick + settings.tickOffset, {
        assetName: assetNameValue,
        numberOfShares: BigInt(data.numberOfShares),
        unitOfMeasurement: unitOfMeasurementValue,
        numberOfDecimalPlaces: data.numberOfDecimalPlaces,
      });

      const signedTx = await getSignedTx(tx);
      const res = await broadcastTx(signedTx.tx);
      
      const decodedTx = decodeUint8ArrayTx(signedTx.tx);
      const targetTick = decodedTx.tick;

      const checker = async () => {
        const assets = await fetchOwnedAssets(wallet.publicKey);
        return assets.some(
          (asset: any) =>
            asset.asset === data.assetName &&
            asset.issuerId === wallet.publicKey &&
            Number(asset.amount) === Number(data.numberOfShares),
        );
      };

      if (res.transactionId) {
        toast.success("Transaction sent successfully");
        startMonitoring(`issue-asset-${data.assetName}-${targetTick}`, {
          checker,
          onSuccess: async () => {
            toast.success(`Asset ${data.assetName} issued successfully`);
            setRefetch((prev) => !prev);
          },
          onFailure: async () => {
            toast.error("Transaction failed");
          },
          targetTick,
        });
      } else {
        toast.error("Transaction broadcast failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    issueNewAsset,
    isSubmitting,
    fees,
  };
};

export default useIssueAsset;

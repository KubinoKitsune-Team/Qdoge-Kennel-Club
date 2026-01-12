import { QubicTransaction } from "@qubic-lib/qubic-ts-library/dist/qubic-types/QubicTransaction";
import { PublicKey } from "@qubic-lib/qubic-ts-library/dist/qubic-types/PublicKey";
import { Long } from "@qubic-lib/qubic-ts-library/dist/qubic-types/Long";
import { DynamicPayload } from "@qubic-lib/qubic-ts-library/dist/qubic-types/DynamicPayload";
import { Signature } from "@qubic-lib/qubic-ts-library/dist/qubic-types/Signature";
import {
  PUBLIC_KEY_LENGTH,
  SIGNATURE_LENGTH,
} from "@qubic-lib/qubic-ts-library/dist/crypto";

// Convert Uint8Array to hex string
export const byteArrayToHexString = (byteArray: any[]) => {
  const hexString = Array.from(byteArray, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return hexString;
};

export const uint8ArrayToBase64 = (uint8Array: Uint8Array): string => {
  const binaryString = String.fromCharCode.apply(null, Array.from(uint8Array));
  return btoa(binaryString);
};

export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  return new Uint8Array(binaryString.split("").map((char) => char.charCodeAt(0)));
};

export const createDataView = (size: number): { buffer: ArrayBuffer; view: DataView } => {
  const buffer = new ArrayBuffer(size);
  return { buffer, view: new DataView(buffer) };
};

export const decodeUint8ArrayTx = (tx: Uint8Array) => {
  const new_tx = new QubicTransaction();
  const inputSize =
    new DataView(tx.slice(PUBLIC_KEY_LENGTH * 2 + 14, PUBLIC_KEY_LENGTH * 2 + 16).buffer).getUint16(0, true) || 0;
  const payloadStart = PUBLIC_KEY_LENGTH * 2 + 16;
  const payloadEnd = payloadStart + inputSize;
  const signatureEnd = payloadEnd + SIGNATURE_LENGTH;

  new_tx
    .setSourcePublicKey(new PublicKey(tx.slice(0, PUBLIC_KEY_LENGTH)))
    .setDestinationPublicKey(new PublicKey(tx.slice(PUBLIC_KEY_LENGTH, PUBLIC_KEY_LENGTH * 2)))
    .setAmount(new Long(tx.slice(PUBLIC_KEY_LENGTH * 2, PUBLIC_KEY_LENGTH * 2 + 8)))
    .setTick(new DataView(tx.slice(PUBLIC_KEY_LENGTH * 2 + 8, PUBLIC_KEY_LENGTH * 2 + 12).buffer).getUint32(0, true))
    .setInputType(
      new DataView(tx.slice(PUBLIC_KEY_LENGTH * 2 + 12, PUBLIC_KEY_LENGTH * 2 + 14).buffer).getUint16(0, true),
    )
    .setInputSize(inputSize);

  if (inputSize > 0) {
    const payload = new DynamicPayload(inputSize);
    payload.setPayload(tx.slice(payloadStart, payloadEnd));
    new_tx.setPayload(payload);
  }
  new_tx.signature = new Signature(tx.slice(payloadEnd, signatureEnd));

  return new_tx;
};

interface ICreatePayload {
  data: number | bigint | Uint8Array;
  type: "uint8" | "uint16" | "uint32" | "bigint64" | "id";
}

export const createPayload = (data: ICreatePayload[]) => {
  const TYPE_SIZES = {
    uint8: 1,
    uint16: 2,
    uint32: 4,
    bigint64: 8,
    id: 32,
  };

  const totalSize = data.reduce((acc, { type }) => acc + TYPE_SIZES[type], 0);
  const dynamicPayload = new DynamicPayload(totalSize);

  const { buffer, view } = createDataView(totalSize);

  let offset = 0;
  const setters = {
    uint8: (v: DataView, o: number, d: number) => {
      v.setUint8(o, d);
      return 1;
    },
    uint16: (v: DataView, o: number, d: number) => {
      v.setUint16(o, d, true);
      return 2;
    },
    uint32: (v: DataView, o: number, d: number) => {
      v.setUint32(o, d, true);
      return 4;
    },
    bigint64: (v: DataView, o: number, d: number) => {
      v.setBigUint64(o, BigInt(d), true);
      return 8;
    },
    id: (v: DataView, o: number, d: Uint8Array) => {
      const bytes = new Uint8Array(d);
      for (let i = 0; i < 32; i++) {
        v.setUint8(o + i, bytes[i] || 0);
      }
      return 32;
    },
  };

  data.forEach(({ type, data: value }) => {
    if (type === 'id') {
      offset += setters[type](view, offset, value as Uint8Array);
    } else {
      offset += setters[type](view, offset, value as number);
    }
  });

  const result = new Uint8Array(buffer);
  dynamicPayload.setPayload(result);

  return dynamicPayload;
};

export const generateSeed = (): string => {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const letterSize = letters.length;
  let seed = "";
  for (let i = 0; i < 55; i++) {
    seed += letters[Math.floor(Math.random() * letterSize)];
  }
  return seed;
};

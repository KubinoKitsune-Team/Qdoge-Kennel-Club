import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchOwnedAssets, fetchBalance } from "@/services/rpc.service";
import { Badge } from "@/components/ui/badge";
import { FaUnlink, FaArrowDown, FaArrowUp, FaCubes, FaKey } from "react-icons/fa";
import { MdAccountBalance } from "react-icons/md";
import { BiCoinStack } from "react-icons/bi";
import { RiExchangeFundsFill } from "react-icons/ri";
import { Balance } from "@/types";

interface AccountStatusProps {
  address: string;
}

const AccountStatus: React.FC<AccountStatusProps> = ({ address }) => {
  const [balance, setBalance] = useState<Balance>();
  const [ownedAssets, setOwnedAssets] = useState<any[]>([]);

  useEffect(() => {
    if (address) {
      fetchOwnedAssets(address).then((assets) => setOwnedAssets(assets));
      fetchBalance(address).then((balance) => setBalance(balance));
    }
  }, [address]);

  if (!address) {
    return (
      <Card className="border-0 bg-transparent p-4 shadow-sm">
        <CardContent className="p-0 text-center">
          <div className="flex items-center justify-center gap-2">
            <FaUnlink className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Please connect your wallet to view account status</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const qubicBalance = Number(balance?.balance) || 0;
  const incomingTransfers = Number(balance?.numberOfIncomingTransfers) || 0;
  const outgoingTransfers = Number(balance?.numberOfOutgoingTransfers) || 0;

  return (
    <Card className="border-0 bg-transparent shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FaKey className="text-blue-500" />
            <span className="text-muted-foreground">Address:</span>
            <span className="max-w-[120px] truncate font-mono text-xs" title={address}>
              {address.substring(0, 6)}...{address.substring(address.length - 6)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MdAccountBalance className="text-green-500" />
            <span className="text-muted-foreground">Balance:</span>
            <span className="font-semibold">{qubicBalance.toLocaleString()} QUBIC</span>
          </div>

          <div className="flex items-center gap-2">
            <RiExchangeFundsFill className="text-purple-500" />
            <span className="text-muted-foreground">Tx:</span>
            <span className="font-semibold">
              {incomingTransfers}
              <FaArrowDown className="ml-1 inline text-green-500" /> {outgoingTransfers}
              <FaArrowUp className="ml-1 inline text-red-500" />
            </span>
          </div>

          {ownedAssets.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <FaCubes className="text-amber-500" />
              <span className="text-muted-foreground">Assets:</span>
              <div className="flex flex-wrap gap-1">
                {ownedAssets.map((asset, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1 text-xs">
                    <BiCoinStack className="text-amber-400" />
                    {asset.asset}: {asset.amount.toLocaleString()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountStatus;

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/utils";
import { Link } from "react-router-dom";
import { EXPLORER_URL } from "@/constants";
import { Trade } from "@/types";
import { useEffect, useState } from "react";
import { fetchEntityTrades } from "@/services/api.service";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface UserTradeHistoryProps {
  address: string;
}

const UserTradeHistory: React.FC<UserTradeHistoryProps> = ({ address }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const trades = await fetchEntityTrades(address);
        setTrades(trades);
      } catch (error) {
        console.error("Failed to fetch trades:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, [address]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (trades.length === 0) {
    return <div className="py-4 text-center text-gray-500">No trade history found</div>;
  }

  // Calculate pagination
  const totalPages = Math.ceil(trades.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTrades = trades.slice(indexOfFirstItem, indexOfLastItem);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>TxID</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentTrades.map((trade, index) => (
            <TableRow key={index}>
              <TableCell>{trade.assetName || "QX"}</TableCell>
              <TableCell className={cn(trade.bid ? "text-green-500" : "text-red-500")}>
                {trade.price.toLocaleString()}
              </TableCell>
              <TableCell>{trade.numberOfShares}</TableCell>
              <TableCell className="max-w-[150px] truncate">
                <Link
                  to={`${EXPLORER_URL}/network/tx/${trade.transactionHash}`}
                  target="_blank"
                  className="text-blue-500 hover:underline"
                >
                  {trade.transactionHash}
                </Link>
              </TableCell>
              <TableCell>{new Date(trade.tickTime).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, trades.length)} of {trades.length} trades
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserTradeHistory;

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiKey, FiEye, FiEyeOff, FiCheck, FiAlertCircle } from "react-icons/fi";
import { MdOutlineAirplanemodeActive } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { fetchEpochs, setEpochTotalAirdrop, setEpochThreshold, Epoch } from "@/services/backend.service";

export const ADMIN_API_KEY_STORAGE_KEY = "qdoge_admin_api_key";

export const getAdminApiKey = (): string | null => {
  return localStorage.getItem(ADMIN_API_KEY_STORAGE_KEY);
};

const AdminPanel: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  
  // Epoch settings
  const [epochs, setEpochs] = useState<Epoch[]>([]);
  const [selectedEpoch, setSelectedEpoch] = useState<number | null>(null);
  const [totalAirdrop, setTotalAirdrop] = useState("");
  const [threshold, setThreshold] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load saved API key
  useEffect(() => {
    const savedKey = localStorage.getItem(ADMIN_API_KEY_STORAGE_KEY);
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Load epochs
  useEffect(() => {
    const loadEpochs = async () => {
      try {
        const data = await fetchEpochs();
        setEpochs(data);
        if (data.length > 0) {
          setSelectedEpoch(data[0].epoch_num);
          setTotalAirdrop(data[0].total_airdrop);
        }
      } catch (err) {
        console.error("Failed to load epochs:", err);
      }
    };
    loadEpochs();
  }, []);

  // Update form when epoch changes
  useEffect(() => {
    const epoch = epochs.find((e) => e.epoch_num === selectedEpoch);
    if (epoch) {
      setTotalAirdrop(epoch.total_airdrop);
    }
  }, [selectedEpoch, epochs]);

  const handleSaveApiKey = () => {
    localStorage.setItem(ADMIN_API_KEY_STORAGE_KEY, apiKey);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleSetTotalAirdrop = async () => {
    if (!selectedEpoch || !apiKey) {
      setError("Please select an epoch and enter API key");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await setEpochTotalAirdrop(selectedEpoch, parseInt(totalAirdrop), apiKey);
      setSuccess(`Total airdrop set to ${totalAirdrop} for epoch ${selectedEpoch}`);
      // Refresh epochs
      const data = await fetchEpochs();
      setEpochs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set total airdrop");
    } finally {
      setLoading(false);
    }
  };

  const handleSetThreshold = async () => {
    if (!selectedEpoch || !apiKey) {
      setError("Please select an epoch and enter API key");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await setEpochThreshold(selectedEpoch, parseInt(threshold), apiKey);
      setSuccess(`Threshold set to ${threshold} for epoch ${selectedEpoch}`);
      // Refresh epochs
      const data = await fetchEpochs();
      setEpochs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set threshold");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* API Key Section */}
      <Card className="border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-yellow-600 dark:text-yellow-500">
            <FiKey className="h-5 w-5" />
            Admin API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter your admin API key to access admin features.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter admin API key"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>
            <Button onClick={handleSaveApiKey} variant={keySaved ? "default" : "outline"} className="min-w-[80px]">
              {keySaved ? (
                <>
                  <FiCheck className="mr-1 h-4 w-4" />
                  Saved
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Epoch Settings Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <MdOutlineAirplanemodeActive className="h-5 w-5 text-blue-600" />
            Epoch Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Epoch Selector */}
          <div className="space-y-2">
            <Label>Select Epoch</Label>
            <select
              value={selectedEpoch || ""}
              onChange={(e) => setSelectedEpoch(parseInt(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {epochs.map((epoch) => (
                <option key={epoch.epoch_num} value={epoch.epoch_num}>
                  Epoch {epoch.epoch_num} {epoch.is_ongoing ? "(Ongoing)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Total Airdrop Input */}
          <div className="space-y-2">
            <Label>Total Airdrop Amount</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={totalAirdrop}
                onChange={(e) => setTotalAirdrop(e.target.value)}
                placeholder="Enter total airdrop amount"
              />
              <Button onClick={handleSetTotalAirdrop} disabled={loading} className="min-w-[100px]">
                {loading ? <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" /> : "Set"}
              </Button>
            </div>
          </div>

          {/* Threshold Input */}
          <div className="space-y-2">
            <Label>Threshold (Minimum Buy Amount)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="Enter threshold amount"
              />
              <Button onClick={handleSetThreshold} disabled={loading} className="min-w-[100px]">
                {loading ? <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" /> : "Set"}
              </Button>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30">
              <FiAlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-600 dark:bg-green-950/30">
              <FiCheck className="h-4 w-4" />
              {success}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { settingsAtom } from "@/store/settings";
import { useQubicConnect } from "@/components/connect/QubicConnectContext";
import { fetchUserInfo } from "@/services/backend.service";
import { FiKey, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";
import ThemeSelector from "./ThemeSelector";

export const ADMIN_API_KEY_STORAGE_KEY = "qdoge_admin_api_key";

// Helper to get admin API key from localStorage
export const getAdminApiKey = (): string | null => {
  return localStorage.getItem(ADMIN_API_KEY_STORAGE_KEY);
};

const SettingPanel: React.FC = () => {
  const [settings, setSettings] = useAtom(settingsAtom);
  const { wallet } = useQubicConnect();
  const [isAdmin, setIsAdmin] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const address = wallet?.publicKey;

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!address) {
        setIsAdmin(false);
        return;
      }
      try {
        const userInfo = await fetchUserInfo(address);
        setIsAdmin(userInfo.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdminRole();
  }, [address]);

  // Load saved API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem(ADMIN_API_KEY_STORAGE_KEY);
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem(ADMIN_API_KEY_STORAGE_KEY, apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="emailNotifications" className="font-medium">
            Email Notifications
          </Label>
          <p className="text-sm text-gray-500">Receive updates via email</p>
        </div>
        <Switch
          id="emailNotifications"
          checked={settings.notifications}
          onCheckedChange={(checked) => setSettings({ notifications: checked })}
        />
      </div>
      <Separator /> */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="darkMode" className="font-medium">
            Dark Mode
          </Label>
          <p className="text-sm text-gray-500">Toggle dark mode appearance</p>
        </div>
        <Switch
          id="darkMode"
          checked={settings.darkMode}
          onCheckedChange={(checked) => setSettings({ darkMode: checked })}
        />
      </div>

      <ThemeSelector />
      <Separator />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="tickOffset" className="font-medium">
              Tick Offset
            </Label>
            <p className="text-sm text-gray-500">Current value: {settings.tickOffset}</p>
          </div>
          <span className="text-sm font-medium">{settings.tickOffset}</span>
        </div>
        <Slider
          id="tickOffset"
          min={5}
          max={15}
          step={1}
          value={[settings.tickOffset]}
          onValueChange={(value) => setSettings({ tickOffset: value[0] })}
          className="w-full"
        />
      </div>

      {/* Admin API Key Section - Only visible to admin users */}
      {isAdmin && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FiKey className="h-4 w-4 text-yellow-500" />
              <Label className="font-medium text-yellow-500">Admin API Key</Label>
            </div>
            <p className="text-sm text-gray-500">
              Enter your admin API key to access admin-only features like setting epoch airdrop amounts.
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
              <Button onClick={handleSaveApiKey} variant={saved ? "default" : "outline"} className="min-w-[80px]">
                {saved ? (
                  <>
                    <FiCheck className="mr-1 h-4 w-4" />
                    Saved
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SettingPanel;

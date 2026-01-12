import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useAtom } from "jotai";
import { settingsAtom } from "@/store/settings";
import ThemeSelector from "./ThemeSelector";

const SettingPanel: React.FC = () => {
  const [settings, setSettings] = useAtom(settingsAtom);

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
    </div>
  );
};

export default SettingPanel;

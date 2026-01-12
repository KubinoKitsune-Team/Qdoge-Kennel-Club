import { useAtom } from "jotai";
import { settingsAtom } from "@/store/settings";
import { THEME_LIST } from "@/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ThemeSelector = () => {
  const [settings, setSettings] = useAtom(settingsAtom);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="theme-selector" className="text-sm font-medium">
        Theme
      </label>
      <Select value={settings.theme} onValueChange={(theme) => setSettings({ theme })}>
        <SelectTrigger id="theme-selector" className="w-full">
          <SelectValue placeholder="Select a theme" />
        </SelectTrigger>
        <SelectContent>
          {THEME_LIST.map((theme) => (
            <SelectItem key={theme.value} value={theme.value}>
              {theme.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ThemeSelector;

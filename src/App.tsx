import { useAtom } from "jotai";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import { QubicConnectProvider } from "./components/connect/QubicConnectContext";
import { WalletConnectProvider } from "./components/connect/WalletConnectContext";
import router from "./router";
import { settingsAtom } from "./store/settings";
import { useEffect } from "react";
import { THEME_LIST } from "./constants";

const App: React.FC = () => {
  const [settings] = useAtom(settingsAtom);

  useEffect(() => {
    document.documentElement.classList.forEach((className) => {
      if (THEME_LIST.some((theme) => theme.value === className)) {
        document.documentElement.classList.remove(className);
      }
    });

    if (settings.theme !== "default") {
      document.documentElement.classList.add(settings.theme);
    }

    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.theme, settings.darkMode]);

  return (
    <div className={"bg-background text-foreground"}>
      <WalletConnectProvider>
        <QubicConnectProvider>
          <RouterProvider router={router} />
          <Toaster
            position="top-right"
            toastOptions={{
              className: "!bg-card !text-card-foreground !border-border !border",
            }}
          />
        </QubicConnectProvider>
      </WalletConnectProvider>
    </div>
  );
};

export default App;

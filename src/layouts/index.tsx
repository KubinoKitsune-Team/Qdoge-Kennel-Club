import { Outlet } from "react-router-dom";
import Header from "@/layouts/Header";
import Footer from "@/layouts/Footer";
import useAPIFetcher from "@/hooks/useAPIFetcher";
import useRPCFetcher from "@/hooks/useRPCFetcher";
import { useContext } from "react";
import { useEffect } from "react";
import { useQubicConnect } from "@/components/connect/QubicConnectContext";
import { MetaMaskContext } from "@/components/connect/MetamaskContext";
import useGlobalTxMonitor from "@/hooks/useGlobalTxMonitor";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";

const Layout: React.FC = () => {
  const [state] = useContext(MetaMaskContext);
  const { mmSnapConnect, connect } = useQubicConnect();
  useRPCFetcher();
  useAPIFetcher();
  useGlobalTxMonitor();
  useNotificationSocket();

  useEffect(() => {
    const storedWallet = localStorage.getItem("wallet");
    if (storedWallet) {
      connect(JSON.parse(storedWallet));
    } else if (state.installedSnap) {
      mmSnapConnect();
    }
  }, [state]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 pt-[56px] justify-center">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;

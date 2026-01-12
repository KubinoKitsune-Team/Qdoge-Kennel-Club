import { MdLock, MdLockOpen } from "react-icons/md";
import ConnectModal from "./ConnectModal";
import { useQubicConnect } from "./QubicConnectContext";

const ConnectLink: React.FC<{ darkMode?: boolean }> = ({ darkMode }) => {
  const { connected, showConnectModal, toggleConnectModal } = useQubicConnect();

  return (
    <>
      <div
        className="flex cursor-pointer items-center justify-center gap-[10px] p-2 text-foreground hover:text-primary"
        onClick={() => toggleConnectModal()}
      >
        {connected ? (
          <>
            {/* <span className="mt-[5px] font-space text-[16px] font-[500] text-foreground">Connected</span> */}
            <MdLock size={20} />
          </>
        ) : (
          <>
            {/* <span className="mt-[5px] font-space text-[16px] font-[500] text-foreground">Connect Wallet</span> */}
            <MdLockOpen size={20} />
          </>
        )}
      </div>
      <ConnectModal open={showConnectModal} onClose={() => toggleConnectModal()} darkMode={darkMode} />
    </>
  );
};

export default ConnectLink;

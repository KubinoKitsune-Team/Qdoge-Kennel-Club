import MetaMaskLogo from "@/assets/metamask.svg";
import QubicConnectLogoDark from "@/assets/qubic-connect-dark.svg";
import QubicConnectLogo from "@/assets/qubic-connect.svg";
import WalletConnectLogo from "@/assets/wallet-connect.svg";
import { generateQRCode } from "@/utils/index.ts";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { HeaderButtons } from "./Buttons";
import { MetaMaskContext } from "./MetamaskContext.tsx";
import { useQubicConnect } from "./QubicConnectContext";
import { Account } from "./types";
import { useWalletConnect } from "./WalletConnectContext.tsx";
import AccountSelector from "../ui/AccountSelector.tsx";

export enum MetamaskActions {
  SetInstalled = "SetInstalled",
  SetSnapsDetected = "SetSnapsDetected",
  SetError = "SetError",
  SetIsFlask = "SetIsFlask",
}

const ConnectModal = ({ open, onClose, darkMode }: { open: boolean; onClose: () => void; darkMode?: boolean }) => {
  const [state] = useContext(MetaMaskContext);

  const [selectedMode, setSelectedMode] = useState("none");
  // Private seed handling
  const [privateSeed, setPrivateSeed] = useState("");
  const [errorMsgPrivateSeed, setErrorMsgPrivateSeed] = useState("");
  // Vault file handling
  // const [vault] = useState(new QubicVault());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  // Context connect handling
  const { connect, disconnect, connected, mmSnapConnect, privateKeyConnect, vaultFileConnect } = useQubicConnect();
  // account selection
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState(0);
  // WC
  const [qrCode, setQrCode] = useState<string>("");
  const [connectionURI, setConnectionURI] = useState<string>("");
  const { connect: walletConnectConnect, isConnected, requestAccounts } = useWalletConnect();

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const generateURI = async () => {
    const { uri, approve } = await walletConnectConnect();
    setConnectionURI(uri);
    const result = await generateQRCode(uri);
    setQrCode(result);
    await approve();
  };

  useEffect(() => {
    if (isConnected) {
      const fetchAccounts = async () => {
        const accounts = await requestAccounts();
        setAccounts(
          accounts.map((account) => ({
            publicId: account.address,
            alias: account.name,
          })),
        );
        setSelectedMode("account-select");
      };
      fetchAccounts();
    }
  }, [isConnected]);

  // check if input is valid seed (55 chars and only lowercase letters)
  const privateKeyValidate = (pk: string) => {
    if (pk.length !== 55) {
      setErrorMsgPrivateSeed("Seed must be 55 characters long");
    }
    if (pk.match(/[^a-z]/)) {
      setErrorMsgPrivateSeed("Seed must contain only lowercase letters");
    }
    if (pk.length === 55 && !pk.match(/[^a-z]/)) {
      setErrorMsgPrivateSeed("");
    }
    setPrivateSeed(pk);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value.toString());

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="bg-smoke-light fixed left-0 top-0 z-50 flex h-full w-full overflow-y-auto overflow-x-hidden p-5"
          onClick={() => {
            setSelectedMode("none");
            onClose();
          }}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="relative m-auto flex w-full max-w-md flex-col"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <Card className="bg-background p-8 text-foreground">
              <motion.div className="flex items-center justify-between" variants={contentVariants}>
                <img
                  src={darkMode ? QubicConnectLogo : QubicConnectLogoDark}
                  alt="Qubic Connect Logo"
                  className="h-6"
                />
                <IoClose onClick={onClose} className="h-5 w-5 cursor-pointer" />
              </motion.div>

              <AnimatePresence mode="wait">
                {selectedMode === "none" && (
                  <motion.div
                    className="mt-4 flex flex-col gap-4"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {connected && (
                      <Button variant="default" className="mt-4" onClick={() => disconnect()}>
                        Disconnect Wallet
                      </Button>
                    )}
                    {!connected && (
                      <>
                        <Button
                          variant="default"
                          className="mt-4 flex items-center justify-center gap-3"
                          onClick={() => setSelectedMode("metamask")}
                        >
                          <img src={MetaMaskLogo} alt="MetaMask Logo" className="h-8 w-8" />
                          <span className="w-32">MetaMask</span>
                        </Button>
                        <Button
                          variant="default"
                          className="flex items-center justify-center gap-3"
                          onClick={() => {
                            generateURI();
                            setSelectedMode("walletconnect");
                          }}
                        >
                          <img src={WalletConnectLogo} alt="Wallet Connect Logo" className="h-8 w-8" />
                          <span className="w-32">Wallet Connect</span>
                        </Button>
                        {/* <div className="my-2 flex w-full items-center justify-center">
                          <div className="flex-grow border-t border-gray-300"></div>
                          <span className="px-4 text-red-500">
                            <AlertTriangle className="mr-2 inline-block" /> BE CAREFUL!
                          </span>
                          <div className="flex-grow border-t border-gray-300"></div>
                        </div>
                        <Button variant="default" onClick={() => setSelectedMode("private-seed")}>
                          Private Seed
                        </Button>
                        <Button variant="default" onClick={() => setSelectedMode("vault-file")}>
                          Vault File
                        </Button> */}
                      </>
                    )}
                  </motion.div>
                )}

                {selectedMode === "private-seed" && (
                  <motion.div
                    className="mt-4 space-y-2"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    Your 55 character private key (seed):
                    <Input type="text" value={privateSeed} onChange={(e) => privateKeyValidate(e.target.value)} />
                    {errorMsgPrivateSeed && <p className="text-red-500">{errorMsgPrivateSeed}</p>}
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="default" onClick={() => setSelectedMode("none")}>
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => {
                          privateKeyConnect(privateSeed);
                          setSelectedMode("none");
                          setPrivateSeed("");
                          onClose();
                        }}
                      >
                        Unlock
                      </Button>
                    </div>
                  </motion.div>
                )}

                {selectedMode === "vault-file" && (
                  <motion.div
                    className="mt-4 space-y-2"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    Load your Qubic vault file:
                    <Input type="file" onChange={handleFileChange} />
                    <Input type="password" placeholder="Enter password" onChange={handlePasswordChange} />
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="default" onClick={() => setSelectedMode("none")}>
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        onClick={async () => {
                          if (!selectedFile) {
                            alert("Please select a file.");
                            return;
                          }
                          const vault = await vaultFileConnect(selectedFile, password);
                          setAccounts(vault.getSeeds());
                          setSelectedMode("account-select");
                        }}
                      >
                        Unlock
                      </Button>
                    </div>
                  </motion.div>
                )}

                {selectedMode === "account-select" && (
                  <motion.div
                    className="mt-4 text-[rgba(128,139,155,1)]"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    Select an account:
                    <AccountSelector
                      label={"Account"}
                      options={accounts.map((account, idx) => ({
                        label: account.alias || `Account ${idx + 1}`,
                        value: account.publicId,
                      }))}
                      selected={selectedAccount}
                      setSelected={setSelectedAccount}
                    />
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <Button
                        variant="default"
                        className="mt-4"
                        onClick={() => {
                          disconnect();
                          setSelectedMode("none");
                        }}
                      >
                        Lock Wallet
                      </Button>
                      <Button
                        variant="default"
                        className="mt-4"
                        onClick={() => {
                          connect({
                            connectType: "walletconnect",
                            publicKey: accounts[parseInt(selectedAccount.toString())]?.publicId,
                            alias: accounts[parseInt(selectedAccount.toString())]?.alias,
                          });
                          setSelectedMode("none");
                          onClose();
                        }}
                      >
                        Select Account
                      </Button>
                    </div>
                  </motion.div>
                )}

                {selectedMode === "metamask" && (
                  <motion.div
                    className="mt-4 text-[rgba(128,139,155,1)]"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    Connect your MetaMask wallet. You need to have MetaMask installed and unlocked.
                    <div className="mt-5 flex flex-col gap-2">
                      <HeaderButtons
                        state={state}
                        onConnectClick={() => {
                          mmSnapConnect();
                          setSelectedMode("none");
                          onClose();
                        }}
                      />
                      <Button variant="outline" className="text-primary-40" onClick={() => setSelectedMode("none")}>
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}

                {selectedMode === "walletconnect" && (
                  <motion.div
                    className="mt-4 text-[rgba(128,139,155,1)]"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    Connect your Qubic Wallet. You need to have Qubic Wallet installed and unlocked.
                    <div className="mt-5 flex flex-col gap-2">
                      <div className="min-w-54 min-h-54 flex flex-col items-center justify-center">
                        {qrCode ? (
                          <img src={qrCode} alt="Wallet Connect QR Code" className="w-54 h-54 mx-auto" />
                        ) : (
                          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-t-2 border-foreground"></div>
                        )}
                      </div>
                      <Button
                        variant="default"
                        className="flex items-center justify-center gap-3"
                        onClick={() => window.open(`qubic-wallet://pairwc/${connectionURI}`, "_blank")}
                        disabled={!connectionURI}
                      >
                        Open in Qubic Wallet
                      </Button>
                      <Button variant="outline" className="text-primary-40" onClick={() => setSelectedMode("none")}>
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectModal;

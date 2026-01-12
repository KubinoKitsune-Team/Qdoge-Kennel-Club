import { Button } from "@/components/ui/button";
import { MdClose } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string | React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ open, onClose, onConfirm, title, description, onCancel }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex justify-center items-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="min-w-[440px] bg-background p-6 rounded-lg shadow-lg flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h2 className="text-foreground text-2xl">{title}</h2>
                <MdClose onClick={onClose} className="text-foreground text-2xl cursor-pointer" />
              </div>
              <div className="text-gray-400">{description}</div>
            </div>

            <div className="flex py-2 gap-4">
              <Button
                className="w-1/2"
                onClick={() => {
                  onCancel?.();
                  onClose?.();
                }}
              >
                Cancel
              </Button>
              <Button
                className="w-1/2"
                onClick={() => {
                  onConfirm?.();
                  onClose?.();
                }}
              >
                Confirm
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;

import { copyText } from "@/utils";
import React, { useState } from "react";
import { MdCheck, MdContentCopy } from "react-icons/md";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils";

interface Option {
  label: string;
  value: string;
  [key: string]: any;
}

interface AccountSelectorProps {
  label?: string;
  options: Option[];
  selected: number;
  setSelected: (index: number) => void;
  showValue?: boolean;
  isLoading?: boolean;
  error?: string;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  label,
  options,
  selected,
  setSelected,
  showValue = true,
  isLoading = false,
  error,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (value: string) => {
    copyText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative w-full">
      {label && <Label className="mb-2 block">{label}</Label>}
      <div className={cn("relative rounded-lg transition-all duration-200", error ? "border-error-40" : "")}>
        <Select
          value={options[selected]?.value}
          onValueChange={(value) => {
            const index = options.findIndex((option) => option.value === value);
            if (index !== -1) setSelected(index);
          }}
          disabled={isLoading}
        >
          <SelectTrigger className={cn("w-full", error ? "border-error-40" : "")}>
            <SelectValue placeholder="Select an option">{options[selected]?.label || "Select an option"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((option, index) => (
              <SelectItem key={index} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showValue && options[selected] && (
          <div className="mt-2 flex items-center">
            <span className="break-all">{options[selected].value}</span>
            <div
              role="button"
              onClick={() => handleCopy(options[selected].value)}
              className="hover:bg-card-border ml-2 cursor-pointer rounded bg-card p-1 transition-colors"
            >
              {isCopied ? (
                <MdCheck className="h-4 w-4 text-success-40" />
              ) : (
                <MdContentCopy className="h-4 w-4 text-gray-50" />
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-right text-error-40">{error}</p>}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="border-primary-40 h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      )}
    </div>
  );
};

export default AccountSelector;

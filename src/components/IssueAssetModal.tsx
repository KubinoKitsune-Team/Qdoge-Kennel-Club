import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import useIssueAsset, { IssueAssetParams } from "@/hooks/useIssueAsset";

interface IssueAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Updated unit options with descriptions
// const UNIT_OPTIONS = [
//   { value: "0", label: "None", description: "No specific unit" },
//   { value: "1", label: "Piece", description: "Count of items" },
//   { value: "2", label: "Second", description: "Time (s)" },
//   { value: "3", label: "Byte", description: "Digital information" },
//   { value: "4", label: "Gram", description: "Mass (g)" },
//   { value: "5", label: "Meter", description: "Length (m)" },
//   { value: "6", label: "Joule", description: "Energy (kg·m²·s⁻²)" },
// ];

const IssueAssetModal: React.FC<IssueAssetModalProps> = ({ open, onOpenChange }) => {
  const { issueNewAsset, isSubmitting, fees } = useIssueAsset();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    // setValue,
    // watch,
  } = useForm<IssueAssetParams>({
    defaultValues: {
      assetName: "",
      numberOfShares: 0,
      unitOfMeasurement: "0",
      numberOfDecimalPlaces: 0,
    },
  });

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: IssueAssetParams) => {
    await issueNewAsset(data);
    onOpenChange(false);
  };

  // const handleUnitChange = (value: string) => {
  //   setValue("unitOfMeasurement", value);
  // };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Issue New Asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assetName" className="text-right">
                Asset Name
              </Label>
              <div className="col-span-3">
                <Input
                  id="assetName"
                  placeholder="MYASSET"
                  maxLength={7}
                  {...register("assetName", {
                    required: "Asset name is required",
                    pattern: {
                      value: /^[A-Z0-9]{1,7}$/,
                      message: "Asset name must be 1-7 uppercase letters or numbers",
                    },
                  })}
                  className={errors.assetName ? "border-error-40" : ""}
                />
                {errors.assetName && <p className="text-sm text-error-40">{errors.assetName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="numberOfShares" className="text-right">
                Number of Shares
              </Label>
              <div className="col-span-3">
                <Input
                  id="numberOfShares"
                  type="number"
                  placeholder="1000000"
                  {...register("numberOfShares", {
                    required: "Number of shares is required",
                    min: { value: 1, message: "Must be at least 1" },
                    valueAsNumber: true,
                  })}
                  className={errors.numberOfShares ? "border-error-40" : ""}
                />
                {errors.numberOfShares && <p className="text-sm text-error-40">{errors.numberOfShares.message}</p>}
              </div>
            </div>

            {/* <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unitOfMeasurement" className="text-right">
                Unit
              </Label>
              <div className="col-span-3">
                <Select value={watch("unitOfMeasurement")} onValueChange={handleUnitChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <span className="font-medium">{option.label}</span>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div> */}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="numberOfDecimalPlaces" className="text-right">
                Decimal Places
              </Label>
              <div className="col-span-3">
                <Input
                  id="numberOfDecimalPlaces"
                  type="number"
                  placeholder="0"
                  min={0}
                  max={18}
                  {...register("numberOfDecimalPlaces", {
                    required: "Decimal places is required",
                    min: { value: 0, message: "Minimum 0" },
                    max: { value: 18, message: "Maximum 18" },
                    valueAsNumber: true,
                  })}
                  className={errors.numberOfDecimalPlaces ? "border-error-40" : ""}
                />
                {errors.numberOfDecimalPlaces && (
                  <p className="text-sm text-error-40">{errors.numberOfDecimalPlaces.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Fee</Label>
              <div className="col-span-3">
                <p>{fees.assetIssuanceFee.toLocaleString()} QUBIC</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Issuing..." : "Issue Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IssueAssetModal;

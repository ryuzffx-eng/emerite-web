import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const variantStyles = {
    danger: "bg-red-500/15 border-red-500/40",
    warning: "bg-yellow-500/15 border-yellow-500/40",
    info: "bg-emerald-500/15 border-emerald-500/40",
  };

  const confirmButtonVariant = variant === "danger" ? "destructive" : "default";

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px] border-zinc-800 bg-zinc-950 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${variantStyles[variant]}`}>
              <AlertTriangle className={`h-5 w-5 ${variant === "danger" ? "text-red-400" :
                  variant === "warning" ? "text-yellow-400" :
                    "text-emerald-400"
                }`} />
            </div>
            <DialogTitle className="text-white">{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-zinc-400">{description}</DialogDescription>
        </DialogHeader>

        <div className={`p-4 rounded-lg border ${variantStyles[variant]}`}>
          <p className="text-sm font-medium text-zinc-200">{message}</p>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmButtonVariant}
            onClick={onConfirm}
            disabled={isLoading}
            className={confirmButtonVariant === "destructive" ? "bg-red-600 hover:bg-red-700" : "bg-[#3ECF8E] hover:bg-[#34b27b] text-zinc-900 font-bold"}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

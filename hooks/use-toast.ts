import { useState } from "react";
import type { ToastProps } from "@/components/ui/toast";

export function useToast() {
  const [toastState, setToastState] = useState<ToastProps | null>(null);

  const toast = ({
    title,
    description,
  }: Pick<ToastProps, "title" | "description">) => {
    setToastState({ title, description, open: true });
    setTimeout(() => setToastState(null), 3000);
  };

  return {
    toast,
    toastState,
  };
}

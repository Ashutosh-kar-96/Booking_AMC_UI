import { useRef } from "react";
import { Toast } from "bootstrap";

const useToast = () => {
  const toastRef = useRef(null);

  const showToast = (message, type = "success") => {
    if (!toastRef.current) return;

    // Change background color dynamically
    toastRef.current.className =
      `toast align-items-center text-bg-${type} border-0`;

    // Update message
    const body = toastRef.current.querySelector(".toast-body");
    if (body) {
      body.textContent = message;
    }

    // Initialize and show
    const toast = Toast.getOrCreateInstance(toastRef.current);
    toast.show();
  };

  return { toastRef, showToast };
};

export default useToast;
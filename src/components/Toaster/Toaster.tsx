import React from "react";
import { ToastContainer, ToastContentProps, toast, Slide } from "react-toastify";
import { ToasterType } from "./Types/Toaster.types.tsx";
import "./Toaster.css";

const Toaster: React.FC = () => {
  return (
    <ToastContainer pauseOnHover hideProgressBar limit={1} transition={Slide} />
  );
};

export const showToast = (
  message: string,
  type: ToasterType,
  navigate?: (path: string) => void,
  navigateTo?: string
) => {
  toast(({ closeToast }: ToastContentProps) => (
    <div className="toaster">
      <div className="toaster-content">
        {type === "success" && <div className="ic-success" />}
        {type === "error" && <div className="ic-error" />}
        <div className="message">{message}</div>
      </div>
      <button
        className="ic-close"
        onClick={() => {
          closeToast();
          if (navigateTo && navigate) navigate(navigateTo);
        }}
      >
      </button>
    </div>
  ), {
    type,
    icon: false,
    autoClose: type === "info" ? false : 2000, 
    onClose: () => {
      if (navigateTo && navigate) {
        setTimeout(() => navigate(navigateTo), 100); 
      }
    }
  });
};

export default Toaster;

import { toast } from "react-hot-toast";

export const showToast = (type: "success" | "error", message: string) => {
  toast.dismiss();

  toast[type](message, {
    style: {
      border: "1px solid rgb(229 231 235)",
      padding: "16px",
      color: "black"
    },
    iconTheme: {
      primary: type === "success" ? "green" : "red",
      secondary: "rgb(229 231 235)"
    }
  });
};

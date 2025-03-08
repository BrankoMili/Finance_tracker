import { FC, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  buttonWidth?: "fullWidth" | "compact";
  buttonSize?: "regular" | "small";
  buttonHeight?: "regular" | "high";
  buttonColor?: "regular" | "gray" | "red" | "noBackground";
}

export const Button: FC<ButtonProps> = ({
  text,
  buttonWidth = "fullWidth",
  buttonSize = "regular",
  buttonHeight = "regular",
  buttonColor = "regular",
  ...props
}) => {
  const buttonWidthStyle = {
    fullWidth: "w-full",
    compact: ""
  };

  const buttonSizeStyle = {
    regular: "text-base",
    small: "text-sm"
  };

  const buttonHeightStyle = {
    regular: "",
    high: "h-12"
  };

  const buttonColorStyle = {
    regular:
      "bg-secondary text-white hover:bg-thirdly py-2 rounded-lg focus:ring-2 focus:primary focus:ring-offset-2 px-2",
    gray: "bg-gray-200 text-gray-700 hover:bg-gray-300 py-2 rounded-lg focus:ring-2 focus:primary focus:ring-offset-2 px-2",
    red: "bg-red-500 text-white hover:bg-red-600 py-2 rounded-lg focus:ring-2 focus:primary focus:ring-offset-2 px-2",
    noBackground: "text-primary hover:text-secondary font-medium "
  };

  return (
    <button
      {...props}
      className={`${buttonWidthStyle[buttonWidth]} ${buttonSizeStyle[buttonSize]} ${buttonColorStyle[buttonColor]} ${buttonHeightStyle[buttonHeight]} transition-all`}
    >
      {text}
    </button>
  );
};

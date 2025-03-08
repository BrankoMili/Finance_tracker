import { FC, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  textSize?: "regular" | "small";
  height?: "regular" | "high";
}

const TextSizeStyle = {
  regular: "text-base",
  small: "text-sm"
};

const HeighthStyle = {
  regular: "h-10",
  high: "h-12"
};

export const InputTextNumberPass: FC<InputProps> = ({
  textSize = "regular",
  height = "regular",
  ...props
}) => {
  return (
    <input
      {...props}
      className={`${TextSizeStyle[textSize]} ${HeighthStyle[height]} w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pl-3`}
    />
  );
};

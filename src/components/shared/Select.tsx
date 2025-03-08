import { FC, SelectHTMLAttributes } from "react";

interface InputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  textSize?: "regular" | "small";
}

const TextSizeStyle = {
  regular: "text-base",
  small: "text-sm"
};

export const Select: FC<InputProps> = ({ textSize = "regular", ...props }) => {
  return (
    <select
      {...props}
      className={`${TextSizeStyle[textSize]} w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pl-3 appearance-none pr-10 bg-no-repeat bg-[right_3px_center] bg-[length:20px_20px]`}
      style={{
        backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2333343d'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E")`
      }}
    />
  );
};

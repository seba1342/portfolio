import * as React from "react";
import { TextProps } from "./types";

export default function Body({ children, className = "" }: TextProps) {
  return <p className={`font-sans mb-4 text-2xl ${className}`}>{children}</p>;
}

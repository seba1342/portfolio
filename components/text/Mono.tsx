import * as React from "react";
import { TextProps } from "./types";

export const Mono = { Body };

function Body({ children, className }: TextProps) {
  return <p className={`font-mono mb-8 text-base ${className}`}>{children}</p>;
}

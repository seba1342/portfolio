import * as React from "react";

import { TextProps } from "./types";

export const Titles = { H1, H2 };

function H1({ children, className = "" }: TextProps) {
  return (
    <h1
      className={`text-pretty font-serif leading-relaxed mb-6 md:mb-8 lg:mb-10 xl:mb-12 text-4xl md:text-6xl lg:text-7xl xl:text-8xl ${className}`}
    >
      {children}
    </h1>
  );
}

function H2({ children, className }: TextProps) {
  return (
    <h2
      className={`text-pretty font-serif leading-relaxed mb-6 mt-4 text-3xl md:text-5xl lg:text-6xl xl:text-7xl ${className}`}
    >
      {children}
    </h2>
  );
}

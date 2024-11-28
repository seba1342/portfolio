import React from "react";

type TextProps = {
  children: React.ReactNode;
  className?: string;
  color?: "dark" | "light";
  spacing?: string;
};

function textClassFactory(
  className: string,
  props: Omit<TextProps, "children">
) {
  const internalColor = props.color ?? "dark";
  const internalSpacing = props.spacing ?? "mb-4 md:mb-6";
  return `${className} text-${internalColor} ${internalSpacing} ${props.className}`;
}

const Titles = {
  H1: ({ children, ...props }: TextProps) => (
    <h1 className={textClassFactory("h1", props)}>{children}</h1>
  ),
  H2: ({ children, ...props }: TextProps) => (
    <h2 className={textClassFactory("h2", props)}>{children}</h2>
  ),
  H3: ({ children, ...props }: TextProps) => (
    <h3 className={textClassFactory("h3", props)}>{children}</h3>
  ),
};

const Body = {
  Default: ({ children, ...props }: TextProps) => (
    <p className={textClassFactory("body", props)}>{children}</p>
  ),
  Small: ({ children, ...props }: TextProps) => (
    <small className={textClassFactory("body-small", props)}>{children}</small>
  ),
};

export { Body, Titles };

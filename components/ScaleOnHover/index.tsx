import { PropsWithChildren } from "react";

export default function ScaleOnHover({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-1 transition-transform hover:scale-105 duration-300 ease-in-out">
      {children}
    </div>
  );
}

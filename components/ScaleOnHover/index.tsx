import { PropsWithChildren } from "react";
import { useIsSmallDevice } from "@/hooks/useWindowDimensions";

export default function ScaleOnHover({ children }: PropsWithChildren) {
  // Do not scale on mobile, leaves weird jankiness because tapping happens so fast
  const isSmallDevice = useIsSmallDevice();
  if (isSmallDevice) return children;

  return (
    <div className="transition-none sm:transition-transform hover:scale-[103%] duration-300 ease-in-out">
      {children}
    </div>
  );
}

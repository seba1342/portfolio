import { useEffect, useState } from "react";

function getWindowDimensions() {
  const { innerHeight: height, innerWidth: width } = window;
  return {
    height,
    width,
  };
}

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

export function useIsSmallDevice() {
  return useWindowDimensions().width < 768;
}

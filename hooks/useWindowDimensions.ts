import { useEffect, useState } from "react";

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState({
    height: 0,
    width: 0,
  });

  useEffect(() => {
    function getWindowDimensions() {
      const { innerHeight: height, innerWidth: width } = window;
      return {
        height,
        width,
      };
    }

    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    // Override the initial dimensions before a resize event
    setWindowDimensions(getWindowDimensions());

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

export function useIsSmallDevice() {
  const [isSmallDevice, setIsSmallDevice] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const updateIsSmallDevice = () => {
      setIsSmallDevice(mediaQuery.matches);
    };

    updateIsSmallDevice();
    mediaQuery.addEventListener("change", updateIsSmallDevice);

    return () =>
      mediaQuery.removeEventListener("change", updateIsSmallDevice);
  }, []);

  return isSmallDevice;
}

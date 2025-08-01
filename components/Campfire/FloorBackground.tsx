import { useEffect, useRef, useState } from "react";
import { useIsSmallDevice } from "@/hooks/useWindowDimensions";

const baseFloor = [
  '\' -.  ""--.....______......-------_________.....-------_________.....----',
  " .        .             '                  '                  .",
  "                   .                                     ",
  "           .                  .                         ",
  "       '        .                      '                  .",
  " '.                    '                      '          ",
  "                                                        ",
  "    '                             .                    '  ",
];

function FloorBackground() {
  const [floor, setFloor] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSmallDevice = useIsSmallDevice();

  useEffect(() => {
    const calculateFloor = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.offsetWidth;
      const charWidth = 8; // Approximate width of a character in pixels.  Adjust as needed.
      const numChars = Math.floor(width / charWidth);
      const extendedFloor: string[] = [];

      for (const line of baseFloor) {
        const trimmedLine = line.trimEnd(); // Important: remove trailing spaces
        const lineLength = trimmedLine.length;

        if (lineLength === 0) {
          extendedFloor.push(""); // Handle empty lines
          continue;
        }

        let extendedLine = "";
        while (extendedLine.length < numChars) {
          extendedLine += trimmedLine; // Repeat the pattern
        }

        extendedFloor.push(extendedLine.substring(0, numChars)); //trim to prevent overflows
      }
      setFloor(extendedFloor);
    };

    calculateFloor(); // Initial calculation

    const resizeObserver = new ResizeObserver(calculateFloor);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      className="absolute mono left-0 bottom-0 hidden sm:block"
      ref={containerRef}
      style={{
        fontFamily: "monospace",
        lineHeight: 1.6,
        overflow: "hidden",
        position: "absolute",
        whiteSpace: "pre",
        width: "100%",
      }}
    >
      {floor.map((line, index) => (
        <div key={index}>{line}</div>
      ))}
    </div>
  );
}

export default FloorBackground;

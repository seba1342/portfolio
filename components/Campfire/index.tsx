import { useIsSmallDevice } from "@/hooks/useWindowDimensions";
import { oatmeal } from "@/lib/colors";
import React, { CSSProperties, useEffect, useRef, useState } from "react";

import { Mono } from "../text";
import FloorBackground from "./FloorBackground";
import { applyTaper, clamp, generateFireNoise, rndi } from "./helpers";

const FONT_SIZE = 16;
const LINE_HEIGHT = 1;
const CHAR_HEIGHT = 0.6;
const COLS = 50;

const flame = "...::/\\/\\/\\+=*fireFIRE#";
const logs = ["(` .__ _  ___,')", "`'(_ )_)( _)_ )'"];
const person = [
  "              ,&&&. ",
  "              .,.&& ",
  "              \\=__/ ",
  "              ,'-'. ",
  "  ,,      _.__|/ /| ",
  "-((------((_|___/ | ",
  "          ((  `'--| ",
  "          \\ -._/. ",
  "        <_,_`--'| ",
  "          <_,-'__,' ",
];

function Campfire(): JSX.Element {
  const [fire, setFire] = useState<string[][]>([]);
  const animationFrameRef = useRef<null | number>(null);
  const [rows, setRows] = useState(0);
  const [data, setData] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const noise = generateFireNoise();

  /** Setup the window resize observers */
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        const newCols = Math.floor(width / (FONT_SIZE * CHAR_HEIGHT));

        const newRows =
          Math.floor(height / (FONT_SIZE * LINE_HEIGHT)) - logs.length;

        setRows(newRows);
        setData(new Array(newCols * newRows).fill(0));
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const animate = () => {
      if (!rows) return;

      const time = performance.now() * 0.000015;
      const last = COLS * (rows - 1);

      if (!isMouseDown) {
        for (let i = 0; i < COLS; i++) {
          const val = Math.floor(noise(i * 0.05, time) * (40 - 5) + 5);
          data[last + i] = Math.min(val, data[last + i] + 2);
        }
      } else {
        for (let i = 0; i < COLS; i++) {
          data[last + i] = 0;
        }
      }

      applyTaper(data, rows, COLS);

      for (let i = 0; i < data.length; i++) {
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        const dest = row * COLS + clamp(col + rndi(-1, 1), 0, COLS - 1);
        const src = Math.min(rows - 1, row + 1) * COLS + col;
        data[dest] = Math.max(0, data[src] - rndi(0, 2));
      }

      const newFire: string[][] = [];
      for (let y = 0; y < rows; y++) {
        newFire[y] = [];
        for (let x = 0; x < COLS; x++) {
          const index = x + y * COLS;
          const u = data[index];
          let CharRow = " ";
          if (u > 0) {
            CharRow = flame[clamp(u, 0, flame.length - 1)];
          }
          newFire[y][x] = CharRow;
        }
      }

      setFire(newFire);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [rows, data, isMouseDown, noise]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const isSmallDevice = useIsSmallDevice();

  return (
    <div
      className={`relative flex flex-col items-center select-none w-full overflow-x-hidden mb-12 ${
        isMouseDown ? "cursor-grabbing" : "cursor-grab"
      }`}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
      onTouchStart={(e) => handleMouseDown(e.nativeEvent as any)}
      ref={containerRef}
      style={{ height: 400 }}
    >
      <FloorBackground />
      <pre
        className="mono z-10"
        style={{
          fontSize: `${FONT_SIZE}px`,
          lineHeight: LINE_HEIGHT,
          marginLeft: isSmallDevice ? -125 : 0,
        }}
      >
        {fire.map((row, i) => (
          <CharRow key={`fire-${i}`} splitIntoSpans>
            {row.join("") + "\n"}
          </CharRow>
        ))}
      </pre>
      <div
        className="absolute mono flex flex-col justify-center whitespace-pre bottom-8 z-10"
        style={isSmallDevice ? { right: 20 } : { marginLeft: 350 }}
      >
        {person.map((personRow, i) => (
          <CharRow
            key={`person-${i}`}
            splitIntoSpans
            style={{ lineHeight: 1.2 }}
          >
            {personRow}
          </CharRow>
        ))}
      </div>
      <div className="mono flex flex-col justify-center whitespace-pre z-10">
        {logs.map((logRow, i) => (
          <CharRow
            key={`log-${i}`}
            style={{ lineHeight: 1.4, marginLeft: isSmallDevice ? -150 : 0 }}
          >
            {logRow}
          </CharRow>
        ))}
      </div>
    </div>
  );
}

function findFirstAndLastNonSpace(str: string): {
  first: number;
  last: number;
} {
  let first = -1;
  let last = -1;

  if (!str || str.length === 0) {
    return { first, last }; // Handle empty or null strings
  }

  // Find the first non-space character
  for (let i = 0; i < str.length; i++) {
    if (str[i] !== " ") {
      first = i - 3;
      break;
    }
  }

  // Find the last non-space character
  for (let i = str.length - 1; i >= 0; i--) {
    if (str[i] !== " " && str[i] !== "\n") {
      last = i + 3;
      break;
    }
  }

  return { first, last };
}

type CharRowProps = React.PropsWithChildren &
  Readonly<{
    key: string;
    splitIntoSpans?: boolean;
    style?: CSSProperties;
  }>;

const CharRow = ({ children, splitIntoSpans = false, style }: CharRowProps) => {
  if (!splitIntoSpans)
    return (
      <span
        key={children?.toString()}
        style={{
          fontSize: `${FONT_SIZE}px`,
          lineHeight: LINE_HEIGHT,
          ...style,
        }}
      >
        {children}
      </span>
    );

  if (typeof children !== "string") return null;

  const { first, last } = findFirstAndLastNonSpace(children);
  const text = Array.from(children);

  return (
    <span>
      {text.map((char, i) => (
        <span
          key={i}
          style={{
            backgroundColor: i >= first && i <= last ? oatmeal : "transparent",
            fontSize: `${FONT_SIZE}px`,
            lineHeight: LINE_HEIGHT,
            ...style,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export default Campfire;

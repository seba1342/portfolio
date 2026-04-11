import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/Button";

const SCREEN_WIDTH = 16;

const AIRPORTS = [
  { city: "Sydney", code: "SYD" },
  { city: "Melbourne", code: "MEL" },
  { city: "Brisbane", code: "BNE" },
  { city: "Perth", code: "PER" },
  { city: "Adelaide", code: "ADL" },
  { city: "Gold Coast", code: "OOL" },
  { city: "Hobart", code: "HBA" },
  { city: "Cairns", code: "CNS" },
  { city: "Canberra", code: "CBR" },
  { city: "Darwin", code: "DRW" },
  { city: "Auckland", code: "AKL" },
  { city: "Singapore", code: "SIN" },
  { city: "Bali", code: "DPS" },
];

const AIRLINES = [
  { callsign: "QFA", name: "Qantas" },
  { callsign: "JST", name: "Jetstar" },
  { callsign: "VOZ", name: "Virgin" },
  { callsign: "REX", name: "Rex" },
  { callsign: "ANZ", name: "Air NZ" },
  { callsign: "SIA", name: "Singapore" },
];

function randomFlight(): { callsign: string; route: string } {
  const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  const from = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
  let to = from;
  while (to === from) {
    to = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
  }
  return {
    callsign: `${airline.callsign}${num}`,
    route: `${from.city} (${from.code}) -> ${to.city} (${to.code})`,
  };
}

type Frame = {
  bottom: string;
  duration: number;
  scrollBottom?: boolean;
  top: string;
};

function generateSequence(): Frame[] {
  const roll = Math.random();
  const count = roll < 0.9 ? 1 : roll < 0.99 ? 2 : 3;
  const flights: Frame[] = [];
  for (let i = 0; i < count; i++) {
    const f = randomFlight();
    flights.push({
      bottom: f.route,
      duration: 0, // duration controlled by scroll laps
      scrollBottom: true,
      top: `${f.callsign}:`,
    });
  }

  return [
    { bottom: "flights...", duration: 2000, top: "Fetching nearby" },
    {
      bottom: "fetching info...",
      duration: 2000,
      top: `Found ${count} ${count === 1 ? "flight" : "flights"}`,
    },
    ...flights,
    { bottom: "*--o--(_)--o--*", duration: 3000, top: "     __|__     " },
  ];
}

const IDLE_FRAME: Frame = {
  bottom: "*--o--(_)--o--*",
  duration: 0,
  top: "     __|__     ",
};

function padLine(text: string): string {
  return text.padEnd(SCREEN_WIDTH).slice(0, SCREEN_WIDTH);
}

// Split-flap alphabet — characters cycle through this sequence top-to-bottom
const FLAP_CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:()->.";
const FLAP_DURATION = 600;
const FLAP_INTERVAL = 1000 / 24;
const CHAR_STAGGER = 40; // ms delay between each character position starting

function flapLine(target: string, elapsed: number): string {
  return target
    .split("")
    .map((char, i) => {
      if (char === " ") return " ";
      const charStart = i * CHAR_STAGGER;
      const charElapsed = elapsed - charStart;
      if (charElapsed <= 0) return " ";

      const targetIndex = FLAP_CHARS.indexOf(char.toUpperCase());
      const targetPos =
        targetIndex === -1 ? FLAP_CHARS.length - 1 : targetIndex;
      const totalFlips = targetPos + 3; // flip past a few extra for feel
      const flipProgress = Math.min(1, charElapsed / FLAP_DURATION);
      const currentFlip = Math.floor(flipProgress * totalFlips);

      if (currentFlip >= totalFlips) return char;
      return FLAP_CHARS[currentFlip % FLAP_CHARS.length];
    })
    .join("");
}

export default function LcdDisplay() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [frameIndex, setFrameIndex] = useState(-1);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [flapElapsed, setFlapElapsed] = useState(-1);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isIdle = frameIndex === -1 || frames.length === 0;
  const totalFlapTime = FLAP_DURATION + SCREEN_WIDTH * CHAR_STAGGER;
  const isFlapping = flapElapsed >= 0 && flapElapsed < totalFlapTime;
  const frame = isIdle ? IDLE_FRAME : frames[frameIndex];

  const canPress = isIdle && !isFlapping;

  const handlePress = useCallback(() => {
    if (!canPress) return;
    const seq = generateSequence();
    setFrames(seq);
    setFrameIndex(0);
    setScrollOffset(0);
  }, [canPress]);

  // Split-flap transition on frame change
  useEffect(() => {
    if (isIdle) return;
    setFlapElapsed(0);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setFlapElapsed(elapsed);
      if (elapsed >= totalFlapTime) clearInterval(interval);
    }, FLAP_INTERVAL);
    return () => clearInterval(interval);
  }, [frameIndex, isIdle, totalFlapTime]);

  // Cycle through frames (for non-scroll frames with fixed duration)
  useEffect(() => {
    if (isIdle || frame.duration === 0) return;

    const t = setTimeout(() => {
      const next = frameIndex + 1;
      if (next >= frames.length) {
        setFrameIndex(-1);
        setFrames([]);
      } else {
        setFrameIndex(next);
      }
    }, totalFlapTime + frame.duration);
    return () => clearTimeout(t);
  }, [frameIndex, isIdle, frame.duration, frames.length, totalFlapTime]);

  // Scroll animation for long bottom text — advances frame after 2 laps
  useEffect(() => {
    setScrollOffset(0);

    if (!frame.scrollBottom || frame.bottom.length <= SCREEN_WIDTH) return;

    const marquee = frame.bottom + "   ";
    const marqueeLen = marquee.length;
    let laps = 0;
    let pos = 0;

    const initialDelay = setTimeout(() => {
      scrollIntervalRef.current = setInterval(() => {
        pos++;
        if (pos % marqueeLen === 0) {
          laps++;
          if (laps >= 2) {
            const next = frameIndex + 1;
            if (next >= frames.length) {
              setFrameIndex(-1);
              setFrames([]);
            } else {
              setFrameIndex(next);
            }
            return;
          }
        }
        setScrollOffset(pos % marqueeLen);
      }, 250);
    }, 1500);

    return () => {
      clearTimeout(initialDelay);
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameIndex]);

  let topLine = padLine(frame.top);
  let bottomLine: string;

  if (frame.scrollBottom && frame.bottom.length > SCREEN_WIDTH) {
    const marquee = frame.bottom + "   ";
    let scrolled = "";
    for (let i = 0; i < SCREEN_WIDTH; i++) {
      scrolled += marquee[(scrollOffset + i) % marquee.length];
    }
    bottomLine = scrolled;
  } else {
    bottomLine = padLine(frame.bottom);
  }

  if (isFlapping) {
    topLine = flapLine(topLine, flapElapsed);
    bottomLine = flapLine(bottomLine, flapElapsed);
  }

  return (
    <div className="flex flex-col items-center gap-4 my-12 w-full max-w-lg mx-auto">
      <div className="relative rounded-md bg-[#2d6b3a] p-4 pt-6 pb-4 w-full">
        {/* PCB screw holes */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-[#1a4a25] border border-[#3a8a4a]" />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#1a4a25] border border-[#3a8a4a]" />
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-[#1a4a25] border border-[#3a8a4a]" />
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-[#1a4a25] border border-[#3a8a4a]" />
        {/* Header pins */}
        <div className="absolute -top-1 left-6 right-6 flex justify-between">
          {Array.from({ length: 16 }).map((_, i) => (
            <div className="w-1 h-2 bg-[#c0a030] rounded-sm" key={i} />
          ))}
        </div>
        {/* LCD module */}
        <div className="rounded-sm bg-[#1a1a1a] p-1">
          <div className="flex flex-col rounded-sm bg-[#2a4a6b] p-3 gap-1">
            <Text>{topLine}</Text>
            <Text>{bottomLine}</Text>
          </div>
        </div>
      </div>

      <Button.Dark disabled={!canPress} onClick={handlePress}>
        {canPress ? "Scan the Skies" : "Scanning..."}
      </Button.Dark>
    </div>
  );
}

function Text({ children }: { children: string }) {
  return (
    <div className="flex gap-[2px] select-none">
      {children.split("").map((char, i) => (
        <span
          className="uppercase font-mono text-[clamp(12px,3.2vw,20px)] leading-none text-[#c8d8e8] [text-shadow:0_0_6px_#8899aa66] bg-[#1f3d5a] rounded-[2px] inline-flex items-center justify-center flex-1 aspect-[3/4] overflow-visible"
          key={i}
        >
          {char}
        </span>
      ))}
    </div>
  );
}

import { useScramble } from "use-scramble";
import { useIsSmallDevice } from "@/hooks/useWindowDimensions";

type Props = Readonly<{ children: string }>;

export default function ScrambleOnHover({ children }: Props) {
  const { ref, replay } = useScramble({
    playOnMount: false,
    scramble: 5,
    speed: 0.8,
    text: children,
  });
  const isSmallDevice = useIsSmallDevice();

  return <span onMouseOver={isSmallDevice ? undefined : replay} ref={ref} />;
}

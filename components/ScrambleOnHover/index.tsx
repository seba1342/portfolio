import { useImperativeHandle } from "react";
import { useScramble } from "use-scramble";
import { useIsSmallDevice } from "@/hooks/useWindowDimensions";

export type ScrambleHandle = { replay: () => void };

type Props = Readonly<{
  children: string;
  handleRef?: React.Ref<ScrambleHandle>;
}>;

export default function ScrambleOnHover({ children, handleRef }: Props) {
  const { ref, replay } = useScramble({
    playOnMount: false,
    scramble: 5,
    speed: 0.8,
    text: children,
  });
  const isSmallDevice = useIsSmallDevice();

  useImperativeHandle(handleRef, () => ({ replay }), [replay]);

  return <span onMouseOver={isSmallDevice ? undefined : replay} ref={ref} />;
}

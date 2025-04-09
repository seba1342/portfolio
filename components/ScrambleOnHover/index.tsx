import { useScramble } from "use-scramble";

type Props = Readonly<{ children: string }>;

export default function ScrambleOnHover({ children }: Props) {
  const { ref, replay } = useScramble({
    playOnMount: false,
    scramble: 5,
    speed: 0.8,
    text: children,
  });

  return <span onMouseOver={replay} ref={ref} />;
}

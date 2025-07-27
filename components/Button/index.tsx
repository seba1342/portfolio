import * as COLORS from "@/lib/colors";
import ScaleOnHover from "../ScaleOnHover";
import ScrambleOnHover from "../ScrambleOnHover";
import { Mono } from "../text";

type Props = Readonly<{
  backgroundColor?: string;
  children: string;
  href: string;
}>;

export default function Button({
  backgroundColor = COLORS.bark,
  children,
  href,
}: Props) {
  return (
    <ScaleOnHover>
      <a
        className="flex flex-1 items-center justify-center py-4 px-2 rounded-lg w-full min-w-[180px]"
        href={href}
        style={{ backgroundColor }}
        target="_blank"
      >
        <Mono.Default color="dark">
          <ScrambleOnHover>{children}</ScrambleOnHover>
        </Mono.Default>
      </a>
    </ScaleOnHover>
  );
}

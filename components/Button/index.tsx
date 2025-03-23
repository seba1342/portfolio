import * as COLORS from "@/lib/colors";

import ScaleOnHover from "../ScaleOnHover";
import { Mono } from "../text";

type Props = Readonly<{ backgroundColor?: string; children: string }>;

export default function Button({
  backgroundColor = COLORS.bark,
  children,
}: Props) {
  return (
    <ScaleOnHover>
      <button
        className="flex flex-1 items-center justify-center py-4 px-2 rounded-lg w-full min-w-[180px]"
        style={{ backgroundColor }}
      >
        <Mono.Default color="dark">{children}</Mono.Default>
      </button>
    </ScaleOnHover>
  );
}

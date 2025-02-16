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
        className="flex flex-1 justify-center py-5 px-4 rounded-lg w-full sm:min-w-[160px]"
        style={{ backgroundColor }}
      >
        <Mono.Default color="dark">{children}</Mono.Default>
      </button>
    </ScaleOnHover>
  );
}

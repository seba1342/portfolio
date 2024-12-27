import * as COLORS from "@/lib/colors";

import { Mono } from "../text";

type Props = Readonly<{ backgroundColor?: string; children: string }>;

export default function Button({
  backgroundColor = COLORS.bark,
  children,
}: Props) {
  return (
    <button
      className="py-5 px-4 rounded-lg hover:scale-[102%] transition-transform min-w-[150px] flex items-center justify-center"
      style={{ backgroundColor }}
    >
      <Mono.Default color="dark">{children}</Mono.Default>
    </button>
  );
}

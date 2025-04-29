import Link from "next/link";
import { usePathname } from "next/navigation";

import ScaleOnHover from "../ScaleOnHover";
import ScrambleOnHover from "../ScrambleOnHover";
import { Mono } from "../text";

export const HEADER_HEIGHT = 80;

export default function Header() {
  return (
    <nav className="w-full fixed z-50 p-4 bg-oatmeal flex justify-center">
      <div className="max-w-6xl flex flex-1 justify-between items-center px-3 md:px-6">
        <h1 className="font-sans text-xl md:text-2xl">
          <Link href="/">
            <ScaleOnHover>Sebastien Bailouni</ScaleOnHover>
          </Link>
        </h1>
        <ul className="flex flex-row">
          <Item type="inspiration" />
        </ul>
      </div>
    </nav>
  );
}

function Item({ type }: { type: "inspiration" }) {
  const pathname = usePathname();

  return (
    <li className="px-2 md:px-4">
      <Link
        className={pathname.includes(type) ? `underline` : ""}
        href={`/${type}`}
      >
        <Mono.Default className="mb-[0px] capitalize text-right">
          <ScrambleOnHover>{type}</ScrambleOnHover>
        </Mono.Default>
      </Link>
    </li>
  );
}

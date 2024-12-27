import Link from "next/link";
import { usePathname } from "next/navigation";

import { Mono } from "../text";

export const HEADER_HEIGHT = 80;

export default function Header() {
  return (
    <nav className="w-full fixed z-50 p-4 bg-oatmeal flex justify-center">
      <div className="max-w-7xl flex flex-1 justify-between items-center">
        <h1 className="font-sans text-xl md:text-2xl">
          <Link href="/">Sebastien Bailouni</Link>
        </h1>
        <ul className="flex flex-row justify-center items-center">
          <Item type="inspiration" />
          <Item type="projects" />
        </ul>
      </div>
    </nav>
  );
}

function Item({ type }: { type: "inspiration" | "projects" }) {
  const pathname = usePathname();

  return (
    <li className="px-2 md:px-4">
      <Link
        className={pathname.includes(type) ? `underline` : ""}
        href={`/${type}`}
      >
        <Mono.Default className="mb-[0px] text-xs capitalize">
          {type}
        </Mono.Default>
      </Link>
    </li>
  );
}

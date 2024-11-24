import Link from "next/link";
import { usePathname } from "next/navigation";

import { Mono } from "../text/Mono";

export const HEADER_HEIGHT = 80;

export default function Header() {
  return (
    <header className="fixed w-full z-50 flex justify-between items-center p-6 bg-oatmeal">
      <h1 className="font-sans text-xl md:text-2xl">
        <Link href="/">Sebastien Bailouni</Link>
      </h1>
      <ul className="flex flex-row justify-center items-center">
        <Item type="inspiration" />
        <Item type="projects" />
      </ul>
    </header>
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
        <Mono.Body className="mb-[0px] text-xs capitalize">{type}</Mono.Body>
      </Link>
    </li>
  );
}

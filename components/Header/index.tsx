import Link from "next/link";
import { usePathname } from "next/navigation";

import { Mono } from "../text/Mono";

export default function Header() {
  return (
    <header className="fixed w-full z-50">
      <div className="flex justify-between items-center p-6 h-[81px] bg-oatmeal">
        <h1 className="font-sans text-xl md:text-2xl">
          <Link href="/">Sebastien Bailouni</Link>
        </h1>
        <ul className="flex flex-row justify-center items-center">
          <Item type="inspiration" />
          <Item type="projects" />
        </ul>
      </div>
      <div className="h-8 w-full bg-gradient-to-t from-transparent to-oatmeal" />
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

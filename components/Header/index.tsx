import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mono } from "../text/Mono";

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="fixed w-full z-50">
      <div className="flex justify-between items-center p-6 h-[81px] bg-oatmeal">
        <h1 className="font-sans text-2xl">
          <Link href="/">Sebastien Bailouni</Link>
        </h1>
        <ul className="flex flex-row justify-center items-center">
          <li className="px-4">
            <Link
              className={pathname.includes("inspiration") ? `underline` : ""}
              href="/inspiration"
            >
              <Mono.Body className="mb-[0px]">Inspiration</Mono.Body>
            </Link>
          </li>
          <li className="px-4">
            <Link
              className={pathname.includes("projects") ? `underline` : ""}
              href="/projects"
            >
              <Mono.Body className="mb-[0px]">Projects</Mono.Body>
            </Link>
          </li>
        </ul>
      </div>
      <div className="h-8 w-full bg-gradient-to-t from-transparent to-oatmeal" />
    </header>
  );
}

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="fixed w-full">
      <div className="flex justify-between items-center p-6 h-[81px] bg-oatmeal">
        <h1 className="font-sans text-2xl">
          <Link href="/">Sebastien Bailouni</Link>
        </h1>
        <ul className="font-mono text-1xl flex flex-row">
          <li className="px-4">
            <Link
              className={
                pathname.includes("projects") ? `underline` : undefined
              }
              href="/projects"
            >
              Projects
            </Link>
          </li>
          {/* <li className="px-4">
          <Link
            className={
              pathname.includes("inspiration") ? `underline` : undefined
            }
            href="/inspiration"
          >
            Inspiration
          </Link>
        </li> */}
        </ul>
      </div>
      <div className="h-8 w-full bg-gradient-to-t from-transparent to-oatmeal" />
    </header>
  );
}

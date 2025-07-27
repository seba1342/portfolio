import { useRouter } from "next/router";

import Campfire from "../Campfire";
import ScrambleOnHover from "../ScrambleOnHover";
import { Mono } from "../text";

export default function Footer() {
  const { pathname } = useRouter();

  return (
    <footer className="p-4 pt-0">
      <Campfire is404={pathname === "/404"} />
      <Mono.Default className="text-center w-full">
        Thanks for stopping by xx
        <br className="sm:hidden" />
        <br className="sm:hidden" />
      </Mono.Default>
      <Mono.Default className="text-center w-full">
        If you like code you can see what this website is made of{" "}
        <a
          className="underline underline-offset-2"
          href="https://github.com/seba1342/portfolio"
          target="_blank"
        >
          <ScrambleOnHover>here (Github)</ScrambleOnHover>
        </a>
        .
      </Mono.Default>
    </footer>
  );
}

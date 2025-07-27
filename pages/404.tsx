import Link from "next/link";
import Content from "@/components/Layout/Content";
import ScaleOnHover from "@/components/ScaleOnHover";
import ScrambleOnHover from "@/components/ScrambleOnHover";
import { Mono, Titles } from "@/components/text";
import Body from "@/components/text/Body";

export default function Custom404() {
  return (
    <Content>
      <Titles.H3>Sorry, this page does not exist.</Titles.H3>
      <Body>
        Maybe you need some{" "}
        <Link className="underline underline-offset-2" href="/inspiration">
          inspiration
        </Link>
        ?
      </Body>
    </Content>
  );
}

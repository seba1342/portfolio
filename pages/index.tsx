import CensoredText from "@/components/CensoredText/CensoredText";
import { Titles } from "@/components/text/Titles";

export default function Home() {
  return (
    <div className="flex flex-col max-w-7xl min-h-full justify-end md:pt-24">
      {/* Can't decide whether I like this first line or not... */}
      {/* <Titles.H1>
        Why the <CensoredText maskedWord="f**k" word="fuck" /> is writing an
        intro for your own website so hard?
      </Titles.H1> */}
      <Titles.H1>
        I use code to build engaging interactions and experiences. I love the
        crossover between design and computing.
      </Titles.H1>
      <Titles.H1>
        While my toolbox is always evolving, it currently includes Typescript,
        React, React Native, Ruby, Rails, GraphQL.
      </Titles.H1>
    </div>
  );
}

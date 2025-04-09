import Button from "@/components/Button";
import FixedBanner from "@/components/FixedBanner";
import Content from "@/components/Layout/Content";
import { Body, Mono, Titles } from "@/components/text";
import * as COLORS from "@/lib/colors";
import Image from "next/image";

import gratitudesEntryImage from "./assets/gratitudes-entry.png";
import gratitudesHomeImage from "./assets/gratitudes-home.png";

export const theme = {
  alternateBackgroundColor: COLORS.oatmeal,
  backgroundColor: "#311730",
};

export default function Gratitudes() {
  return (
    <>
      <FixedBanner backgroundColor={theme.backgroundColor}>
        <FixedBanner.Text>
          Released: 20.10.23 • Platform: iOS & Android • Tech: React Native/Expo
        </FixedBanner.Text>
      </FixedBanner>
      <div
        className={`gratitudes__background flex flex-col justify-center items-center h-full pt-20 pb-8 w-full mt-[92px] relative`}
      >
        <Titles.H1 align="center" color="light">
          Gratitudes
        </Titles.H1>
        <Body.Default align="center" color="light">
          A daily journalling app.
        </Body.Default>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 pb-16">
          <Button
            backgroundColor={theme.alternateBackgroundColor}
            href="https://apps.apple.com/au/app/gratitudes/id6444113905"
          >
            Download
          </Button>
        </div>

        <div className="flex flex-row gap-1 sm:gap-12 items-center justify-center w-full">
          <Image
            alt="Gratitudes home page"
            className="w-[45%] max-w-[300px]"
            priority
            src={gratitudesHomeImage}
          />
          <Image
            alt="Gratitudes entry page"
            className="w-[45%] max-w-[300px]"
            priority
            src={gratitudesEntryImage}
          />
        </div>
      </div>
      <Content className="pt-12">
        <Titles.H3>
          Gratitudes is a simple journalling app. It notifies you every day to
          stop and reflect on what you are grateful for.
        </Titles.H3>
        <Titles.H3>
          I designed and built Gratitudes so I could be reminded to reflect each
          day. It also serves as a repository for all my past entries.
        </Titles.H3>
        <Mono.Default className="w-full text-center py-12">
          {">< >< >< >< >< >< >< >< ><"}
        </Mono.Default>
        <Titles.H2 className="pt-8">Tech Stack</Titles.H2>
        <Titles.H3>React Native and Expo</Titles.H3>
        <Body.Default>
          React Native has proven to be a valuable framework for building native
          apps. It’s written in a language and framework that I am familiar in
          (React/Typescript). It also removes the need for me to write the same
          code twice, once for iOS and once for Android.
        </Body.Default>
        <Body.Default>
          Using the Expo framework has greatly simplified working in the native
          app eco-system. It handles the deployment pipelines to the native App
          Stores (which is a headache on the best of days). It also provides
          some helpful libraries which are actively supported and maintained.
        </Body.Default>

        <Titles.H2>Features</Titles.H2>
        <Titles.H3>Push notifications</Titles.H3>
        <Body.Default>
          A simple reminder to complete an entry was one of my main
          requirements. Using local push notifications I am able to create
          opt-in reminders at whatever time the user chooses.
        </Body.Default>

        <Titles.H3>Local on-device storage</Titles.H3>
        <Body.Default>
          I decided to simplify the tech-stack by removing the need for a
          external server. Instead, I store all entries on the device. This
          decision has its benefits and negatives. It means there are no
          additional server costs which come with hosting. It also means that
          your data is never leaving your device and is private (unless you
          export it). One immediate downside is backing up your entries, or
          viewing them on other devices is much harder (and more manual) to
          manage.
        </Body.Default>

        <Titles.H3>Importing and exporting your entries</Titles.H3>
        <Body.Default>
          Because all entries are stored on device I decided to build a simple
          import/exporting feature. This allows the user to export all the
          entries save the file anywhere they want and then re-import it on
          another device. The exported file is a simple JSON blob, which means
          people can run their own analysis over their entries if they want to.
        </Body.Default>

        <Titles.H3>Private</Titles.H3>
        <Body.Default>
          Your data never leaves the device on this app. Your entries remain on
          device unless you ever decide to export them. Meaning your entries are
          as secure as you keep them.
        </Body.Default>

        <Titles.H3>No ads, free forever</Titles.H3>
        <Body.Default>
          It&apos;s becoming more and more uncommon to find free apps without
          ads nowadays. Hence why I think it&apos;s worth calling this out as a
          feature. This app is a hobby project of mine and has no running costs
          other than my time to maintain the code. Which is why it will always
          remain ad free and cost nothing to use.
        </Body.Default>
      </Content>
    </>
  );
}

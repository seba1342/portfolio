import FixedBanner from "@/components/FixedBanner";
import Content from "@/components/Layout/Content";
import Page from "@/components/Page";
import { Body, Titles } from "@/components/text";
import * as COLORS from "@/lib/colors";

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
      <Page.Hero subtitle="A daily journalling app." title="Gratitudes" />
      <Content className="pt-10">
        <Titles.H3>
          Gratitudes is a simple journalling app. It notifies you every day to
          stop and reflect on what you are grateful for.
        </Titles.H3>
        <Titles.H3>
          I designed and built Gratitudes so I could be reminded to reflect each
          day. It also serves as a repository for all my past entries.
        </Titles.H3>
        <hr className="mx-auto h-px my-8 bg-softBark border-0 mt-12 w-[500px] max-w-full" />
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
        <Titles.H3>Local on-device storage</Titles.H3>
        <Body.Default>
          I decided to simplify the tech-stack by removing the need for a
          external server. Instead, I store all entries on the device. This
          decision has its benefits and negatives. It means there are no
          additional server costs which come with hosting. It means that your
          data is never leaving your device and is private (unless you export
          it).
        </Body.Default>
        <Titles.H2>Features</Titles.H2>
        <Titles.H3>Importing and exporting your entries</Titles.H3>
        <Body.Default>
          The app sends a notification to the user if they have opted in. These
          are purely local notifications and are not sent from a server. These
          notifications will be sent once a day at the user’s chosen time.
        </Body.Default>
      </Content>
    </>
  );
}

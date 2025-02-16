import { Mono } from "../text";

type Props = Readonly<{ backgroundColor: string; children: React.ReactNode }>;

export const INITIAL_HEIGHT = 40;

function FixedBanner({ backgroundColor, children }: Props) {
  return (
    <div
      className={`fixed left-0 top-[60px] sm:top-[64px] w-full h-[${INITIAL_HEIGHT}px] flex justify-center items-center z-20 p-2`}
      style={{ backgroundColor }}
    >
      {children}
    </div>
  );
}

type TextProps = Readonly<{ children: string }>;

function Text({ children }: TextProps) {
  return (
    <Mono.Default className="text-center" color="light">
      {children}
    </Mono.Default>
  );
}

export default Object.assign(FixedBanner, { Text });

import { useRef } from "react";
import * as COLORS from "@/lib/colors";
import ScaleOnHover from "../ScaleOnHover";
import ScrambleOnHover, { ScrambleHandle } from "../ScrambleOnHover";
import { Mono } from "../text";

type Props = Readonly<{
  backgroundColor?: string;
  children: string;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
}>;

function ButtonInner({
  backgroundColor = COLORS.bark,
  children,
  disabled,
  href,
  onClick,
  textColor,
}: { textColor: "dark" | "light" } & Props) {
  const scrambleRef = useRef<ScrambleHandle>(null);
  const className =
    "flex items-center justify-center py-4 px-2 rounded-lg min-w-[180px]";

  const content = (
    <Mono.Default color={textColor}>
      <ScrambleOnHover handleRef={scrambleRef}>{children}</ScrambleOnHover>
    </Mono.Default>
  );

  const onHover = () => scrambleRef.current?.replay();

  if (href) {
    return (
      <ScaleOnHover>
        <a
          className={className}
          href={href}
          onMouseEnter={onHover}
          style={{ backgroundColor }}
          target="_blank"
        >
          {content}
        </a>
      </ScaleOnHover>
    );
  }

  const button = (
    <button
      className={`${className} ${disabled ? "cursor-default opacity-50" : "cursor-pointer"}`}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onHover}
      style={{ backgroundColor }}
      type="button"
    >
      {content}
    </button>
  );

  if (disabled) return button;

  return <ScaleOnHover>{button}</ScaleOnHover>;
}

const Button = {
  Dark: (props: Props) => <ButtonInner {...props} textColor="light" />,
  Light: (props: Props) => <ButtonInner {...props} textColor="dark" />,
};

export default Button;

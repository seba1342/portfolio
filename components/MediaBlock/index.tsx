function MediaBlock({
  children,
  reverse,
}: {
  children: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div
      className={`flex flex-col-reverse md:flex-row relative gap-6 items-center my-6 md:my-24 ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      {children}
    </div>
  );
}

function Media({ children }: { children: React.ReactNode }) {
  return <div className="w-full md:w-1/2 md:max-h-[66vh] rounded-lg overflow-hidden">{children}</div>;
}

function Content({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-6 md:flex-1">{children}</div>;
}

export default Object.assign(MediaBlock, { Content, Media });

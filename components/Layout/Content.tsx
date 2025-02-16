export default function Content({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`justify-center w-full max-w-7xl mx-auto px-3 md:px-6 pt-20 ${className}`}
    >
      {children}
    </div>
  );
}

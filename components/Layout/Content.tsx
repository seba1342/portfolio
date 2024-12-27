export default function Content({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`justify-center max-w-7xl mx-auto px-3 md:px-6 ${className}`}
    >
      {children}
    </div>
  );
}

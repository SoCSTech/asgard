export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-apricot text-white">
      {children}
    </div>
  );
}

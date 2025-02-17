import AuthBackground from "./background";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-full w-full">
      <div className="absolute tablet:opacity-95 tablet:w-1/2 laptop:w-1/3 z-10 h-screen w-full bg-black text-white flex flex-col justify-center items-center">
        {children}
      </div>
      <AuthBackground />
    </div>
  );
}

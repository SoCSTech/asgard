import AuthBackground from "./background";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-full w-full">
      <div className="absolute z-10 flex h-screen w-full flex-col items-center justify-center bg-black px-5 text-white tablet:w-1/2 tablet:opacity-85 shadow-xl laptop:w-1/3">
        <img src="/images/logos/uol-white-text.svg" className="w-1/2" alt="University of Lincoln"></img>
        <div className="w-full">{children}</div>
      </div>  
      <AuthBackground />
    </div>
  );
}

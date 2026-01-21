export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-zinc-950">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-zinc-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)]"></div>
      
      <div className="absolute left-0 top-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute left-[20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-400/20 blur-[100px] dark:bg-emerald-500/10"></div>
        <div className="absolute right-[20%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-teal-400/20 blur-[100px] dark:bg-teal-500/10"></div>
      </div>

      <div className="relative w-full max-w-md p-4">
        {children}
      </div>
    </div>
  );
}
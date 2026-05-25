export default function Loading() {
  return (
    <div className="flex flex-col gap-6 items-center justify-center h-screen">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
      </div>
      <p className="text-muted-foreground text-xl">Loading...</p>
    </div>
  );
}
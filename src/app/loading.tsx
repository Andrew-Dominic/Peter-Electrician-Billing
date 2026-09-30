export default function Loading() {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-blue/20 border-t-brand-blue"></div>
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

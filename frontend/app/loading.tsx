export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
      <div className="w-24 h-24 rounded-full shimmer" />
      <div className="w-64 h-8 rounded-lg shimmer" />
      <div className="w-80 h-4 rounded-lg shimmer" />
      <div className="flex gap-4 mt-4">
        <div className="w-32 h-12 rounded-2xl shimmer" />
        <div className="w-32 h-12 rounded-2xl shimmer" />
      </div>
    </div>
  );
}

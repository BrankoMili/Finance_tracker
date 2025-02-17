export default function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>
  );
}

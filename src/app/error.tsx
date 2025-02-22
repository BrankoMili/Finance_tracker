"use client";

export default function Error() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong!</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Try Again
        </button>
      </div>
    </div>
  );
}

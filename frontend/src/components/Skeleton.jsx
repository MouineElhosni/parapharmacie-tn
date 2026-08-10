function Skeleton() {
  return (
    <div className="animate-pulse bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="h-56 bg-gray-200"></div>
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-9 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}

export default Skeleton;

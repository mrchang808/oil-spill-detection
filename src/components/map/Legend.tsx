const Legend = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 absolute bottom-8 left-8 z-[1000]">
      <h3 className="font-semibold text-sm mb-3 text-gray-800">Detection Status</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-md flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-red-600"></div>
          </div>
          <span className="text-sm text-gray-700">Oil Spill</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-white shadow-md flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-600"></div>
          </div>
          <span className="text-sm text-gray-700">Non Oil Spill</span>
        </div>
      </div>
    </div>
  );
};

export default Legend;

export function ProductCardSkeleton() {
  return (
    <div className="w-full p-4 rounded-lg border-2 border-gray-200 bg-white animate-pulse">
      <div className="flex gap-4">
        <div className="w-[80px] h-[80px] bg-gray-200 rounded-lg flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="flex gap-1 mt-2">
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="p-4">
        <div className="w-[60px] h-[60px] bg-gray-200 rounded-lg"></div>
      </td>
      <td className="p-4">
        <div className="h-5 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="p-4">
        <div className="h-5 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          <div className="h-6 w-12 bg-gray-200 rounded"></div>
          <div className="h-6 w-12 bg-gray-200 rounded"></div>
        </div>
      </td>
      <td className="p-4">
        <div className="flex gap-2 justify-end">
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
        </div>
      </td>
    </tr>
  );
}

export function SalesHistorySkeleton() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="p-4">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="p-4">
        <div className="h-6 w-12 bg-gray-200 rounded"></div>
      </td>
      <td className="p-4 text-right">
        <div className="h-4 bg-gray-200 rounded w-8 ml-auto"></div>
      </td>
      <td className="p-4 text-right">
        <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
      </td>
      <td className="p-4 text-right">
        <div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
      </td>
    </tr>
  );
}

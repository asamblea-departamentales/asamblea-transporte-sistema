/** Skeleton para la vista de tarjetas (móvil) */
export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-100 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 rounded bg-slate-100" />
        <div className="h-5 w-20 rounded-full bg-slate-100" />
      </div>
      <div className="mt-3 h-3 w-48 rounded bg-slate-100" />
      <div className="mt-2 h-3 w-36 rounded bg-slate-100" />
    </div>
  );
}

/** Skeleton para la vista de tabla (desktop) */
export function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-50">
      <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-100" /></td>
      <td className="px-6 py-4"><div className="h-4 w-28 rounded bg-slate-100" /></td>
      <td className="px-6 py-4"><div className="h-4 w-40 rounded bg-slate-100" /></td>
      <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-slate-100" /></td>
      <td className="px-6 py-4"><div className="ml-auto h-6 w-24 rounded-full bg-slate-100" /></td>
    </tr>
  );
}
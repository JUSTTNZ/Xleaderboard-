import { motion } from 'framer-motion';

function Pulse({ className = '' }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`rounded-lg bg-[#2A2A2A] ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Pulse className="h-12 w-12 rounded-lg" />
        <Pulse className="h-4 w-20" />
      </div>
      <Pulse className="h-5 w-3/4" />
      <Pulse className="h-4 w-full" />
      <Pulse className="h-4 w-2/3" />
      <div className="flex items-center gap-1 pt-4 border-t border-[#222]">
        <Pulse className="h-6 w-6 rounded-full" />
        <Pulse className="h-6 w-6 rounded-full" />
        <Pulse className="h-6 w-6 rounded-full" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card p-6 space-y-3">
      <Pulse className="h-6 w-6" />
      <Pulse className="h-10 w-24" />
      <Pulse className="h-4 w-16" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-[#222]">
      <td className="px-6 py-4"><Pulse className="h-10 w-10 rounded-full mx-auto" /></td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Pulse className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Pulse className="h-4 w-32" />
            <Pulse className="h-3 w-20" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><Pulse className="h-6 w-12 mx-auto" /></td>
      <td className="px-6 py-4"><Pulse className="h-9 w-20 ml-auto" /></td>
    </tr>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#222] bg-[#0A0A0A]">
              <th className="w-12 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Rank</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Creator</th>
              <th className="w-20 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Votes</th>
              <th className="w-32 px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Vote</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-12">
      <div className="card p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Pulse className="h-32 w-32 rounded-full" />
          <div className="flex-1 space-y-4">
            <Pulse className="h-10 w-64" />
            <Pulse className="h-5 w-32" />
            <Pulse className="h-4 w-full max-w-md" />
            <Pulse className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    </div>
  );
}

export function CategoriesGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="space-y-6">
        <Pulse className="h-8 w-40" />
        <LeaderboardSkeleton />
      </div>
    </div>
  );
}

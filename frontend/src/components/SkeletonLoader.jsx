import React from 'react';

// Shared base pulse animation class
const pulseClass = "animate-pulse bg-slate-200 dark:bg-slate-800 rounded-2xl";

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Title section placeholder */}
      <div className="space-y-2">
        <div className={`${pulseClass} h-7 w-48`} />
        <div className={`${pulseClass} h-4 w-72`} />
      </div>

      {/* Metrics Stat Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 flex items-center justify-between shadow-sm">
            <div className="space-y-2.5 flex-1">
              <div className={`${pulseClass} h-3.5 w-24`} />
              <div className={`${pulseClass} h-7 w-16`} />
            </div>
            <div className={`${pulseClass} w-12 h-12 rounded-2xl`} />
          </div>
        ))}
      </div>

      {/* Analytics Charts placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm space-y-4">
            <div className={`${pulseClass} h-4.5 w-36`} />
            <div className={`${pulseClass} h-72 w-full`} />
          </div>
        ))}
      </div>

      {/* Activities list placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catalog Warnings */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm space-y-4 lg:col-span-1">
          <div className={`${pulseClass} h-4 w-32`} />
          <div className="space-y-3">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className={`${pulseClass} h-3.5 w-28`} />
                  <div className={`${pulseClass} h-2.5 w-20`} />
                </div>
                <div className={`${pulseClass} h-5 w-10`} />
              </div>
            ))}
          </div>
        </div>

        {/* Activity log */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm space-y-4 lg:col-span-2">
          <div className={`${pulseClass} h-4 w-40`} />
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="flex gap-4 items-start border-b border-slate-50 dark:border-slate-900 pb-3 last:border-0">
                <div className={`${pulseClass} w-8 h-8 rounded-lg shrink-0`} />
                <div className="space-y-2 flex-1">
                  <div className={`${pulseClass} h-3.5 w-44`} />
                  <div className={`${pulseClass} h-3 w-full`} />
                  <div className={`${pulseClass} h-2 w-16`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="space-y-4">
      {/* Table grid wrapper */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-250 dark:border-slate-800">
              {[...Array(cols)].map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className={`${pulseClass} h-3 w-16`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {[...Array(rows)].map((_, rIdx) => (
              <tr key={rIdx}>
                {[...Array(cols)].map((_, cIdx) => (
                  <td key={cIdx} className="px-6 py-4">
                    <div className={`${pulseClass} h-3.5 ${cIdx === 0 ? 'w-28' : 'w-16'}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination wrapper placeholder */}
      <div className="flex justify-between items-center pt-2">
        <div className={`${pulseClass} h-3.5 w-32`} />
        <div className="flex gap-2">
          <div className={`${pulseClass} h-8 w-16`} />
          <div className={`${pulseClass} h-8 w-16`} />
        </div>
      </div>
    </div>
  );
};

export const DetailsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header section profile */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className={`${pulseClass} w-16 h-16 rounded-2xl`} />
          <div className="space-y-2">
            <div className={`${pulseClass} h-6 w-40`} />
            <div className={`${pulseClass} h-3.5 w-24`} />
          </div>
        </div>
        <div className="flex gap-3">
          <div className={`${pulseClass} h-9 w-24`} />
          <div className={`${pulseClass} h-9 w-24`} />
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: General Profile Card */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm space-y-4">
          <div className={`${pulseClass} h-4.5 w-36`} />
          <div className="space-y-4 pt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className={`${pulseClass} h-2.5 w-16`} />
                <div className={`${pulseClass} h-4 w-full`} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Tab panel placeholders */}
        <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm space-y-6">
          <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className={`${pulseClass} h-4.5 w-20`} />
            <div className={`${pulseClass} h-4.5 w-20`} />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="space-y-2 flex-1">
                  <div className={`${pulseClass} h-4 w-32`} />
                  <div className={`${pulseClass} h-3 w-48`} />
                </div>
                <div className={`${pulseClass} h-8 w-8 rounded-full`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

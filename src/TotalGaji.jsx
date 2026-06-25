import { useOutletContext } from "react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { API } from "./lib/Api";

const FILTER_OPTIONS = [
    { key: "all", label: "Semua" },
    { key: "week", label: "Minggu Ini" },
    { key: "month", label: "Bulan Ini" },
];

// Helper: compute start/end ISO strings based on filter key
function getDateRange(filterKey) {
    const now = new Date();
    let start;

    if (filterKey === "week") {
        // Monday of the current week
        const day = now.getDay(); // 0=Sun, 1=Mon, ...
        const diff = day === 0 ? 6 : day - 1; // days since Monday
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
    } else if (filterKey === "month") {
        // First day of current month
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
        // "all" — use a very early date
        start = new Date("2020-01-01T00:00:00.000Z");
    }

    start.setHours(0, 0, 0, 0);

    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end.setHours(0, 0, 0, 0);

    return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
    };
}

export default function TotalGaji() {
    const { workLogs, isLoadingWorkLogs, isError } = useOutletContext();
    const [activeFilter, setActiveFilter] = useState("all");

    // Compute date range from active filter
    const dateRange = useMemo(() => getDateRange(activeFilter), [activeFilter]);

    // Fetch income from the API
    const {
        data: incomeData,
        isLoading: isLoadingIncome,
        isFetching: isFetchingIncome,
    } = useQuery({
        queryKey: ["income", dateRange.startDate, dateRange.endDate],
        queryFn: () => API.GetIncome(dateRange),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const totalIncome = incomeData?.data?.totalIncome ?? 0;

    const completedLogs = workLogs?.data?.filter(log => log.status === "SETOR") || [];

    const totalLosin = completedLogs.reduce((sum, log) => sum + (log.quantityDozens || 0), 0);
    const totalPekerjaan = completedLogs.length;

    const bagTypeMap = {};
    completedLogs.forEach(log => {
        const name = log.bagType?.name || "Lainnya";
        if (!bagTypeMap[name]) {
            bagTypeMap[name] = { name, totalPay: 0, totalDozens: 0, count: 0 };
        }
        bagTypeMap[name].totalPay += log.estimatedPay || 0;
        bagTypeMap[name].totalDozens += log.quantityDozens || 0;
        bagTypeMap[name].count += 1;
    });
    const bagTypeBreakdown = Object.values(bagTypeMap).sort((a, b) => b.totalPay - a.totalPay);

    const topBagType = bagTypeBreakdown[0];

    if (isLoadingWorkLogs) {
        return (
            <div className="min-h-screen bg-neutral-950 text-neutral-200 p-4 md:p-8 font-sans">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="animate-pulse space-y-3 pt-4">
                        <div className="h-4 w-28 bg-neutral-800 rounded" />
                        <div className="h-9 w-56 bg-neutral-800 rounded" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 space-y-3">
                                <div className="h-3 w-20 bg-neutral-800 rounded" />
                                <div className="h-8 w-32 bg-neutral-800 rounded" />
                            </div>
                        ))}
                    </div>

                    <div className="animate-pulse space-y-4">
                        <div className="h-6 w-40 bg-neutral-800 rounded" />
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex justify-between items-center">
                                <div className="space-y-2">
                                    <div className="h-5 w-28 bg-neutral-800 rounded" />
                                    <div className="h-3 w-40 bg-neutral-800 rounded" />
                                </div>
                                <div className="h-7 w-32 bg-neutral-800 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-neutral-950 p-6 flex flex-col items-center justify-center text-center">
                <div className="max-w-md mx-auto flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-red-500/30 mb-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-2xl font-light text-neutral-300 mb-2 tracking-wide">Gagal Memuat Data</h3>
                    <p className="text-neutral-500">Terjadi gangguan saat mencoba terhubung ke server.</p>
                </div>
            </div>
        );
    }

    const formatRupiah = (val) => `Rp ${val.toLocaleString("id-ID")}`;

    const bagTypeColors = [
        { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400", bar: "bg-indigo-500" },
        { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", bar: "bg-purple-500" },
        { bg: "bg-sky-500/10", border: "border-sky-500/20", text: "text-sky-400", bar: "bg-sky-500" },
        { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", bar: "bg-amber-500" },
        { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400", bar: "bg-rose-500" },
    ];

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 p-4 font-sans selection:bg-indigo-500/30">
            <div className="max-w-7xl mx-auto space-y-8">

                <header className="pt-2 md:pt-4">
                    <p className="text-neutral-500 text-sm font-medium tracking-wide uppercase mb-1">Ringkasan</p>
                    <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        Total Gaji
                    </h1>
                </header>

                <div className="flex gap-2">
                    {FILTER_OPTIONS.map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => setActiveFilter(opt.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                                activeFilter === opt.key
                                    ? "bg-neutral-800 text-white shadow-lg shadow-black/20"
                                    : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/60"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                    {/* Total Pendapatan — from income API */}
                    <div className="col-span-2 md:col-span-1 bg-neutral-900/60 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-60" />
                        <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider mb-2">Total Pendapatan</p>
                        <p className={`text-3xl md:text-4xl font-bold text-emerald-400 tracking-tight transition-opacity duration-300 ${isFetchingIncome ? "opacity-40" : "opacity-100"}`}>
                            {isLoadingIncome ? (
                                <span className="inline-block h-9 w-40 bg-neutral-800 rounded animate-pulse" />
                            ) : (
                                formatRupiah(totalIncome)
                            )}
                        </p>
                        <div className="flex items-center gap-1.5 mt-3">
                            <span className={`w-2 h-2 rounded-full bg-emerald-500 ${isFetchingIncome ? "animate-pulse" : ""}`} />
                            <span className="text-xs text-emerald-500/70">
                                {activeFilter === "all" ? "Seluruh waktu" : activeFilter === "week" ? "Minggu ini" : "Bulan ini"}
                            </span>
                        </div>
                    </div>

                    {/* Total Losin */}
                    <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-2xl p-6">
                        <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider mb-2">Total Losin</p>
                        <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                            {totalLosin.toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs text-neutral-600 mt-2">losin dikerjakan</p>
                    </div>

                    {/* Jumlah Pekerjaan */}
                    <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-2xl p-6">
                        <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider mb-2">Pekerjaan Selesai</p>
                        <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                            {totalPekerjaan}
                        </p>
                        <p className="text-xs text-neutral-600 mt-2">setoran tercatat</p>
                    </div>
                </div>

                {topBagType && (
                    <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-400">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Penghasilan Tertinggi</p>
                            <p className="text-white font-semibold truncate">{topBagType.name}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-amber-400 font-bold text-lg">{formatRupiah(topBagType.totalPay)}</p>
                            <p className="text-xs text-neutral-500">{topBagType.count} pekerjaan</p>
                        </div>
                    </div>
                )}

                <section>
                    <h2 className="text-xl font-semibold text-white mb-4">Rincian per Tipe Tas</h2>

                    {bagTypeBreakdown.length === 0 ? (
                        <div className="text-center py-16 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                            Belum ada data gaji.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {bagTypeBreakdown.map((bt, i) => {
                                const color = bagTypeColors[i % bagTypeColors.length];
                                const totalGaji = completedLogs.reduce((sum, log) => sum + (log.estimatedPay || 0), 0);
                                const percentage = totalGaji > 0 ? (bt.totalPay / totalGaji) * 100 : 0;

                                return (
                                    <div
                                        key={bt.name}
                                        className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-2xl p-5 hover:bg-neutral-900/80 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg ${color.bg} ${color.border} border flex items-center justify-center`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 ${color.text}`}>
                                                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                                        <path d="M3 6h18" />
                                                        <path d="M16 10a4 4 0 0 1-8 0" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-semibold">{bt.name}</h3>
                                                    <p className="text-xs text-neutral-500">
                                                        {bt.count} pekerjaan · {bt.totalDozens} losin
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold text-lg ${color.text}`}>{formatRupiah(bt.totalPay)}</p>
                                                <p className="text-xs text-neutral-600">{percentage.toFixed(1)}%</p>
                                            </div>
                                        </div>

                                        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${color.bar} rounded-full transition-all duration-700 ease-out`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="pb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Riwayat Terakhir</h2>

                    {completedLogs.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                            Belum ada riwayat setoran.
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-neutral-800">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-neutral-900/80 text-neutral-500 text-xs uppercase tracking-wider">
                                        <th className="text-left p-4 font-medium">Tipe Tas</th>
                                        <th className="text-left p-4 font-medium hidden sm:table-cell">Tanggal</th>
                                        <th className="text-center p-4 font-medium">Losin</th>
                                        <th className="text-right p-4 font-medium">Gaji</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800/50">
                                    {completedLogs.slice(0, 10).map((log) => (
                                        <tr
                                            key={log.id}
                                            className="hover:bg-neutral-900/40 transition-colors duration-200"
                                        >
                                            <td className="p-4">
                                                <p className="text-white font-medium">{log.bagType?.name}</p>
                                                <p className="text-neutral-600 text-xs sm:hidden mt-0.5">
                                                    {new Date(log.startTime).toLocaleDateString("id-ID", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </p>
                                            </td>
                                            <td className="p-4 text-neutral-400 hidden sm:table-cell">
                                                {new Date(log.startTime).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="p-4 text-center text-neutral-300">{log.quantityDozens}</td>
                                            <td className="p-4 text-right font-semibold text-emerald-400">
                                                {formatRupiah(log.estimatedPay || 0)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {completedLogs.length > 10 && (
                                <div className="bg-neutral-900/40 border-t border-neutral-800/50 px-4 py-3 text-center">
                                    <p className="text-xs text-neutral-500">
                                        Menampilkan 10 dari {completedLogs.length} setoran
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}

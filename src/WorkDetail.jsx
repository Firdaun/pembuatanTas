import { useOutletContext, useParams } from "react-router"
import { formatDurasi } from "./App"

export default function WorkDetail() {
    const { id } = useParams()
    const { workLogs, isLoadingWorkLogs, isError, refetch } = useOutletContext()

    const workDetail = workLogs?.data?.find(log => log.id === Number(id))

    if (isLoadingWorkLogs) return (
        <div className="min-h-screen bg-neutral-950 p-6 md:p-12">
            <div className="max-w-3xl mx-auto mt-8 md:mt-12 space-y-10 animate-pulse">

                {/* Skeleton Header */}
                <div className="flex justify-between items-end mb-12 border-b border-neutral-900 pb-6">
                    <div>
                        <div className="h-4 w-32 bg-neutral-900 rounded mb-4"></div>
                        <div className="h-10 w-64 bg-neutral-800 rounded"></div>
                    </div>
                    <div className="h-6 w-24 bg-neutral-900 rounded"></div>
                </div>

                {/* Skeleton List Data */}
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex justify-between items-baseline border-b border-neutral-900 pb-6">
                        <div className="h-5 w-36 bg-neutral-900 rounded"></div>
                        <div className="h-6 w-28 bg-neutral-800 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    )
    if (isError) return (
        <div className="min-h-screen bg-neutral-950 p-6 flex flex-col items-center justify-center text-center">
            <div className="max-w-md mx-auto flex flex-col items-center">
                {/* Ikon Error Polos */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-red-500/30 mb-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>

                <h3 className="text-2xl font-light text-neutral-300 mb-2 tracking-wide">
                    Gagal Memuat Data
                </h3>
                <p className="text-neutral-500 mb-10">
                    Terjadi gangguan saat mencoba terhubung ke server. Pastikan koneksi internet aktif.
                </p>

                {/* Tombol Retry Flat */}
                <button
                    onClick={() => refetch()}
                    className="text-emerald-400 hover:text-emerald-300 font-medium tracking-wide flex items-center gap-2 transition-colors border-b border-emerald-500/30 hover:border-emerald-400 pb-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Coba Muat Ulang
                </button>
            </div>
        </div>
    )

    return (
        <div className="h-dvh bg-neutral-950 text-neutral-200 p-5 md:p-12 font-sans selection:bg-indigo-500/30">
            {workDetail ? (
                <div className="max-w-3xl mx-auto md:mt-12">

                    {/* Tombol Kembali Tanpa Kotak */}
                    <button
                        onClick={() => window.history.back()}
                        className="text-neutral-500 hover:text-white flex items-center gap-2 text-sm mb-12 transition-colors w-fit"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        Kembali ke Riwayat
                    </button>

                    {/* Header: Bersih dan Teks Besar */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div>
                            <p className="text-neutral-500 font-mono text-sm tracking-widest uppercase mb-3">
                                ID Pekerjaan #{workDetail.id}
                            </p>
                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                                {workDetail.bagType?.name}
                            </h1>
                        </div>
                        <div>
                            <span className={`text-sm font-bold tracking-widest uppercase flex items-center gap-2 ${workDetail.status === 'SETOR' ? 'text-emerald-400' : 'text-amber-400'
                                }`}>
                                <span className={`w-2 h-2 rounded-full ${workDetail.status === 'SETOR' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                                {workDetail.status}
                            </span>
                        </div>
                    </div>

                    <hr className="border-neutral-800 mb-10" />

                    {/* Content: List/Baris Simpel Tanpa Kotak */}
                    <div className="space-y-6">

                        {/* Gaji di-highlight dengan ukuran font tipis tapi sangat besar */}
                        <div className="flex justify-between items-baseline mb-12">
                            <span className="text-neutral-400 text-lg">Total Gaji</span>
                            <span className="text-5xl md:text-6xl font-light text-emerald-400">
                                Rp {workDetail.estimatedPay?.toLocaleString('id-ID')}
                            </span>
                        </div>

                        <div className="flex justify-between items-baseline border-b border-neutral-900 pb-6">
                            <span className="text-neutral-500">Jumlah Disetor</span>
                            <span className="text-2xl text-white">
                                {workDetail.quantityDozens} <span className="text-neutral-600 text-lg">Losin</span>
                            </span>
                        </div>

                        <div className="flex justify-between items-baseline border-b border-neutral-900 pb-6">
                            <span className="text-neutral-500">Upah per Losin</span>
                            <span className="text-xl text-white">
                                Rp {workDetail.pricePerDozen?.toLocaleString('id-ID')}
                            </span>
                        </div>

                        <div className="flex justify-between items-baseline border-b border-neutral-900 pb-6">
                            <span className="text-neutral-500">Tanggal di buat</span>
                            <span className="text-lg text-white">
                                {new Date(workDetail.startTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>

                        <div className="flex justify-between items-baseline pb-6 border-b border-neutral-900">
                            <span className="text-neutral-500 self-center">Waktu Pengerjaan</span>
                            <span className="text-sm text-neutral-300 flex flex-col justify-center items-center font-mono">
                                {new Date(workDetail.startTime).toLocaleString('id-ID', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                                <span className="mx-3 my-2 text-neutral-600"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z"></path></svg></span>
                                {workDetail.endTime ? new Date(workDetail.endTime).toLocaleString('id-ID', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : '...'}
                            </span>
                        </div>

                        <div className="flex justify-between items-baseline pb-6">
                            <span className="text-neutral-500">Lama pengerjaan</span>
                            <span className="text-lg text-neutral-300 font-mono">
                                {formatDurasi(workDetail.startTime, workDetail.endTime)}
                            </span>
                        </div>

                    </div>
                </div>
            ) : (
                <div className="flex justify-center mt-32 text-neutral-600 font-mono text-sm animate-pulse">
                    Memuat data...
                </div>
            )}
        </div>
    )
}
import { useEffect, useRef } from 'react'
import { API } from './lib/Api'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate, useOutletContext } from 'react-router'

export const formatDurasi = (start, end) => {
    if (!start || !end) return '-';

    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const selisihMs = endTime - startTime;

    const totalDetik = Math.floor(selisihMs / 1000);

    if (totalDetik < 60) {
        return `${totalDetik} Detik`;
    }

    const totalMenit = Math.floor(totalDetik / 60);

    if (totalMenit < 60) {
        return `${totalMenit} Menit`;
    }

    const jam = Math.floor(totalMenit / 60);
    const sisaMenit = totalMenit % 60;

    if (sisaMenit === 0) {
        return `${jam} Jam`;
    }

    return `${jam} Jam ${sisaMenit} Menit`;
}

export default function App() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const popupRef = useRef(null)
    const { workLogs, isLoadingWorkLogs, isError, showModal, setShowModal } = useOutletContext()
    const { register: dataKantong, handleSubmit: handleKantongSubmit, formState: { errors: errorSubmit }, reset } = useForm({
        values: {
            bagTypeId: '',
            quantityDozens: ''
        }
    })

    const activeLog = workLogs?.data?.find(log => log.status === 'PENDING')
    const historyLogs = workLogs?.data?.filter(log => log.status === 'SETOR') || []

    // create work logs
    const kantongSubmit = useMutation({
        mutationFn: API.CreateWork
    })

    const handleSubmit = async (form) => {
        toast.promise(
            new Promise((resolve, reject) => {
                kantongSubmit.mutate(form, {
                    onSuccess: (res) => {
                        queryClient.invalidateQueries({ queryKey: ['work-logs'] })
                        reset()
                        setShowModal(false)
                        resolve(res)
                    },
                    onError: (error) => reject(error)
                })
            }),
            {
                loading: 'Menyimpan data...',
                success: (data) => data.message,
                error: (error) => error.message
            }
        )
    }
    const isPending = kantongSubmit.isPending

    // update work logs
    const updateWorkLogs = useMutation({
        mutationFn: API.UpdateWorkLogs
    })
    const handleUpdateWorkLogs = async (id) => {
        toast.promise(
            new Promise((resolve, reject) => {
                updateWorkLogs.mutate(id, {
                    onSuccess: (res) => {
                        queryClient.invalidateQueries({ queryKey: ['work-logs'] })
                        resolve(res)
                    },
                    onError: (error) => reject(error)
                })
            }),
            {
                loading: 'Mengupdate data...',
                success: (data) => data.message,
                error: (error) => error.message
            }
        )
    }
    const isUpdateWorkLogsPending = updateWorkLogs.isPending

    const confirmUpdateWorkLogs = (id) => {
        toast('Konfirmasi Setoran', {
            description: 'Apakah yakin pekerjaan ini sudah selesai?',
            action: {
                label: 'Ya',
                onClick: () => handleUpdateWorkLogs(id)
            },
            cancel: {
                label: 'Batal',
                onClick: () => toast.dismiss()
            },
            duration: 5000,
        })
    }

    useEffect(() => {
        if (!showModal) return
        const handleClickOutside = (e) => {
            if (!popupRef.current.contains(e.target)) {
                setShowModal(false)
                reset()
            }
        }

        document.addEventListener('pointerdown', handleClickOutside)
        return () => document.removeEventListener('pointerdown', handleClickOutside)
    }, [showModal, reset, setShowModal])

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Catatan Setoran
                    </h1>
                    <p className="text-neutral-400 mt-1">Pantau progres pekerjaan dan estimasi gaji dengan mudah.</p>
                </header>

                {/* ═══ MODAL POPUP FORM ═══ */}
                <div className="space-y-6">
                        {/* KOTAK KHUSUS: PEKERJAAN AKTIF (Hanya muncul jika ada) */}
                        {(activeLog && !isLoadingWorkLogs) && (
                            <div className="bg-neutral-900/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-amber-500/0 via-amber-500 to-amber-500/0 opacity-50"></div>

                                <h2 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-3">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                    </span>
                                    Sedang Dikerjakan
                                </h2>

                                <div className="bg-neutral-950/40 border border-amber-500/20 rounded-2xl p-5 space-y-5">
                                    {/* Info Utama Aktif */}
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b border-amber-500/10 pb-5">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold text-white tracking-wide">{activeLog?.bagType.name || 'Tas'}</h3>
                                                <span className="text-xs px-3 py-1 rounded-full font-medium tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    {activeLog?.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-neutral-400 mt-1.5">Mulai: {new Date(activeLog?.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div className="sm:text-right">
                                            <p className="text-xs font-medium text-amber-500/70 uppercase tracking-wider mb-1">Etimasi Gaji</p>
                                            <p className="text-2xl font-bold text-amber-400">Rp {activeLog?.estimatedPay.toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>

                                    {/* Grid Detail Aktif & Tombol Setor */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800/50">
                                            <p className="text-neutral-500 text-xs mb-1">Jumlah</p>
                                            <p className="font-medium text-neutral-200">{activeLog?.quantityDozens} Losin</p>
                                        </div>
                                        <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800/50">
                                            <p className="text-neutral-500 text-xs mb-1">Upah/Losin</p>
                                            <p className="font-medium text-neutral-200">Rp {activeLog?.pricePerDozen?.toLocaleString('id-ID')}</p>
                                        </div>
                                        <div className="col-span-2 flex items-stretch">
                                            <button
                                                onClick={() => confirmUpdateWorkLogs(activeLog.id)}
                                                disabled={isUpdateWorkLogsPending}
                                                className="w-full bg-emerald-600/10 hover:bg-emerald-600/20 active:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 font-medium p-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {isUpdateWorkLogsPending && updateWorkLogs.variables === activeLog.id ? 'Memproses...' : 'Tandai Selesai'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* KOTAK RIWAYAT SELESAI */}
                        <div className="min-h-[300px]">

                            {isLoadingWorkLogs ? (
                                <div>
                                    <div className="bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-pulse">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-neutral-800"></div>

                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-3 w-3 bg-neutral-800 rounded-full"></div>
                                            <div className="h-6 w-44 bg-neutral-800 rounded"></div>
                                        </div>

                                        <div className="bg-neutral-950/40 border border-neutral-800 rounded-2xl p-5 space-y-5">
                                            {/* Info Utama Aktif */}
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b border-neutral-800 pb-5">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-6 w-28 bg-neutral-800 rounded"></div>
                                                        <div className="h-5 w-20 bg-neutral-800 rounded-full"></div>
                                                    </div>
                                                    <div className="h-3.5 w-32 bg-neutral-800 rounded mt-1.5"></div>
                                                </div>
                                                <div className="sm:text-right space-y-1.5">
                                                    <div className="h-3 w-24 bg-neutral-800 rounded sm:ml-auto"></div>
                                                    <div className="h-7 w-32 bg-neutral-800 rounded sm:ml-auto"></div>
                                                </div>
                                            </div>

                                            {/* Grid Detail Aktif & Tombol Setor */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800/50 space-y-1.5">
                                                    <div className="h-3 w-12 bg-neutral-800 rounded"></div>
                                                    <div className="h-4 w-16 bg-neutral-800 rounded"></div>
                                                </div>
                                                <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800/50 space-y-1.5">
                                                    <div className="h-3 w-16 bg-neutral-800 rounded"></div>
                                                    <div className="h-4 w-20 bg-neutral-800 rounded"></div>
                                                </div>
                                                <div className="col-span-2 flex items-stretch">
                                                    <div className="w-full bg-neutral-800/50 rounded-xl"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mt-6">
                                        <div className="h-6 w-40 bg-neutral-800 rounded mb-4 animate-pulse"></div>

                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="bg-neutral-900 border border-neutral-900 rounded-2xl p-5 space-y-5 animate-pulse">
                                                <div className="flex flex-col">
                                                    <div>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-5 w-24 bg-neutral-800 rounded"></div>
                                                                <div className="h-5 w-16 bg-neutral-800 rounded-full"></div>
                                                            </div>
                                                            <div className="h-4 w-14 bg-neutral-800 rounded"></div>
                                                        </div>
                                                        <div className="flex justify-between mt-1.5">
                                                            <div className="h-3.5 w-40 bg-neutral-800 rounded"></div>
                                                            <div className="h-3.5 w-16 bg-neutral-800 rounded"></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <div className="h-4 w-24 bg-neutral-800 rounded"></div>
                                                        <div className="h-6 w-28 bg-neutral-800 rounded"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : historyLogs.length === 0 ? (
                                <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">Belum ada riwayat setoran selesai.</div>
                            ) : isError ? (
                                <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">Gagal memuat riwayat setoran.</div>
                            ) : (
                                <div className="space-y-3">
                                    <h2 className="text-xl font-semibold text-white mb-4">Riwayat Selesai</h2>
                                    {historyLogs.map((log) => (
                                        <div key={log.id} onClick={() => navigate(`/work-detail/${log.id}`)} className="bg-neutral-900 border border-neutral-900 rounded-2xl p-5 hover:bg-neutral-900/60 transition-all duration-300 space-y-5">
                                            {/* Info Utama Riwayat */}
                                            <div className="flex flex-col">
                                                <div>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className='flex items-center gap-3'>
                                                            <h3 className="text-lg font-bold text-neutral-300 tracking-wide">{log.bagType?.name}</h3>
                                                            <span className="text-xs px-3 py-1 rounded-full font-medium tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                                {log.status}
                                                            </span>
                                                        </div>
                                                        <p className=''>{log.quantityDozens} Losin</p>
                                                    </div>
                                                    <div className="text-sm flex justify-between text-neutral-500 mt-1.5">
                                                        {new Date(log.startTime).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                        <span className="font-medium text-neutral-400">{formatDurasi(log.startTime, log.endTime)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-neutral-500">
                                                        ID Pekerjaan #{log.id}
                                                    </p>
                                                    <p className="text-xl font-bold text-emerald-500">Rp {log.estimatedPay?.toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                </div>
                {showModal && (
                    <div
                        className="fixed inset-0 z-60 flex bg-black/60 backdrop-blur-sm items-center justify-center p-4"
                    >
                        {/* Modal Content */}
                        <div className="relative w-full max-w-md animate-[modalIn_300ms_ease-out]">
                            <div ref={popupRef} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl shadow-black/40">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-xl font-semibold text-white">Input Setoran</h2>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                            <path d="M18 6 6 18" />
                                            <path d="m6 6 12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleKantongSubmit(handleSubmit)} className="space-y-4">
                                    <div className="relative">
                                        <label className="text-sm font-medium text-neutral-400">Tipe Tas</label>
                                        <select
                                            name="bagTypeId"
                                            {...dataKantong('bagTypeId', { required: "Tipe tas harus diisi" })}
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
                                        >
                                            <option value="1">Tas Inul</option>
                                            <option value="2">Tas Ibu</option>
                                            <option value="3">Tote Sambung</option>
                                            <option value="4">Tas Mini</option>
                                        </select>
                                        {errorSubmit.bagTypeId && <p className='absolute translate-y-1 text-xs text-red-500'>{errorSubmit.bagTypeId.message}</p>}
                                    </div>

                                    <div className="relative">
                                        <label className="text-sm font-medium text-neutral-400">Jumlah (Losin)</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            enterKeyHint="done"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    e.target.blur()
                                                }
                                            }}
                                            placeholder="Contoh: 5"
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-neutral-700"
                                            pattern="[0-9]*"
                                            {...dataKantong('quantityDozens', {
                                                required: "Jumlah losin harus diisi",
                                                pattern: {
                                                    value: /^[0-9]+$/,
                                                    message: "Hanya angka yang diperbolehkan"
                                                }
                                            })}
                                        />
                                        {errorSubmit.quantityDozens && <p className='absolute translate-y-1 text-xs text-red-500'>{errorSubmit.quantityDozens.message}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                                    >
                                        {isPending ? 'Memulai...' : 'Mulai'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
import { useState, useEffect } from 'react'
import { API } from './lib/Api'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function App() {
    const queryClient = useQueryClient()

    const { register: dataKantong, handleSubmit: handleKantongSubmit, formState: { errors: errorSubmit }, reset } = useForm({
        values: {
            bagTypeId: '',
            quantityDozens: ''
        }
    })

    const { data: workLogs, isLoading: isLoadingWorkLogs } = useQuery({
        queryKey: ['work-logs'],
        queryFn: API.ListWorkLogs,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
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
                loading: 'Menyimpan data...',
                success: (data) => data.message,
                error: (error) => error.message
            }
        )
    }
    const isUpdateWorkLogsPending = updateWorkLogs.isPending

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {!activeLog && (
                        <div className="md:col-span-1">
                            <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 shadow-2xl">
                                <h2 className="text-xl font-semibold text-white mb-4">Input Setoran</h2>
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
                                        </select>
                                        {errorSubmit.bagTypeId && <p className='absolute translate-y-1 text-xs text-red-500'>{errorSubmit.bagTypeId.message}</p>}
                                    </div>

                                    <div className="relative">
                                        <label className="text-sm font-medium text-neutral-400">Jumlah (Losin)</label>
                                        <input
                                            type="number"
                                            placeholder="Contoh: 5"
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-neutral-700"
                                            {...dataKantong('quantityDozens', { required: "Jumlah losin harus diisi" })}
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
                    )}

                    <div className="md:col-span-2 space-y-6">

                        {/* KOTAK KHUSUS: PEKERJAAN AKTIF (Hanya muncul jika ada) */}
                        {activeLog && (
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
                                                <h3 className="text-xl font-bold text-white tracking-wide">{activeLog.bagType?.name || 'Tas'}</h3>
                                                <span className="text-xs px-3 py-1 rounded-full font-medium tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    {activeLog.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-neutral-400 mt-1.5">Mulai: {new Date(activeLog.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div className="sm:text-right">
                                            <p className="text-xs font-medium text-amber-500/70 uppercase tracking-wider mb-1">Etimasi Gaji</p>
                                            <p className="text-2xl font-bold text-amber-400">Rp {activeLog.estimatedPay?.toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>

                                    {/* Grid Detail Aktif & Tombol Setor */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800/50">
                                            <p className="text-neutral-500 text-xs mb-1">Jumlah</p>
                                            <p className="font-medium text-neutral-200">{activeLog.quantityDozens} Losin</p>
                                        </div>
                                        <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800/50">
                                            <p className="text-neutral-500 text-xs mb-1">Upah/Losin</p>
                                            <p className="font-medium text-neutral-200">Rp {activeLog.pricePerDozen?.toLocaleString('id-ID')}</p>
                                        </div>
                                        <div className="col-span-2 flex items-stretch">
                                            <button
                                                onClick={() => handleUpdateWorkLogs(activeLog.id)}
                                                disabled={isUpdateWorkLogsPending}
                                                className="w-full bg-emerald-600/10 hover:bg-emerald-600/20 active:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 font-medium p-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {isUpdateWorkLogsPending && updateWorkLogs.variables === activeLog.id ? 'Memproses...' : 'Tandai Selesai (Setor)'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* KOTAK RIWAYAT SELESAI */}
                        <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 shadow-2xl min-h-[300px]">
                            <h2 className="text-xl font-semibold text-white mb-4">Riwayat Selesai</h2>

                            {isLoadingWorkLogs ? (
                                <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">Loading...</div>
                            ) : historyLogs.length === 0 ? (
                                <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">Belum ada riwayat setoran selesai.</div>
                            ) : (
                                <div className="space-y-3">
                                    {historyLogs.map((log) => (
                                        <div key={log.id} className="bg-neutral-950/30 border border-neutral-800 rounded-2xl p-5 hover:bg-neutral-900/60 transition-all duration-300 space-y-5">
                                            {/* Info Utama Riwayat */}
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b border-neutral-800/60 pb-5">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-lg font-bold text-neutral-300 tracking-wide">{log.bagType?.name || 'Tas'}</h3>
                                                        <span className="text-xs px-3 py-1 rounded-full font-medium tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                            {log.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-neutral-500 mt-1.5">
                                                        {new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div className="sm:text-right">
                                                    <p className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-1">Gaji Diterima</p>
                                                    <p className="text-xl font-bold text-emerald-500">Rp {log.estimatedPay?.toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>

                                            {/* Grid Detail Riwayat */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                <div className="bg-neutral-950/50 p-3.5 rounded-xl border border-neutral-800/50">
                                                    <p className="text-neutral-500 text-xs mb-1">Jumlah Disetor</p>
                                                    <p className="font-medium text-neutral-400">{log.quantityDozens} Losin</p>
                                                </div>
                                                <div className="bg-neutral-950/50 p-3.5 rounded-xl border border-neutral-800/50">
                                                    <p className="text-neutral-500 text-xs mb-1">Upah per Losin</p>
                                                    <p className="font-medium text-neutral-400">Rp {log.pricePerDozen?.toLocaleString('id-ID')}</p>
                                                </div>
                                                <div className="bg-neutral-950/50 p-3.5 rounded-xl border border-neutral-800/50">
                                                    <p className="text-neutral-500 text-xs mb-1">Waktu Kerja</p>
                                                    <p className="font-medium text-neutral-400">
                                                        {new Date(log.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} {' - '}
                                                        {log.endTime ? new Date(log.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '...'}
                                                    </p>
                                                </div>
                                                <div className="bg-neutral-950/50 p-3.5 rounded-xl border border-neutral-800/50">
                                                    <p className="text-neutral-500 text-xs mb-1">Lama Pengerjaan</p>
                                                    <p className="font-medium text-neutral-400">{log.durationMinutes ? `${log.durationMinutes} Menit` : '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
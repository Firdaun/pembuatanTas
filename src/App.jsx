import { useState, useEffect } from 'react'
import { API } from './lib/Api'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function App() {
    const queryClient = useQueryClient()

    const { register: dataKantong, handleSubmit: handleKantongSubmit, formState: { errors: errorSubmit } } = useForm({
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

    console.log(workLogs);


    const kantongSubmit = useMutation({
        mutationFn: API.CreateWork
    })

    const handleSubmit = async (form) => {
        toast.promise(
            new Promise((resolve, reject) => {
                kantongSubmit.mutate(form, {
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

    const isPending = kantongSubmit.isPending

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header Section */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Catatan Setoran Ibu
                    </h1>
                    <p className="text-neutral-400 mt-1">Pantau progres pekerjaan dan estimasi gaji dengan mudah.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Form Input Section */}
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
                                    {isPending ? 'Menyimpan...' : 'Simpan Setoran'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 shadow-2xl h-full">
                            <h2 className="text-xl font-semibold text-white mb-4">Riwayat Pekerjaan</h2>

                            {isLoadingWorkLogs ? (
                                <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                                    Loading...
                                </div>
                            ) : workLogs.data.length === 0 ? (
                                <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                                    Belum ada data setoran.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {workLogs.data.map((log) => (
                                        <div key={log.id} className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 hover:bg-neutral-900/60 transition-all duration-300 space-y-5">

                                            {/* Bagian Atas: Info Utama */}
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b border-neutral-800/60 pb-5">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-xl font-bold text-white tracking-wide">
                                                            {log.bagType?.name || 'Tas'}
                                                        </h3>
                                                        {/* Badge Status Dinamis */}
                                                        <span className={`text-xs px-3 py-1 rounded-full font-medium tracking-wide ${log.status === 'SETOR'
                                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                            }`}>
                                                            {log.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-neutral-400 mt-1.5">
                                                        {new Date(log.date).toLocaleDateString('id-ID', {
                                                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="sm:text-right">
                                                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Estimasi Gaji</p>
                                                    <p className="text-2xl font-bold text-emerald-400">
                                                        Rp {log.estimatedPay?.toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Bagian Bawah: Grid Spesifikasi Detail */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                {/* Box 1: Jumlah */}
                                                <div className="bg-neutral-950/50 p-3.5 rounded-xl border border-neutral-800/50">
                                                    <p className="text-neutral-500 text-xs mb-1">Jumlah Disetor</p>
                                                    <p className="font-medium text-neutral-200 text-base">{log.quantityDozens} Losin</p>
                                                </div>

                                                {/* Box 2: Harga Satuan */}
                                                <div className="bg-neutral-950/50 p-3.5 rounded-xl border border-neutral-800/50">
                                                    <p className="text-neutral-500 text-xs mb-1">Upah per Losin</p>
                                                    <p className="font-medium text-neutral-200">Rp {log.pricePerDozen?.toLocaleString('id-ID')}</p>
                                                </div>

                                                {/* Box 3: Waktu Pengerjaan */}
                                                <div className="bg-neutral-950/50 p-3.5 rounded-xl border border-neutral-800/50">
                                                    <p className="text-neutral-500 text-xs mb-1">Waktu Kerja</p>
                                                    <p className="font-medium text-neutral-200">
                                                        {new Date(log.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                        {' - '}
                                                        {log.endTime ? new Date(log.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '...'}
                                                    </p>
                                                </div>

                                                {/* Box 4: Durasi */}
                                                <div className="bg-neutral-950/50 p-3.5 rounded-xl border border-neutral-800/50">
                                                    <p className="text-neutral-500 text-xs mb-1">Lama Pengerjaan</p>
                                                    <p className="font-medium text-neutral-200">
                                                        {log.durationMinutes ? `${log.durationMinutes} Menit` : '-'}
                                                    </p>
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
import { useState, useEffect } from 'react'
import { API } from './lib/Api'

export default function App() {
    const [workLogs, setWorkLogs] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        bagTypeId: '',
        quantityDozens: ''
    })

    // Fetch data saat aplikasi pertama kali dimuat
    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        try {
            const response = await API.ListWorkLogs()
            setWorkLogs(response.data || [])
        } catch (error) {
            console.error("Gagal mengambil data:", error.message)
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        
        try {
            await API.CreateWork({
                bagTypeId: parseInt(formData.bagTypeId),
                quantityDozens: parseFloat(formData.quantityDozens)
            })
            
            // Reset form dan ambil data terbaru setelah sukses
            setFormData({ bagTypeId: '', quantityDozens: '' })
            fetchLogs()
        } catch (error) {
            alert(error.message)
        } finally {
            setIsLoading(false)
        }
    }

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
                            <form onSubmit={handleSubmit} className="space-y-4">
                                
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-neutral-400">Tipe Tas</label>
                                    <select 
                                        name="bagTypeId"
                                        value={formData.bagTypeId}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="" disabled>Pilih Tipe Tas...</option>
                                        {/* TODO: Nantinya ini di-fetch dari API Master Data */}
                                        <option value="1">Tas Inul</option>
                                        <option value="2">Tas Ibu</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-neutral-400">Jumlah (Losin)</label>
                                    <input 
                                        type="number"
                                        name="quantityDozens"
                                        step="0.1"
                                        min="0.1"
                                        value={formData.quantityDozens}
                                        onChange={handleChange}
                                        placeholder="Contoh: 5"
                                        required
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-neutral-700"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                                >
                                    {isLoading ? 'Menyimpan...' : 'Simpan Setoran'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Riwayat Section */}
                    <div className="md:col-span-2">
                        <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 shadow-2xl h-full">
                            <h2 className="text-xl font-semibold text-white mb-4">Riwayat Pekerjaan</h2>
                            
                            {workLogs.length === 0 ? (
                                <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                                    Belum ada data setoran.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {workLogs.map((log) => (
                                        <div key={log.id} className="flex justify-between items-center p-4 bg-neutral-950/50 border border-neutral-800/80 rounded-xl hover:border-neutral-700 transition-colors">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-white">{log.bagType?.name || 'Tas'}</span>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                        {log.status}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-neutral-400 mt-1">
                                                    {log.quantityDozens} Losin • {new Date(log.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-emerald-400">
                                                    Rp {log.estimatedPay?.toLocaleString('id-ID')}
                                                </div>
                                                <div className="text-xs text-neutral-500 mt-0.5">
                                                    @ Rp {log.pricePerDozen?.toLocaleString('id-ID')}/lsn
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
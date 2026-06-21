import { useOutletContext, useParams } from "react-router"

export default function WorkDetail() {
    const { id } = useParams()
    const { workLogs, isLoadingWorkLogs, isError } = useOutletContext()

    const workDetail = workLogs?.data?.find(log => log.id === Number(id))

    if (isLoadingWorkLogs) return <div>Loading...</div>
    if (isError) return <div>Error...</div>

    return (
        <div>
            <h1>Detail Kerja</h1>
            <p>ID: {workDetail?.id}</p>
            <p>Tipe Tas: {workDetail?.bagType.name}</p>
            <p>Jumlah (Losin): {workDetail?.quantityDozens}</p>
            <p>Status: {workDetail?.status}</p>
            <p>Created At: {workDetail?.startTime}</p>
            <p>Updated At: {workDetail?.updatedAt}</p>
        </div>
    )
}
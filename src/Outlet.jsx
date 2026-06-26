import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { API } from "./lib/Api.js"
import { Outlet } from "react-router"
import Navbar from "./Navbar.jsx"

export default function MainOutlet() {
    const { data: workLogs, isLoading: isLoadingWorkLogs, isError, refetch } = useQuery({
        queryKey: ['work-logs'],
        queryFn: API.ListWorkLogs,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    })

    const [showModal, setShowModal] = useState(false)

    return (
        <>
            <main className="bg-neutral-950">
                <Navbar showModal={showModal} setShowModal={setShowModal} />
                <Outlet context={{ workLogs, isLoadingWorkLogs, isError, refetch, showModal, setShowModal }} />
            </main>
        </>
    )
}
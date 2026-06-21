import { useQuery } from "@tanstack/react-query"
import { API } from "./lib/Api.js"
import { Outlet } from "react-router"

export default function MainOutlet() {
    const { data: workLogs, isLoading: isLoadingWorkLogs, isError } = useQuery({
        queryKey: ['work-logs'],
        queryFn: API.ListWorkLogs,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    })
    return (
        <>
            <main>
                <Outlet context={{ workLogs, isLoadingWorkLogs, isError }}/>
            </main>
        </>
    )
}
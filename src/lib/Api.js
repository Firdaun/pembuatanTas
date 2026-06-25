const API_BASE_URL = import.meta.env.VITE_BACKEND_URL

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.errors || 'Error Server');
    }
    return response.json()
}

const CreateWork = async (data) => {
    const response = await fetch(`${API_BASE_URL}/work-logs`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    })
    return handleResponse(response)
}

const ListWorkLogs = async () => {
    const response = await fetch(`${API_BASE_URL}/work-logs`)
    return handleResponse(response)
}

const UpdateWorkLogs = async (id) => {
    const response = await fetch(`${API_BASE_URL}/work-logs/${id}/setor`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
    })
    return handleResponse(response)
}

const GetIncome = async ({ startDate, endDate }) => {
    const params = new URLSearchParams({ startDate, endDate })
    const response = await fetch(`${API_BASE_URL}/work-logs/income?${params}`)
    return handleResponse(response)
}

export const API = {
    CreateWork,
    ListWorkLogs,
    UpdateWorkLogs,
    GetIncome
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import { QueryClientProvider, QueryClient, QueryCache } from '@tanstack/react-query'
import { Toaster } from 'sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error('🚨 GLOBAL ERROR TERDETEKSI:', error.message)
      console.error('🔍 Query Key yang bermasalah:', query.queryKey)
    }
  })
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster duration={3000} closeButton richColors theme="dark" position="top-center" />
      <App />
    </QueryClientProvider>
  </StrictMode>,
)

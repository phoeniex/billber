import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { TooltipProvider } from '@/components/ui/tooltip'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <TooltipProvider>
                <App />
            </TooltipProvider>
        </AuthProvider>
    </StrictMode>,
)

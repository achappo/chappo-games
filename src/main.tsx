import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { applyTheme, loadSettings } from './lib/settings'
import './styles/reset.css'
import './styles/app.css'

applyTheme(loadSettings().theme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

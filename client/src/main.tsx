import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import './index.css'
import routes from './routes'

function Routed() {
  return useRoutes(routes)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routed />
    </BrowserRouter>
  </StrictMode>,
)

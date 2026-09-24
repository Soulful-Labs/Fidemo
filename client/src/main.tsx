import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import './index.css'
import routes from './routes'
import { CreateProvider } from './mock/createStore'

function Routed() {
  return useRoutes(routes)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CreateProvider>
        <Routed />
      </CreateProvider>
    </BrowserRouter>
  </StrictMode>,
)

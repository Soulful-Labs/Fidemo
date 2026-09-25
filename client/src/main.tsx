import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import './index.css'
import routes from './routes'
import { CreateProvider } from './mock/createStore'
import ToastHost from './components/ui/Toast'

function Routed() {
  return useRoutes(routes)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CreateProvider>
        <ToastHost>
          <Routed />
        </ToastHost>
      </CreateProvider>
    </BrowserRouter>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import './index.css'
import routes from './routes'
import { CreateProvider } from './mock/createStore'
import ToastHost from './components/ui/Toast'
import { StudyProvider } from './mock/store'

function Routed() {
  return useRoutes(routes)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StudyProvider>
        <CreateProvider>
          <ToastHost>
            <Routed />
          </ToastHost>
        </CreateProvider>
      </StudyProvider>
    </BrowserRouter>
  </StrictMode>,
)

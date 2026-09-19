import { useLocation } from 'react-router-dom'

/**
 * Step 0 placeholder. Every route in the route map points here until its real
 * screen is built. It simply names the screen and echoes the current path so
 * the route table can be walked and verified before any screens exist.
 */
export default function Placeholder({ name }: { name: string }) {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-bg-0 px-4 text-center">
      <p className="text-label uppercase tracking-widest text-text-disabled">Placeholder</p>
      <h1 className="text-title-l text-text-title">{name}</h1>
      <p className="text-text-regular text-text-body">{pathname}</p>
    </div>
  )
}

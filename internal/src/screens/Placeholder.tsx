import { useLocation } from 'react-router-dom'

/** Stands in for every route until the first screen is built. */
export default function Placeholder() {
  const { pathname } = useLocation()
  return (
    <main className="flex min-h-full items-center justify-center bg-bg-0 p-6">
      <div className="flex flex-col gap-2 rounded-lg border-1 border-stroke-input bg-bg-1 p-6">
        <p className="text-label text-text-body">Not built yet</p>
        <h1 className="text-title-l text-text-title">Focus Insite Admin Panel</h1>
        <p className="text-text-regular text-text-subtitle">{pathname}</p>
      </div>
    </main>
  )
}

import { cn } from '../../lib/cn'

/** The HumanLayer "H" with its green dot, as drawn in the sidebar header and behind the sign-in card. */
const H = 'M0 3.15987C0 1.41472 1.41472 0 3.15987 0C4.90503 0 6.31975 1.41472 6.31975 3.15987V8.6395C6.31975 10.5855 7.89728 12.163 9.84326 12.163C11.7892 12.163 13.3668 10.5855 13.3668 8.6395V3.15987C13.3668 1.41472 14.7815 0 16.5266 0C18.2718 0 19.6865 1.41472 19.6865 3.15987V20.8401C19.6865 22.5853 18.2718 24 16.5266 24C14.7815 24 13.3668 22.5853 13.3668 20.8401V17.2915C13.3668 15.3456 11.7892 13.768 9.84326 13.768C7.89728 13.768 6.31975 15.3456 6.31975 17.2915V20.8401C6.31975 22.5853 4.90503 24 3.15987 24C1.41472 24 0 22.5853 0 20.8401V3.15987Z'

/** Logo colours are the asset's own (#f69f19 orange, the brand green), not tokens. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 19.6865 24" className={cn('shrink-0', className)} aria-hidden="true">
      <path d={H} fill="#f69f19" />
      <circle cx="9.84315" cy="8.63955" r="1.96865" fill="#3fb984" />
    </svg>
  )
}

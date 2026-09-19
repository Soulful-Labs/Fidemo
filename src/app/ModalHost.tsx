import BottomSheet from '../components/ui/BottomSheet'
import Button from '../components/ui/Button'
import { useUI } from './ui'

/**
 * Hosts the app-wide overlays. Screen-level modals stay local to their screen;
 * this is for anything that can be opened from anywhere.
 *
 * ComingSoon backs hard rule 1: a control with no destination yet opens this
 * sheet naming the screen, rather than doing nothing.
 */
export default function ModalHost() {
  const { comingSoon, closeComingSoon } = useUI()

  return (
    <BottomSheet
      open={comingSoon !== null}
      onClose={closeComingSoon}
      title={comingSoon ?? ''}
      footer={<Button fullWidth onClick={closeComingSoon}>Got It!</Button>}
    >
      This part of the prototype is not built yet. It will live here when it is.
    </BottomSheet>
  )
}

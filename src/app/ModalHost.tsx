import BottomSheet from '../components/ui/BottomSheet'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useUI } from './ui'

/**
 * Hosts the app-wide overlays. Screen-level modals stay local to their screen;
 * this is for anything that can be opened from anywhere.
 *
 * ComingSoon backs hard rule 1: a control with no destination yet opens this
 * sheet naming the screen, rather than doing nothing.
 */
export default function ModalHost() {
  const { comingSoon, closeComingSoon, matchScore, closeMatchScore } = useUI()

  return (
    <>
    <Modal open={matchScore} onClose={closeMatchScore} title="Study matching score" showClose={false}
      footer={<Button fullWidth onClick={closeMatchScore}>Got It!</Button>}>
      <div className="flex flex-col gap-2">
        <p className="text-text-regular text-text-subtitle">It shows how much this study is relevant to your profile for you.</p>
        <p className="text-text-regular text-brand-primary">Tip: Higher the score, faster you get qualified and earn!</p>
      </div>
    </Modal>
    <BottomSheet
      open={comingSoon !== null}
      onClose={closeComingSoon}
      title={comingSoon ?? ''}
      footer={<Button fullWidth onClick={closeComingSoon}>Got It!</Button>}
    >
      This part of the prototype is not built yet. It will live here when it is.
    </BottomSheet>
    </>
  )
}

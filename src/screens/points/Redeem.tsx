import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppNav } from '../../app/useAppNav'
import SuccessScreen from '../../components/app/SuccessScreen'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'
import CtaBar from '../../components/ui/CtaBar'
import Tag from '../../components/ui/Tag'
import TopBar from '../../components/ui/TopBar'
import { Clock, PointsCoin } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { money, points as fmt } from '../../lib/format'
import { canRedeem, pointsToUsd } from '../../lib/rules'
import { useStore } from '../../mock/store'
import { TIMINGS } from '../../mock/timings'

/**
 * PRD 8.2, Figma 978:62004 / 979:62953 / 979:63034. /redeem, the Confirm
 * Redeem sheet at /redeem/confirm and the success state at /redeem/done
 * share this screen so the amount survives.
 */
export default function Redeem() {
  const { step } = useParams()
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { user, redeemPoints, toast } = useStore()
  const [raw, setRaw] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(0)

  const requested = Number(raw || 0)
  const check = canRedeem(requested, user.points)
  const receive = check.ok ? pointsToUsd(requested) : 0

  if (step === 'done') {
    return (
      <SuccessScreen
        alt
        title="Redeemed successfully!"
        body={`You have redeemed ${fmt(done)} points for ${money(pointsToUsd(done))} to be credited to your wallet within 2 working days.`}
        onAction={() => navigate('/points', { replace: true })}
      />
    )
  }

  const redeem = () => {
    setSending(true)
    setDone(requested)
    setTimeout(() => {
      redeemPoints(requested)
      navigate('/points/redeem/done', { replace: true })
    }, TIMINGS.fakeServer)
  }

  return (
    <div className="flex min-h-full flex-col bg-bgAlt-0">
      <TopBar alt title="Redeem" onBack={back} />

      <div className="flex flex-1 flex-col items-center gap-4 px-4 pb-6 pt-6">
        <Tag tone="green" size="md">Balance: {fmt(user.points)} points</Tag>
        <p className="text-body-regular text-text-subtitle">Enter Points To Be Redeemed</p>
        <input
          inputMode="numeric"
          value={raw}
          placeholder="0"
          aria-label="Points to be redeemed"
          onChange={(e) => setRaw(e.target.value.replace(/\D/g, ''))}
          className={cn('h-16 w-full rounded-lg border-1.5 bg-transparent text-center text-display-s text-text-title outline-none placeholder:text-text-title', raw && !check.ok ? 'border-state-danger' : 'border-brand-primary')}
        />
        <div className="flex w-full items-center justify-between">
          <span className="text-text-regular text-text-body">100 points = $1 USD</span>
          <Button size="md" variant="tertiary" onClick={() => setRaw(String(user.points))}>Max</Button>
        </div>
        <p className={cn('w-full rounded-md py-3 text-center text-text-regular', raw && !check.ok ? 'bg-state-dangerBg/60 text-state-danger' : 'bg-bgAlt-2 text-text-subtitle')}>
          {raw && !check.ok ? check.reason : <>You will receive <span className="text-text-medium text-text-title">{money(receive)}</span></>}
        </p>
      </div>

      <CtaBar alt>
        <Button fullWidth disabled={!check.ok} onClick={() => navigate('/points/redeem/confirm')}
          onBlocked={() => toast(check.reason ?? 'Enter the points to redeem')}>
          Confirm
        </Button>
      </CtaBar>

      <BottomSheet alt open={step === 'confirm' && check.ok} onClose={() => navigate('/points/redeem')} title="Confirm Redeem"
        footer={<Button fullWidth loading={sending} onClick={redeem}>Redeem</Button>}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2 text-text-regular text-text-title"><PointsCoin className="h-5 w-5 text-brand-secondary" />Points To Be Redeemed</span>
            <span className="text-body-medium text-state-danger">{fmt(requested)} points</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2 text-text-regular text-text-title"><Clock className="h-5 w-5" />Amount Receivable</span>
            <span className="text-body-medium text-brand-secondary">{money(receive)}</span>
          </div>
          <p className="text-text-regular text-text-subtitle">Your redemption amount will be credited to your wallet within 2 working days.</p>
        </div>
      </BottomSheet>
    </div>
  )
}

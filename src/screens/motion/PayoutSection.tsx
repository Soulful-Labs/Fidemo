import { useRef, useState } from 'react'
import RollingNumber from '../../components/motion/RollingNumber'
import { money } from '../../lib/format'
import { WITHDRAWAL_FEE } from '../../lib/rules'
import { useScreenPlayer } from './CompletionSection'
import { Group, Play, Plays, Stage } from './LabBits'

/** H: money arriving. The wallet balance rolls up in cents, and the money screens catch coins. */
export function PayoutSection() {
  const [balance, setBalance] = useState(473)
  const badge = useRef<HTMLSpanElement>(null)
  const { play, node } = useScreenPlayer()
  const sent = 120

  return (
    <Group letter="H" title="Payout">
      <Stage alt>
        <span className="text-body-regular text-text-subtitle">Wallet Balance</span>
        <span ref={badge} className="self-start">
          <RollingNumber className="text-display-s text-brand-primary" value={balance} format={money} step={0.01} float pulse={badge} />
        </span>
      </Stage>
      <Plays>
        <Play onClick={() => setBalance((b) => b + 150)}>Study paid +$150</Play>
        <Play onClick={() => setBalance((b) => b + 10)}>Redeem 1,000 points +$10</Play>
        <Play onClick={() => setBalance((b) => Math.max(0, b - sent))}>Withdraw {money(sent)}</Play>
      </Plays>
      <Plays>
        <Play onClick={() => play({ mood: 'money', alt: true, title: `${money(sent)} withdrawal request sent successfully!`, body: `Your withdrawal request for ${money(sent)} has been sent and the funds will be credited within 2-3 working days.` })}>
          Withdrawal sent
        </Play>
        <Play onClick={() => play({ mood: 'money', alt: true, title: 'Redeemed successfully!', body: `You have redeemed 1,000 points for ${money(10)} to be credited to your wallet within 2 working days.` })}>
          Redeemed
        </Play>
      </Plays>
      <p className="text-label text-text-disabled">Withdrawals carry the flat {money(WITHDRAWAL_FEE)} fee; the figures here are only for the demo.</p>
      {node}
    </Group>
  )
}

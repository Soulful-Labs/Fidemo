import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppNav } from '../../app/useAppNav'
import EmptyState from '../../components/app/EmptyState'
import Button from '../../components/ui/Button'
import CtaBar from '../../components/ui/CtaBar'
import Modal from '../../components/ui/Modal'
import Tag from '../../components/ui/Tag'
import TopBar from '../../components/ui/TopBar'
import { useStore } from '../../mock/store'
import type { PayoutMethod } from '../../mock/types'

const last4 = (account: string) => `****${account.replace(/\s/g, '').slice(-4)}`

/** PRD 10.1 Manage Payout Methods, Figma 969:29028, with Remove Bank Account? (1327:86970). */
export default function PayoutMethods() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { payoutMethods, setDefaultPayoutMethod, removePayoutMethod, toast } = useStore()
  const [removing, setRemoving] = useState<PayoutMethod | null>(null)

  return (
    <div className="flex min-h-full flex-col bg-bgAlt-0">
      <TopBar alt title="Manage Payout Methods" onBack={back} />

      <div data-stagger className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        {payoutMethods.length === 0 ? (
          <EmptyState title="No payout account added yet!" actionLabel="Add Payout Account" onAction={() => navigate('/wallet/payout-methods/add')} />
        ) : (
          payoutMethods.map((m) => (
            <div key={m.id} className="flex flex-col gap-3 rounded-lg bg-bgAlt-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-body-medium text-text-title">{m.bankName}</span>
                  <span className="text-text-regular text-text-subtitle">{last4(m.accountNumber)}</span>
                </div>
                {m.isDefault && <Tag tone="outline" size="md">Default</Tag>}
              </div>
              <div className="flex gap-3">
                {!m.isDefault && (
                  <Button size="md" variant="secondary" onClick={() => { setDefaultPayoutMethod(m.id); toast(`${m.bankName} is now your default`) }}>
                    Set As Default
                  </Button>
                )}
                <Button size="md" variant="tertiary" onClick={() => setRemoving(m)}>Remove</Button>
              </div>
            </div>
          ))
        )}
      </div>

      <CtaBar alt>
        <Button fullWidth leftIcon={<span className="text-title-m">+</span>} onClick={() => navigate('/wallet/payout-methods/add')}>
          Add New Account
        </Button>
      </CtaBar>

      <Modal alt open={removing !== null} onClose={() => setRemoving(null)} showClose={false}
        footer={
          <div className="flex gap-3">
            <Button variant="danger" className="flex-1" onClick={() => {
              if (removing) removePayoutMethod(removing.id)
              setRemoving(null)
              toast('Account removed')
            }}>Yes, Remove</Button>
            <Button className="flex-1" onClick={() => setRemoving(null)}>No, Keep</Button>
          </div>
        }>
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-title-l text-text-title">Remove Bank Account?</h2>
          <p className="text-body-regular text-text-subtitle">This account will be removed from the saved payout methods.</p>
        </div>
      </Modal>
    </div>
  )
}

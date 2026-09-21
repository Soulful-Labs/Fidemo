import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppNav } from '../../app/useAppNav'
import Button from '../../components/ui/Button'
import CtaBar from '../../components/ui/CtaBar'
import Input from '../../components/ui/Input'
import TabBar from '../../components/ui/TabBar'
import TopBar from '../../components/ui/TopBar'
import { useStore } from '../../mock/store'
import { TIMINGS } from '../../mock/timings'

/** PRD 10.1 Add Bank Account, Figma 969:29107. Add validates, saves, and returns to the list. */
export default function AddBankAccount() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { payoutMethods, addPayoutMethod, toast } = useStore()
  const [bankName, setBankName] = useState('')
  const [account, setAccount] = useState('')
  const [routing, setRouting] = useState('')
  const [type, setType] = useState<'Savings' | 'Checking' | ''>('')
  const [touched, setTouched] = useState(false)
  const [saving, setSaving] = useState(false)

  const digits = account.replace(/\s/g, '')
  const errors = {
    bankName: bankName.trim().length < 2 ? 'Enter the bank name' : undefined,
    account: !/^\d{8,18}$/.test(digits) ? 'Enter an account number of 8 to 18 digits' : undefined,
    routing: !/^\d{6,11}$/.test(routing) ? 'Enter a routing or SWIFT code of 6 to 11 digits' : undefined,
  }
  const valid = !errors.bankName && !errors.account && !errors.routing && type !== ''

  const add = () => {
    if (!valid || !type) return
    setSaving(true)
    setTimeout(() => {
      addPayoutMethod({
        id: `pm-${Date.now()}`, bankName: bankName.trim(),
        accountNumber: digits.replace(/(\d{4})(?=\d)/g, '$1 '), routingCode: routing, type,
        isDefault: payoutMethods.length === 0,
      })
      toast('Bank account added')
      navigate('/wallet/payout-methods', { replace: true })
    }, TIMINGS.fakeServer)
  }

  return (
    <div className="flex min-h-full flex-col bg-bgAlt-0">
      <TopBar alt title="Bank Account" onBack={back} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <Input label="Bank Name" placeholder="Bank's Full Name" value={bankName} onChange={(e) => setBankName(e.target.value)}
          onBlur={() => setTouched(true)} error={touched ? errors.bankName : undefined} />
        <Input label="Account Number" placeholder="Account Number" inputMode="numeric" value={account}
          onChange={(e) => setAccount(e.target.value.replace(/[^\d\s]/g, ''))} onBlur={() => setTouched(true)} error={touched ? errors.account : undefined} />
        <Input label="Routing/Swift Code" placeholder="Routing Number" inputMode="numeric" value={routing}
          onChange={(e) => setRouting(e.target.value.replace(/\D/g, ''))} onBlur={() => setTouched(true)} error={touched ? errors.routing : undefined} />
        <div className="flex flex-col gap-1">
          <span className="text-text-regular text-text-subtitle">Type</span>
          <TabBar variant="boxes" value={type} onChange={(k) => setType(k as 'Savings' | 'Checking')}
            items={[{ key: 'Savings', label: 'Savings' }, { key: 'Checking', label: 'Checking' }]} />
        </div>
      </div>

      <CtaBar alt>
        <Button fullWidth loading={saving} disabled={!valid} onClick={add} onBlocked={() => { setTouched(true); toast('Fill in every field to add the account') }}>
          Add
        </Button>
      </CtaBar>
    </div>
  )
}

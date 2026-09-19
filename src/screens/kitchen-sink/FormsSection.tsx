import { useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Toggle from '../../components/ui/Toggle'
import { Search } from '../../components/ui/icons'
import Section, { Row } from './Section'

export default function FormsSection({ toast }: { toast: (msg: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [amount, setAmount] = useState('')
  const [about, setAbout] = useState('')
  const [touched, setTouched] = useState(false)

  const emailError = touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address' : undefined

  const [share, setShare] = useState(false)
  const [profile, setProfile] = useState(true)
  const [essential] = useState(true)

  return (
    <Section title="Input and Toggle">
      <Row label="Labelled (72px), with validation on blur">
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          error={emailError}
        />
      </Row>

      <Row label="Password with show and hide">
        <Input
          label="Password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helper="1 capital letter, 1 number, 1 special character, at least 8 character"
        />
      </Row>

      <Row label="Plain (48px), with icon and a trailing slot">
        <Input placeholder="Search studies..." leftIcon={<Search />} aria-label="Search studies" />
        <Input
          placeholder="0.00"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-label="Amount"
          rightSlot={
            <Button size="sm" variant="ghost" onClick={() => { setAmount('542.60'); toast('Max amount filled') }}>
              Max
            </Button>
          }
        />
      </Row>

      <Row label="Multiline with a character count">
        <Input
          label="About Me"
          multiline
          rows={3}
          maxLength={280}
          showCount
          placeholder="Describe your experience here.."
          value={about}
          onChange={(e) => setAbout(e.target.value)}
        />
      </Row>

      <Row label="Toggles, including a locked one">
        <div className="flex w-full flex-col gap-4">
          <Toggle
            checked={share}
            onChange={(v) => { setShare(v); toast(`Share profession ${v ? 'on' : 'off'}`) }}
            label="Share profession with study clients"
            description="To match with relevant studies, share your professional details"
          />
          <Toggle
            checked={profile}
            onChange={(v) => { setProfile(v); toast(`Share profile ${v ? 'on' : 'off'}`) }}
            label="Share profile details with platform"
            description="This helps us personalize your study exploration to find you most relevant studies"
          />
          <Toggle
            checked={essential}
            onChange={() => undefined}
            onBlocked={() => toast('Essential cookies cannot be turned off')}
            locked
            label="Essential cookies"
            description="These are essential for site to function fully."
          />
        </div>
      </Row>
    </Section>
  )
}

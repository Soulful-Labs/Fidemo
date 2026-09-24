import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import CreateShell from './CreateShell'

/**
 * Published (1518:92376): the end of the Create flow. The top bar keeps the
 * step chips and drops both buttons, and the only way on is Track and manage
 * studies, which goes to the Studies list.
 */
export default function Published() {
  const navigate = useNavigate()

  return (
    <CreateShell step="publish" action={<span />}>
      <div className="min-h-[885px] rounded-lg bg-bg-0 px-6 pt-[9px]">
        <div className="flex flex-col items-center gap-4 pt-[103px]">
          <span className="flex h-40 w-40 items-center justify-center rounded-full bg-green-200/60">
            <span className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#1a9e5c]">
              <svg viewBox="0 0 24 24" width="44" height="44" fill="none" aria-hidden="true">
                <path d="m5 12.5 4.5 4.5L19 7.5" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </span>

          <div className="flex max-w-[400px] flex-col items-center gap-1 text-center">
            <h1 className="text-title-s text-text-title">Your study has been summited for review!</h1>
            <p className="text-text-regular text-text-subtitle">
              Our internal team will have a quick review on the study within 24 hours and will get it live for the participants.
            </p>
          </div>

          <Button variant="secondary" size="none" className="h-12 px-6 text-body-medium"
            onClick={() => navigate('/studies')}>Track and manage studies</Button>
        </div>
      </div>
    </CreateShell>
  )
}

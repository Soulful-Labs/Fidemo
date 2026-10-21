import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { LogoMark } from '../../components/ui/Logo'
import AuthLayout from './AuthLayout'

/**
 * The console's entrance, served at /internal to a signed-out visitor. Not a
 * marketing page: nobody is being sold anything. One screen, no scrolling at
 * 1440 x 900, on the sign-in screens' own layout and card (AuthLayout): the
 * mark and the console's name as the sidebar writes them, one line saying
 * what this is, Log In, and who it is for. Nothing else: there is no
 * sign-up (22 Oct 2026); a master admin makes every team account.
 */
export default function Entrance() {
  const navigate = useNavigate()
  return (
    <AuthLayout className="px-8 pb-8 pt-12">
      <div className="flex flex-col items-center text-center">
        <p className="flex items-center gap-[14px]">
          <LogoMark className="h-8 w-[26px]" />
          <span className="text-title-l font-medium"><span className="text-text-subtitle">Admin</span> <span className="text-text-body">Panel</span></span>
        </p>
        <h1 className="pt-8 text-title-l leading-[31px] text-text-title">Focus Insite team console</h1>
        <p className="max-w-[380px] pt-2 text-body-regular text-text-subtitle">Where the Focus Insite team runs the platform: studies, participants, clients, support and finance.</p>
      </div>
      <div className="flex flex-col gap-3 pt-8">
        <Button fullWidth onClick={() => navigate('/signin')}>Log In</Button>
      </div>
      <p className="pt-6 text-center text-text-regular text-text-body">Access is for Focus Insite team members only.</p>
    </AuthLayout>
  )
}

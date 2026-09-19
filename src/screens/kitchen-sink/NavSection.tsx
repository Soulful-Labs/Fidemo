import { useState } from 'react'
import TabBar from '../../components/ui/TabBar'
import TopBar from '../../components/ui/TopBar'
import { Info } from '../../components/ui/icons'
import Section, { Row } from './Section'

export default function NavSection({ toast }: { toast: (msg: string) => void }) {
  const [tab, setTab] = useState('explore')
  const [sub, setSub] = useState('invites')

  return (
    <Section title="TopBar and TabBar">
      <Row label="TopBar, 56px, back plus a trailing action">
        <div className="w-full overflow-hidden rounded-md border-1 border-stroke-2">
          <TopBar
            title="Study Details"
            onBack={() => toast('Back to the logical parent')}
            right={
              <button type="button" onClick={() => toast('Details info opened')} aria-label="Info" className="text-text-body">
                <Info />
              </button>
            }
          />
        </div>
      </Row>

      <Row label="TopBar, 93px, with the onboarding progress bar and helper">
        <div className="w-full overflow-hidden rounded-md border-1 border-stroke-2">
          <TopBar
            title="About You"
            onBack={() => toast('Back to sign up')}
            progress={{ current: 1, total: 3 }}
            helper="Just 2 minutes, then you are browsing studies."
            right={
              <button type="button" onClick={() => toast('Details info opened')} aria-label="Info" className="text-text-body">
                <Info />
              </button>
            }
          />
        </div>
      </Row>

      <Row label="TabBar, segmented">
        <div className="w-full">
          <TabBar
            items={[
              { key: 'explore', label: 'Explore' },
              { key: 'mine', label: 'My Studies' },
              { key: 'saved', label: 'Saved' },
            ]}
            value={tab}
            onChange={(k) => { setTab(k); toast(`${k} tab`) }}
          />
        </div>
      </Row>

      <Row label="TabBar, underline, scrollable, with counts">
        <div className="w-full">
          <TabBar
            variant="underline"
            scrollable
            items={[
              { key: 'invites', label: 'Invites', count: 3 },
              { key: 'scheduled', label: 'Scheduled', count: 2 },
              { key: 'drafts', label: 'Drafts', count: 1 },
              { key: 'applied', label: 'Applied', count: 2 },
              { key: 'history', label: 'History', count: 8 },
            ]}
            value={sub}
            onChange={(k) => { setSub(k); toast(`${k} sub-tab`) }}
          />
        </div>
      </Row>
    </Section>
  )
}

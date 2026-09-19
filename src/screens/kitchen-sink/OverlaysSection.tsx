import { useState } from 'react'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Picker from '../../components/ui/Picker'
import Section, { Row } from './Section'

const EDUCATION = [
  'Secondary School', 'High School', 'Bachelors Degree', 'Masters Degree', 'Ph.D.',
  'Professional Certification', 'Self-Taught', 'Associate Degree', 'Other',
]

const INDUSTRIES = [
  'Business', 'Education', 'Healthcare', 'Finance', 'Lifestyle', 'Technology',
  'Travel', 'Wellness', 'Retail', 'Manufacturing', 'Legal', 'Media',
]

export default function OverlaysSection({ toast }: { toast: (msg: string) => void }) {
  const [modal, setModal] = useState(false)
  const [danger, setDanger] = useState(false)
  const [sheet, setSheet] = useState(false)
  const [picker, setPicker] = useState(false)
  const [multi, setMulti] = useState(false)
  const [education, setEducation] = useState('')
  const [industries, setIndustries] = useState<string[]>([])

  return (
    <Section title="Modal, BottomSheet and Picker">
      <Row label="Overlays close on backdrop click and Escape">
        <Button size="md" variant="tertiary" onClick={() => setModal(true)}>Modal</Button>
        <Button size="md" variant="tertiary" onClick={() => setDanger(true)}>Destructive modal</Button>
        <Button size="md" variant="tertiary" onClick={() => setSheet(true)}>Bottom sheet</Button>
      </Row>

      <Row label={`Picker, single select — ${education || 'nothing chosen'}`}>
        <Button size="md" variant="secondary" onClick={() => setPicker(true)}>Select Education Level</Button>
      </Row>

      <Row label={`Picker, multi select and searchable — ${industries.join(', ') || 'nothing chosen'}`}>
        <Button size="md" variant="secondary" onClick={() => setMulti(true)}>Select Industry</Button>
      </Row>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="What these details are for?"
        footer={<Button fullWidth onClick={() => { setModal(false); toast('Got it') }}>Got It!</Button>}
      >
        These information about you and your professional details are used to find the most
        relevant studies for you to help you earn more.
      </Modal>

      <Modal
        open={danger}
        onClose={() => setDanger(false)}
        title="Cancel Study?"
        footer={
          <>
            <Button variant="danger" fullWidth onClick={() => { setDanger(false); toast('Study cancelled') }}>
              Yes, Cancel
            </Button>
            <Button variant="tertiary" fullWidth onClick={() => setDanger(false)}>No, Keep it</Button>
          </>
        }
      >
        Are you sure you want to cancel this study session scheduled to complete this study?
      </Modal>

      <BottomSheet
        open={sheet}
        onClose={() => setSheet(false)}
        title="Want to Exit Screener?"
        footer={
          <>
            <Button fullWidth onClick={() => { setSheet(false); toast('Saved to Drafts') }}>Save and Exit</Button>
            <Button variant="tertiary" fullWidth onClick={() => setSheet(false)}>No, Continue</Button>
          </>
        }
      >
        Your progress have been saved in Drafts for 8 May, Studies or Drafts to complete later.
      </BottomSheet>

      <Picker
        open={picker}
        onClose={() => setPicker(false)}
        title="Select Education Level"
        options={EDUCATION}
        value={education}
        onSelect={(v) => { setEducation(v); toast(`${v} selected`) }}
      />

      <Picker
        open={multi}
        onClose={() => setMulti(false)}
        title="Select Industry"
        options={INDUSTRIES}
        value={industries}
        multiple
        searchable
        searchPlaceholder="Select industry field of your profession"
        onSelect={() => undefined}
        onApply={(v) => { setIndustries(v); toast(`${v.length} industries applied`) }}
      />
    </Section>
  )
}

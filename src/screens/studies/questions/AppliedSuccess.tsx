import { useNavigate, useParams } from 'react-router-dom'
import SuccessScreen from '../../../components/app/SuccessScreen'

/** "Applied successfully!" (PRD 6.8, Figma 919:74342). Done opens the study. */
export default function AppliedSuccess() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <SuccessScreen
      tier={2}
      title="Applied successfully!"
      body="Your application for this study has been submitted."
      steps={[
        'Your application has been sent to be reviewed if you qualify for this study.',
        'Once you get qualified, you will be invited to complete the study.',
        'Earn reward after successful completion of the study!',
      ]}
      onAction={() => navigate(`/studies/${id}`, { replace: true })}
    />
  )
}

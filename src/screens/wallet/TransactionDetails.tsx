import { useNavigate, useParams } from 'react-router-dom'
import { useAppNav } from '../../app/useAppNav'
import EmptyState from '../../components/app/EmptyState'
import StudyTypeTag from '../../components/app/StudyTypeTag'
import Tag from '../../components/ui/Tag'
import TopBar from '../../components/ui/TopBar'
import { Calendar, ChevronRight } from '../../components/ui/icons'
import { dateLong, money } from '../../lib/format'
import { useStore } from '../../mock/store'
import { CoinIcon, KeyValue } from './bits'

/** PRD 10.1 Transaction Details, Figma 969:29294. The study card opens the study. */
export default function TransactionDetails() {
  const { txId } = useParams()
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { transactions, studyById } = useStore()
  const tx = transactions.find((t) => t.id === txId)
  const study = studyById(tx?.studyId)

  if (!tx) {
    return <EmptyState title="Transaction not found" actionLabel="Back to Earning History" onAction={() => navigate('/wallet/earnings')} />
  }

  const time = new Date(tx.at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const Card = study ? 'button' : 'div'

  return (
    <div className="flex min-h-full flex-col bg-bgAlt-0">
      <TopBar alt title="Transaction Details" onBack={back} />

      <div className="flex flex-1 flex-col gap-5 px-4 pb-6 pt-4">
        <Card
          {...(study ? { type: 'button' as const, onClick: () => navigate(`/studies/${study.id}`) } : {})}
          className="flex flex-col gap-3 rounded-lg border-1 border-stroke-3 p-4 text-left"
        >
          <span className="flex items-start justify-between gap-3">
            <span className="text-title-s leading-snug text-text-title">{tx.title}</span>
            {study && <ChevronRight className="shrink-0 text-text-title" />}
          </span>
          <span className="flex flex-wrap gap-2">
            {study ? <StudyTypeTag type={study.type} /> : <Tag tone="neutral" size="md">{tx.category}</Tag>}
            {study && <Tag tone="outline" size="md">{study.industry}</Tag>}
          </span>
        </Card>

        <KeyValue icon={<CoinIcon />} label="Amount" value={money(tx.amount)} />
        <KeyValue icon={<Calendar className="h-5 w-5" />} label="Date and Time" value={`${dateLong(tx.at)} • ${time}`} />
        <KeyValue icon={<span className="text-body-medium">#</span>} label="Transaction Number" value={tx.txNumber} />
      </div>
    </div>
  )
}

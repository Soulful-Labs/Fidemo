import { Fragment } from 'react'
import type { StudyType } from '../../../components/app/StudyTypeTag'
import { CalendarIcon, ChevronDown, ClockIcon, PinIcon } from '../../../components/ui/icons'
import { ADDRESS, AVAILABILITY as A, DIARY, GROUP, QUESTIONS, SURVEY_LABELS } from '../../../mock/review'
import { Card, Pill, Rule, ValueBox } from './parts'
import { QuestionList } from './Questions'

const Label = ({ children }: { children: string }) => <p className="text-text-regular leading-5 text-text-subtitle">{children}</p>
const Help = ({ children }: { children: string }) => <p className="text-text-regular leading-5 text-text-body">{children}</p>

/** Address (In-Person 1984:130558, In-Person Group 1984:132092): the one address in a bg-2 box. */
function AddressCard() {
  return (
    <Card title="Address">
      <p className="pt-0.5 text-text-regular leading-5 text-text-subtitle">{ADDRESS.help}</p>
      <div className="mt-4 rounded-md bg-bg-2 px-3 py-3">
        <p className="text-text-regular leading-5 text-text-title">{ADDRESS.name}</p>
        <p className="pt-1 text-text-regular leading-5 text-text-subtitle">{ADDRESS.line}</p>
      </div>
    </Card>
  )
}

/**
 * One-to-one sessions (Video Call 1984:119698, In-Person 1984:130558):
 * "Availability" over two 376 columns 16 apart. Left: Limits (buffer, minimum
 * notice) and Date Overrides. Right: Weekly Hours, each day's 100px time boxes
 * either side of "TO", and for in-person the Address card under it.
 */
function Availability({ address }: { address: boolean }) {
  return (
    <div>
      <h2 className="text-body-medium text-text-title">Availability</h2>
      <div className="grid grid-cols-2 items-start gap-4 pt-4">
        <div className="flex flex-col gap-3">
          <Card title="Limits" className="pb-4">
            <div className="flex flex-col gap-1 pt-4">
              <Label>Buffer between meetings</Label>
              <ValueBox className="justify-between">{A.buffer}<ChevronDown className="h-5 w-5" /></ValueBox>
              <Help>{A.bufferHelp}</Help>
            </div>
            <div className="flex flex-col gap-1 pt-6">
              <Label>Minimum notice duration</Label>
              <ValueBox className="justify-between">{A.notice}<span className="flex items-center gap-1">{A.noticeUnit}<ChevronDown className="h-5 w-5" /></span></ValueBox>
              <Help>{A.noticeHelp}</Help>
            </div>
          </Card>
          <Card title="Date Overrides" className="pb-4">
            <p className="pt-0.5 text-text-regular leading-5 text-text-body">{A.overridesHelp}</p>
            <div className="flex flex-col gap-2 pt-4">
              {A.overrides.map(([day, hours]) => (
                <div key={day} className="flex h-[46px] items-center justify-between rounded-md border-1 border-stroke-1 px-3">
                  <span className="text-body-medium text-text-title">{day}</span>
                  <span className="text-body-regular text-text-subtitle">{hours}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="flex flex-col gap-3">
          <Card title="Weekly Hours" className="pb-4">
            <div className="flex flex-col gap-3 pt-4">
              {A.week.map(([day, ranges], i) => (
                <Fragment key={day}>
                  {i > 0 && <Rule />}
                  <div className="flex items-center justify-between">
                    <span className="text-body-regular text-text-title">{day}</span>
                    <div className="flex flex-col gap-2">
                      {Array.from({ length: ranges }, (_, r) => (
                        <div key={r} className="flex items-center gap-1">
                          <ValueBox className="w-[100px]">{A.time}</ValueBox>
                          <span className="w-[18px] text-text-regular text-text-body">TO</span>
                          <ValueBox className="w-[100px]">{A.time}</ValueBox>
                        </div>
                      ))}
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
          </Card>
          {address && <AddressCard />}
        </div>
      </div>
    </div>
  )
}

/**
 * Group sessions (Group Video Call 1984:129204, In-Person Group 1984:132092):
 * Limits (seats per session), then the scheduled sessions. A video session is
 * one 46px row; an in-person one lists its date, time and address.
 */
function GroupSessions({ inPerson }: { inPerson: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <Card title="Limits">
        <div className="flex flex-col gap-1 pt-4">
          <Label>Seats per session</Label>
          <ValueBox>{GROUP.seats}</ValueBox>
          <p className="text-text-regular leading-5 text-text-subtitle">{GROUP.seatsHelp}</p>
        </div>
      </Card>
      <Card title="Schedule Group Sessions">
        <div className="flex flex-col gap-3 pt-4">
          {(inPerson ? GROUP.inPerson : GROUP.video).map(([name, day, hours]) => inPerson ? (
            <div key={name} className="flex flex-col gap-2 rounded-md border-1 border-stroke-1 px-4 py-3 text-body-regular leading-[22px]">
              <p className="text-text-subtitle">{name}</p>
              <p className="flex items-center gap-1 pt-1 text-body-medium leading-[22px] text-text-title"><CalendarIcon className="h-5 w-5" />{day}</p>
              <p className="flex items-center gap-1 text-text-subtitle"><ClockIcon className="h-5 w-5" />{hours}</p>
              <p className="flex items-center gap-1 text-text-subtitle"><PinIcon className="h-5 w-5" />{ADDRESS.line}</p>
            </div>
          ) : (
            <div key={name} className="flex h-[46px] items-center rounded-md border-1 border-stroke-1 px-4 text-body-regular">
              <span className="text-text-subtitle">{name}</span>
              <span className="ml-auto text-body-medium text-text-title">{day}</span>
              <span aria-hidden="true" className="px-3 text-text-subtitle">•</span>
              <span className="text-text-subtitle">{hours}</span>
            </div>
          ))}
        </div>
      </Card>
      {inPerson && <AddressCard />}
    </div>
  )
}

/** Survey (1984:122634): a full-width "Survey Form: 10 Questions" pill, then the questions. */
function Survey() {
  return (
    <div className="flex flex-col gap-4">
      <p className="flex h-8 items-center justify-center gap-1 rounded-full bg-bgAlt-1 text-text-regular text-text-title">
        <span className="text-text-body">Survey Form:</span>10 Questions
      </p>
      <QuestionList labels={SURVEY_LABELS} questions={QUESTIONS} />
    </div>
  )
}

/** Diary (1984:134413): the setup facts as filled pills, then one card per day with its questions. */
function Diary() {
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg bg-bg-1 p-4">
        <h3 className="text-text-medium leading-5 text-text-title">Diary Study Setup</h3>
        <div className="flex gap-2 pt-4">
          {DIARY.setup.map(([label, value]) => <Pill key={label} filled label={label}>{value}</Pill>)}
        </div>
      </section>
      {DIARY.days.map((day) => (
        <section key={day} className="flex flex-col gap-4 rounded-lg bg-bg-1 p-4">
          <p className="flex h-7 items-center justify-center rounded-full border-1 border-stroke-3 text-text-regular text-text-subtitle">{day}</p>
          <QuestionList labels={['Q1', 'Q2']} questions={DIARY.questions} ruled={false} />
        </section>
      ))}
    </div>
  )
}

/** The Study tab is the one part of the review that changes with the study's type. */
export default function StudyTab({ type }: { type: StudyType }) {
  switch (type) {
    case 'video': return <Availability address={false} />
    case 'in-person': return <Availability address />
    case 'video-group': return <GroupSessions inPerson={false} />
    case 'in-person-group': return <GroupSessions inPerson />
    case 'survey': return <Survey />
    case 'diary': return <Diary />
  }
}

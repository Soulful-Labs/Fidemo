import TabBar from '../../components/ui/TabBar'

/** Top tabs shared by Explore, My Studies and Saved (PRD 6.2). */
export default function StudiesTabs() {
  return (
    <div className="px-4 pb-3">
      <TabBar
        items={[
          { key: 'explore', label: 'Explore', to: '/studies' },
          { key: 'mine', label: 'My Studies', to: '/studies/mine' },
          { key: 'saved', label: 'Saved', to: '/studies/saved' },
        ]}
      />
    </div>
  )
}

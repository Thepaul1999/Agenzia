import fs from 'node:fs/promises'
import path from 'node:path'
import HomeContentEditor from './HomeContentEditor'

const FILE_PATH = path.join(process.cwd(), 'editor-data', 'home-content.json')

export default async function AdminHomeContentPage() {
  let initial = {}
  try {
    const raw = await fs.readFile(FILE_PATH, 'utf8')
    initial = JSON.parse(raw)
  } catch {
    initial = {}
  }

  return (
    <>
      <div style={{ marginBottom: '1.8rem' }}>
        <span className="eyebrow eyebrow-accent">Editor contenuti</span>
        <h1 className="section-title" style={{ margin: '.4rem 0 0' }}>
          <span className="title-black">Home</span>{' '}
          <span className="title-orange">cliente</span>
        </h1>
      </div>
      <div style={{ background: '#fff', border: '1.5px solid var(--line)', borderRadius: '1.5rem', padding: '1.5rem' }}>
        <HomeContentEditor initial={initial} />
      </div>
    </>
  )
}

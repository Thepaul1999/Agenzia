'use client'

import { useCallback, useEffect, useState } from 'react'

type UserRow = {
  id: string
  email: string
  confirmed: boolean
  createdAt: string
  lastSignInAt: string | null
  isAdmin: boolean
}

function generatePassword(): string {
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = new Uint32Array(12)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

function fmt(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })
}

export default function UsersManager() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isAdmin, setIsAdmin] = useState(true)
  const [showPw, setShowPw] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Errore nel caricamento')
      setUsers(json.users)
    } catch (e) {
      setMsg({ type: 'err', text: e instanceof Error ? e.message : 'Errore nel caricamento' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isAdmin }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Creazione non riuscita')
      setMsg({
        type: 'ok',
        text: `Utente ${json.email} creato${json.isAdmin ? ' come amministratore' : ''}. Comunicagli la password: potrà entrare subito da /login.`,
      })
      setEmail('')
      setPassword('')
      load()
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Creazione non riuscita' })
    } finally {
      setBusy(false)
    }
  }

  async function toggleAdmin(u: UserRow) {
    setMsg(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: u.id, email: u.email, isAdmin: !u.isAdmin }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Operazione non riuscita')
      load()
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Operazione non riuscita' })
    }
  }

  return (
    <>
      <style>{`
        .usr-title{font-family:var(--font-body);font-size:1.6rem;font-weight:800;margin:0 0 .4rem;color:var(--ink,#0c0c0a)}
        .usr-sub{color:var(--mid,#7c7770);font-size:.9rem;margin:0 0 2rem}
        .usr-card{background:#fff;border:1.5px solid var(--line,#e9e4dd);border-radius:18px;padding:1.5rem;margin-bottom:2rem}
        .usr-h{font-family:var(--font-body);font-size:.72rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--mid,#7c7770);margin:0 0 1rem}
        .usr-form{display:grid;gap:1rem;max-width:520px}
        .usr-label{display:grid;gap:.35rem;font-size:.78rem;font-weight:700;color:var(--ink,#0c0c0a)}
        .usr-input{padding:.75rem .9rem;border:1.5px solid var(--line,#e9e4dd);border-radius:12px;font-size:1rem;font-family:inherit;min-height:44px;width:100%;box-sizing:border-box}
        .usr-input:focus{outline:2px solid var(--tc,#c4622d);outline-offset:1px}
        .usr-row{display:flex;gap:.6rem;align-items:stretch}
        .usr-btn{padding:.7rem 1.3rem;border-radius:999px;border:1.5px solid var(--tc,#c4622d);background:var(--tc,#c4622d);color:#fff;font-family:var(--font-body);font-size:.74rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;min-height:44px}
        .usr-btn:disabled{opacity:.55;cursor:not-allowed}
        .usr-btn-ghost{background:transparent;color:var(--ink,#0c0c0a);border-color:var(--line,#e9e4dd)}
        .usr-check{display:flex;gap:.6rem;align-items:center;font-size:.9rem}
        .usr-msg{padding:.8rem 1rem;border-radius:12px;font-size:.88rem;margin-bottom:1.2rem}
        .usr-msg.ok{background:#e8f5ec;color:#1d6b3a}
        .usr-msg.err{background:#fdecea;color:#a3271b}
        .usr-table{width:100%;border-collapse:collapse;font-size:.86rem}
        .usr-table th{text-align:left;font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:var(--mid,#7c7770);padding:.5rem .6rem;border-bottom:1.5px solid var(--line,#e9e4dd)}
        .usr-table td{padding:.75rem .6rem;border-bottom:1px solid var(--line,#e9e4dd);vertical-align:middle}
        .usr-badge{display:inline-block;padding:.2rem .6rem;border-radius:999px;font-size:.68rem;font-weight:700;background:#f1ede7;color:#5a554e}
        .usr-badge.admin{background:#fbe9df;color:var(--tc,#c4622d)}
        @media(max-width:640px){.usr-table thead{display:none}.usr-table tr{display:block;border-bottom:1px solid var(--line,#e9e4dd);padding:.6rem 0}.usr-table td{display:block;border:none;padding:.2rem 0}.usr-row{flex-direction:column}}
      `}</style>

      <h1 className="usr-title">Utenti</h1>
      <p className="usr-sub">Crea un nuovo accesso e scegli se può usare l&apos;area admin.</p>

      {msg && <div className={`usr-msg ${msg.type}`} role="status">{msg.text}</div>}

      <section className="usr-card">
        <h2 className="usr-h">Nuovo utente</h2>
        <form className="usr-form" onSubmit={createUser}>
          <label className="usr-label">
            Email
            <input
              className="usr-input"
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@esempio.it"
            />
          </label>
          <label className="usr-label">
            Password (almeno 8 caratteri)
            <div className="usr-row">
              <input
                className="usr-input"
                type={showPw ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="usr-btn usr-btn-ghost" onClick={() => setPassword(generatePassword())}>
                Genera
              </button>
              <button type="button" className="usr-btn usr-btn-ghost" onClick={() => setShowPw((v) => !v)}>
                {showPw ? 'Nascondi' : 'Mostra'}
              </button>
            </div>
          </label>
          <label className="usr-check">
            <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
            Amministratore (può gestire immobili e contenuti del sito)
          </label>
          <div>
            <button type="submit" className="usr-btn" disabled={busy}>
              {busy ? 'Creazione…' : 'Crea utente'}
            </button>
          </div>
        </form>
      </section>

      <section className="usr-card">
        <h2 className="usr-h">Utenti esistenti</h2>
        {loading ? (
          <p>Caricamento…</p>
        ) : users.length === 0 ? (
          <p>Nessun utente.</p>
        ) : (
          <table className="usr-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Ruolo</th>
                <th>Ultimo accesso</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>
                    <span className={`usr-badge${u.isAdmin ? ' admin' : ''}`}>{u.isAdmin ? 'Amministratore' : 'Utente'}</span>
                    {!u.confirmed && <span className="usr-badge" style={{ marginLeft: '.4rem' }}>Email non confermata</span>}
                  </td>
                  <td>{fmt(u.lastSignInAt)}</td>
                  <td>
                    <button type="button" className="usr-btn usr-btn-ghost" onClick={() => toggleAdmin(u)}>
                      {u.isAdmin ? 'Togli admin' : 'Rendi admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}

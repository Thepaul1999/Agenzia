// app/login/page.tsx
import { login } from './action'

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string | string[]
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const errorValue = params?.error
  const error = Array.isArray(errorValue) ? errorValue[0] : errorValue

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-16">
      <div className="mx-auto max-w-md">
        <a href="/" className="inline-flex items-center gap-2 rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 mb-6">
          ← Indietro
        </a>
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold text-neutral-900">Area riservata</h1>
            <p className="mt-2 text-sm text-neutral-500">
              Accedi con il tuo account Supabase
            </p>
          </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {decodeURIComponent(error)}
          </div>
        ) : null}

        <form action={login} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-neutral-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 outline-none transition focus:border-neutral-900"
              placeholder="email@agenzia.it"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-neutral-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 outline-none transition focus:border-neutral-900"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Accedi
          </button>
        </form>

        {/* Se vuoi aggiungere un link logout anche qui, puoi fare: */}
        <form action="/api/logout" method="post" className="mt-4">
          <button
            type="submit"
            className="w-full rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm text-neutral-900 transition hover:bg-neutral-50"
          >
            Esci
          </button>
        </form>
        </div>
      </div>
    </main>
  )
}
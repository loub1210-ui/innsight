'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Building2, Loader2, Mail, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">InnSight</span>
          </div>
          <p className="text-slate-400 text-sm">Intelligence Foncière Hôtelière</p>
        </div>

        {/* Card */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-8 shadow-2xl">
          {sent ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/20 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Lien envoyé !</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Vérifiez votre boîte mail <span className="text-white font-medium">{email}</span>.
                <br />Cliquez sur le lien pour accéder à InnSight.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="mt-6 text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                Utiliser une autre adresse
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-white mb-1">Connexion</h1>
              <p className="text-slate-400 text-sm mb-6">
                Entrez votre email pour recevoir un lien de connexion sécurisé.
              </p>

              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="vous@entreprise.com"
                      required
                      className="w-full bg-surface border border-surface-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours…</>
                  ) : (
                    'Envoyer le lien de connexion'
                  )}
                </button>
              </form>

              <p className="mt-6 text-xs text-slate-500 text-center">
                Accès réservé aux membres InnSight.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import {
  Plug,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Trash2,
  TestTube2,
  Save,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import {
  INTEGRATIONS,
  CATEGORY_LABELS,
  PRICING_LABELS,
  getIntegrationsByCategory,
  type IntegrationDefinition,
  type IntegrationCategory,
} from '@/lib/integrations/registry'
import type { IntegrationStatus } from '@/lib/integrations/store'
import { cn } from '@/lib/utils'

interface Props {
  initialStatuses: IntegrationStatus[]
}

export function IntegrationsManager({ initialStatuses }: Props) {
  const [statuses, setStatuses] = useState<IntegrationStatus[]>(initialStatuses)
  const grouped = useMemo(() => getIntegrationsByCategory(), [])

  const refresh = async () => {
    const res = await fetch('/api/integrations')
    if (res.ok) {
      const json = await res.json() as { statuses: IntegrationStatus[] }
      setStatuses(json.statuses)
    }
  }

  const statusFor = (service: string): IntegrationStatus | undefined =>
    statuses.find(s => s.service === service)

  const totalRequired = INTEGRATIONS.filter(i => i.required).length
  const configuredRequired = INTEGRATIONS.filter(i => i.required && (statusFor(i.service)?.is_configured || i.publicApi)).length

  return (
    <section className="bg-surface-card border border-surface-border rounded-xl p-6">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Plug className="w-4 h-4 text-brand-400" />
            Intégrations API
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure les sources de données qu'InnSight interroge. {configuredRequired}/{totalRequired} clés requises configurées.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {(Object.keys(grouped) as IntegrationCategory[]).map(cat => (
          <CategoryGroup
            key={cat}
            category={cat}
            integrations={grouped[cat]}
            getStatus={statusFor}
            onChanged={refresh}
          />
        ))}
      </div>
    </section>
  )
}

function CategoryGroup({
  category,
  integrations,
  getStatus,
  onChanged,
}: {
  category: IntegrationCategory
  integrations: IntegrationDefinition[]
  getStatus: (service: string) => IntegrationStatus | undefined
  onChanged: () => void
}) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 font-medium mb-2 hover:text-slate-300"
      >
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        {CATEGORY_LABELS[category]}
        <span className="text-slate-600">·</span>
        <span className="text-slate-600">{integrations.length}</span>
      </button>
      {open && (
        <div className="space-y-2">
          {integrations.map(def => (
            <IntegrationCard key={def.service} def={def} status={getStatus(def.service)} onChanged={onChanged} />
          ))}
        </div>
      )}
    </div>
  )
}

function IntegrationCard({
  def,
  status,
  onChanged,
}: {
  def: IntegrationDefinition
  status?: IntegrationStatus
  onChanged: () => void
}) {
  const [open, setOpen] = useState(false)
  const isConfigured = status?.is_configured || def.publicApi

  return (
    <div className="bg-surface border border-surface-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 hover:bg-surface-hover transition-colors text-left"
      >
        <StatusDot configured={isConfigured} testStatus={status?.last_test_status ?? null} required={def.required} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">{def.label}</span>
            {def.required && (
              <span className="text-[10px] uppercase font-bold text-amber-400 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 rounded">
                requis
              </span>
            )}
            <span className={cn(
              'text-[10px] uppercase font-medium px-1.5 py-0.5 rounded',
              def.pricing === 'gratuit' && 'text-emerald-400 bg-emerald-500/10',
              def.pricing === 'freemium' && 'text-sky-400 bg-sky-500/10',
              def.pricing === 'payant' && 'text-rose-400 bg-rose-500/10',
            )}>
              {PRICING_LABELS[def.pricing]}
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">{def.usage}</p>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-slate-500 transition-transform flex-shrink-0', open && 'rotate-180')} />
      </button>

      {open && (
        <IntegrationForm def={def} status={status} onChanged={onChanged} />
      )}
    </div>
  )
}

function StatusDot({
  configured,
  testStatus,
  required,
}: {
  configured: boolean
  testStatus: 'ok' | 'fail' | 'untested' | null
  required: boolean
}) {
  if (testStatus === 'ok') return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
  if (testStatus === 'fail') return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
  if (configured) return <CheckCircle2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
  if (required) return <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
  return <div className="w-2 h-2 rounded-full bg-slate-600 ml-1 flex-shrink-0" />
}

function IntegrationForm({
  def,
  status,
  onChanged,
}: {
  def: IntegrationDefinition
  status?: IntegrationStatus
  onChanged: () => void
}) {
  const [fields, setFields] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState<'save' | 'test' | 'delete' | null>(null)
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  async function save() {
    setBusy('save')
    setFeedback(null)
    const res = await fetch(`/api/integrations/${def.service}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    })
    const json = await res.json().catch(() => ({})) as { error?: string }
    if (res.ok) {
      setFeedback({ ok: true, msg: 'Clé enregistrée (chiffrée).' })
      setFields({})
      onChanged()
    } else {
      setFeedback({ ok: false, msg: json.error ?? `Erreur HTTP ${res.status}` })
    }
    setBusy(null)
  }

  async function test() {
    setBusy('test')
    setFeedback(null)
    const body = Object.keys(fields).length ? { fields } : undefined
    const res = await fetch(`/api/integrations/${def.service}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    const json = await res.json() as { ok: boolean; message: string }
    setFeedback({ ok: json.ok, msg: json.message })
    onChanged()
    setBusy(null)
  }

  async function remove() {
    if (!confirm(`Supprimer la clé pour ${def.label} ?`)) return
    setBusy('delete')
    await fetch(`/api/integrations/${def.service}`, { method: 'DELETE' })
    setFields({})
    setFeedback({ ok: true, msg: 'Clé supprimée.' })
    onChanged()
    setBusy(null)
  }

  return (
    <div className="px-4 pb-4 pt-1 border-t border-surface-border space-y-3">
      <div className="flex items-center gap-3 text-xs text-slate-500 pt-2">
        <a href={def.docUrl} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300 inline-flex items-center gap-1">
          Documentation <ExternalLink className="w-3 h-3" />
        </a>
        {def.notes && <span className="text-slate-500">· {def.notes}</span>}
      </div>

      {status?.last_test_at && (
        <p className="text-[11px] text-slate-500">
          Dernier test : {new Date(status.last_test_at).toLocaleString('fr-FR')} —{' '}
          <span className={status.last_test_status === 'ok' ? 'text-emerald-400' : 'text-red-400'}>
            {status.last_test_message ?? status.last_test_status}
          </span>
        </p>
      )}

      {def.publicApi ? (
        <p className="text-xs text-slate-400 italic">
          API publique — aucune clé requise. Clique sur « Tester » pour vérifier que le service répond.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(def.fields ?? []).map(f => {
            const isPwd = f.type === 'password'
            const revealedNow = revealed[f.name]
            return (
              <div key={f.name}>
                <label className="block text-xs text-slate-400 mb-1">
                  {f.label}{f.required && <span className="text-rose-400 ml-1">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={isPwd && !revealedNow ? 'password' : 'text'}
                    value={fields[f.name] ?? ''}
                    placeholder={f.placeholder ?? (status?.is_configured ? '••••••••• (déjà configuré)' : '')}
                    onChange={e => setFields({ ...fields, [f.name]: e.target.value })}
                    className="w-full bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono pr-9"
                  />
                  {isPwd && (
                    <button
                      type="button"
                      onClick={() => setRevealed({ ...revealed, [f.name]: !revealedNow })}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {revealedNow ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {feedback && (
        <div className={cn(
          'text-xs px-3 py-2 rounded-lg border',
          feedback.ok
            ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
            : 'text-red-300 bg-red-500/10 border-red-500/20',
        )}>
          {feedback.msg}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        {!def.publicApi && (
          <button
            onClick={save}
            disabled={busy !== null || Object.keys(fields).length === 0}
            className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            {busy === 'save' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Enregistrer
          </button>
        )}
        <button
          onClick={test}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 bg-surface-card hover:bg-surface-hover border border-surface-border text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
        >
          {busy === 'test' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TestTube2 className="w-3.5 h-3.5" />}
          Tester
        </button>
        {status?.is_configured && !def.publicApi && (
          <button
            onClick={remove}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ml-auto"
          >
            {busy === 'delete' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Supprimer la clé
          </button>
        )}
      </div>
    </div>
  )
}

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
  ShoppingCart,
  Tag,
  BookOpen,
} from 'lucide-react'
import {
  INTEGRATIONS,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
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

  // Compteurs
  const totalRequired = INTEGRATIONS.filter(i => i.required).length
  const configuredRequired = INTEGRATIONS.filter(i =>
    i.required && (i.publicApi || statusFor(i.service)?.is_configured),
  ).length
  const totalAll = INTEGRATIONS.length
  const configuredAll = INTEGRATIONS.filter(i =>
    i.publicApi || statusFor(i.service)?.is_configured,
  ).length

  const progressRequired = Math.round((configuredRequired / totalRequired) * 100)
  const progressAll = Math.round((configuredAll / totalAll) * 100)

  return (
    <section className="bg-surface-card border border-surface-border rounded-xl p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Plug className="w-4 h-4 text-brand-400" />
            Console d'intégrations API
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Renseigne les clés API une par une. Chaque intégration a son lien direct pour souscrire,
            ses tarifs indicatifs et un test de connexion immédiat. Les clés sont chiffrées avant
            stockage et jamais exposées au navigateur.
          </p>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <ProgressBar
            label="Clés requises"
            value={configuredRequired}
            total={totalRequired}
            percent={progressRequired}
            critical
          />
          <ProgressBar
            label="Toutes les clés"
            value={configuredAll}
            total={totalAll}
            percent={progressAll}
          />
        </div>
      </div>

      <div className="mt-6 space-y-6">
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

function ProgressBar({
  label, value, total, percent, critical,
}: { label: string; value: number; total: number; percent: number; critical?: boolean }) {
  const color = percent === 100
    ? 'bg-emerald-500'
    : critical && percent < 100
      ? 'bg-amber-500'
      : 'bg-brand-500'
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
        <span>{label}</span>
        <span className="font-mono">{value}/{total}</span>
      </div>
      <div className="h-1.5 bg-surface rounded-full overflow-hidden">
        <div className={cn('h-full transition-all', color)} style={{ width: `${percent}%` }} />
      </div>
    </div>
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
  const configured = integrations.filter(i => i.publicApi || getStatus(i.service)?.is_configured).length
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 mb-2 group text-left"
      >
        {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
        <h3 className="text-xs uppercase tracking-wider text-slate-300 font-semibold group-hover:text-white">
          {CATEGORY_LABELS[category]}
        </h3>
        <span className="text-[10px] text-slate-500">·</span>
        <span className="text-[10px] text-slate-500">{configured}/{integrations.length} configuré(s)</span>
      </button>
      {open && (
        <>
          <p className="text-[11px] text-slate-500 mb-3 ml-5">{CATEGORY_DESCRIPTIONS[category]}</p>
          <div className="space-y-2">
            {integrations.map(def => (
              <IntegrationCard key={def.service} def={def} status={getStatus(def.service)} onChanged={onChanged} />
            ))}
          </div>
        </>
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
  const isConfigured = def.publicApi || (status?.is_configured ?? false)

  return (
    <div className={cn(
      'bg-surface border rounded-lg overflow-hidden transition-colors',
      isConfigured ? 'border-emerald-500/20' : def.required ? 'border-amber-500/20' : 'border-surface-border',
    )}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-3.5 hover:bg-surface-hover transition-colors text-left"
      >
        <div className="pt-0.5">
          <StatusDot configured={isConfigured} testStatus={status?.last_test_status ?? null} required={def.required} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white truncate">{def.label}</span>
            {def.required && !isConfigured && (
              <span className="text-[10px] uppercase font-bold text-amber-300 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 rounded">
                À configurer
              </span>
            )}
            {isConfigured && (
              <span className="text-[10px] uppercase font-bold text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Configuré
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
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{def.usage}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Tag className="w-3 h-3" />
              {def.priceLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!def.publicApi && !isConfigured && (
            <a
              href={def.signupUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-3 h-3" />
              Souscrire
            </a>
          )}
          <ChevronDown className={cn('w-4 h-4 text-slate-500 transition-transform', open && 'rotate-180')} />
        </div>
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
  if (testStatus === 'ok') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />
  if (testStatus === 'fail') return <XCircle className="w-4 h-4 text-red-400" />
  if (configured) return <CheckCircle2 className="w-4 h-4 text-emerald-400/60" />
  if (required) return <AlertCircle className="w-4 h-4 text-amber-400" />
  return <div className="w-2 h-2 rounded-full bg-slate-600 ml-1" />
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
    try {
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
    } catch (e) {
      setFeedback({ ok: false, msg: (e as Error).message })
    }
    setBusy(null)
  }

  async function test() {
    setBusy('test')
    setFeedback(null)
    try {
      const body = Object.keys(fields).length ? { fields } : undefined
      const res = await fetch(`/api/integrations/${def.service}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      const json = await res.json() as { ok: boolean; message: string }
      setFeedback({ ok: json.ok, msg: json.message })
      onChanged()
    } catch (e) {
      setFeedback({ ok: false, msg: (e as Error).message })
    }
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
    <div className="px-4 pb-4 pt-1 border-t border-surface-border space-y-3 bg-surface-card/50">
      {/* Étapes claires */}
      {!def.publicApi && (
        <div className="bg-surface rounded-lg p-3 border border-surface-border">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-brand-400 mb-2">
            Comment souscrire
          </p>
          <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside">
            <li>
              <a href={def.signupUrl} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300 underline inline-flex items-center gap-1">
                Créer un compte ici <ExternalLink className="w-3 h-3" />
              </a>
              {' '}— {def.priceLabel}
            </li>
            {def.setupNotes && <li className="text-slate-400">{def.setupNotes}</li>}
            <li>Coller la / les clé(s) ci-dessous et cliquer sur <span className="font-semibold text-white">Tester</span>.</li>
          </ol>
          <div className="flex items-center gap-3 mt-3 text-[11px]">
            <a href={def.docUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300 inline-flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Documentation technique
            </a>
          </div>
        </div>
      )}

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
          API publique gouvernementale — aucune clé requise. Clique sur « Tester » pour vérifier que le service répond.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(def.fields ?? []).map(f => {
            const isPwd = f.type === 'password'
            const revealedNow = revealed[f.name]
            return (
              <div key={f.name}>
                <label className="block text-xs text-slate-300 mb-1 font-medium">
                  {f.label}{f.required && <span className="text-rose-400 ml-1">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={isPwd && !revealedNow ? 'password' : 'text'}
                    value={fields[f.name] ?? ''}
                    placeholder={f.placeholder ?? (status?.is_configured ? '••••••••• (déjà configuré)' : 'Coller la valeur ici…')}
                    onChange={e => setFields({ ...fields, [f.name]: e.target.value })}
                    className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono pr-9"
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

      <div className="flex items-center gap-2 pt-1 flex-wrap">
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
        {!def.publicApi && (
          <a
            href={def.signupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Page de souscription
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
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

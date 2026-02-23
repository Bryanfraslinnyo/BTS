import { useMemo } from 'react'
import { useApp } from '../context/Appcontext.jsx'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Card, { CardHeader, CardBody } from '../components/ui/Card.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import Badge from '../components/ui/Badge.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import ChartTooltip from '../components/ui/ChartTooltip.jsx'
import { formatDate, calcAge, today, MONTHS_FR } from '../utils/helpers.js'
import { CHART_PALETTE } from '../utils/constants.js'

export default function DashboardPage() {
  const { patients, consultations, examens, stats, navigate } = useApp()
  const todayStr = today()

  const monthlyData = useMemo(() =>
    MONTHS_FR.map((mois, i) => ({
      mois,
      consultations: consultations.filter((c) => new Date(c.date).getMonth() === i).length,
    })),
    [consultations]
  )

  const bySpec = useMemo(() => {
    const ct = {}
    consultations.forEach((c) => { ct[c.specialite] = (ct[c.specialite] || 0) + 1 })
    return Object.entries(ct).map(([name, value]) => ({ name, value }))
  }, [consultations])

  const byType = useMemo(() => {
    const ct = {}
    consultations.forEach((c) => { ct[c.type] = (ct[c.type] || 0) + 1 })
    return Object.entries(ct).map(([name, value]) => ({ name, value }))
  }, [consultations])

  const recent = useMemo(() =>
    [...consultations].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6),
    [consultations]
  )

  return (
    <div className="page-content page-enter">
      {/* ── Stats Row ── */}
      <div className="grid-4 mb-6">
        <StatCard icon="👥" label="Total Patients"       value={stats.totalPatients}         colorClass="stat-icon-blue"   trend="3 nouveaux ce mois" trendDir="up" />
        <StatCard icon="📋" label="Consultations auj."   value={stats.todayConsultations.length} colorClass="stat-icon-cyan" trend={`${stats.plannedConsults} planifiées`} trendDir="up" />
        <StatCard icon="✅" label="Consultations terminées" value={stats.terminatedConsults} colorClass="stat-icon-green"  trend={`${Math.round((stats.terminatedConsults / Math.max(stats.totalConsultations, 1)) * 100)}% du total`} trendDir="up" />
        <StatCard icon="🔬" label="Examens en attente"   value={stats.pendingExamens.length} colorClass="stat-icon-orange" trend="Résultats à venir" trendDir="down" />
      </div>

      {/* ── Row 1: Area chart + Pie ── */}
      <div className="grid-2-1 mb-5">
        <Card>
          <CardHeader title="Activité mensuelle" subtitle="Consultations par mois (année en cours)" />
          <CardBody>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1565C0" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="consultations" stroke="#1565C0" strokeWidth={2.5} fill="url(#gradC)" name="Consultations" dot={{ fill: '#1565C0', r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Par spécialité" subtitle="Répartition" />
          <CardBody size="sm">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={bySpec} cx="50%" cy="50%" innerRadius={35} outerRadius={58} paddingAngle={3} dataKey="value">
                  {bySpec.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
              {bySpec.slice(0, 5).map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 2, background: CHART_PALETTE[i], flexShrink: 0 }} />
                  <span style={{ flex: 1, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{d.value}</strong>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ── Row 2: Today + Recent ── */}
      <div className="grid-2 mb-5">
        {/* Today planning */}
        <Card>
          <CardHeader
            title="Planning du jour"
            subtitle={formatDate(todayStr)}
            actions={<button className="btn btn-primary btn-sm" onClick={() => navigate('consultations', { openNew: true })}>+ Nouvelle</button>}
          />
          <div style={{ maxHeight: 290, overflowY: 'auto' }}>
            {stats.todayConsultations.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>📅 Aucune consultation programmée aujourd'hui</div>
            ) : (
              stats.todayConsultationsList.slice(0, 6).map((c) => {
                const p = patients.find((x) => x.id === c.patient_id)
                return (
                  <div
                    key={c.id}
                    className="patient-list-item"
                    onClick={() => navigate('consultation-detail', { id: c.id })}
                  >
                    <div style={{ textAlign: 'center', minWidth: 44 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>{c.heure}</div>
                    </div>
                    <div style={{ width: 2, height: 36, background: 'var(--blue-400)', borderRadius: 2, flexShrink: 0 }} />
                    <Avatar name={p ? `${p.prenom} ${p.nom}` : '?'} size="sm" color={p?.photo_color || '#1565C0'} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="patient-list-name">{p ? `${p.prenom} ${p.nom}` : '–'}</div>
                      <div className="patient-list-sub"><span>{c.type}</span><span>{c.specialite}</span></div>
                    </div>
                    <Badge>{c.statut}</Badge>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        {/* Recent consultations */}
        <Card>
          <CardHeader
            title="Consultations récentes"
            subtitle="Dernières activités"
            actions={<button className="btn btn-ghost btn-sm" onClick={() => navigate('consultations')}>Voir tout</button>}
          />
          <div style={{ maxHeight: 290, overflowY: 'auto' }}>
            {recent.map((c) => {
              const p = patients.find((x) => x.id === c.patient_id)
              return (
                <div key={c.id} className="patient-list-item" onClick={() => navigate('consultation-detail', { id: c.id })}>
                  <Avatar name={p ? `${p.prenom} ${p.nom}` : '?'} size="sm" color={p?.photo_color || '#1565C0'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="patient-list-name">{p ? `${p.prenom} ${p.nom}` : '–'}</div>
                    <div className="patient-list-sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.motif?.slice(0, 40)}{c.motif?.length > 40 ? '…' : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <Badge>{c.statut}</Badge>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{formatDate(c.date)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* ── Row 3: Bar chart ── */}
      <Card>
        <CardHeader title="Répartition par type de consultation" subtitle="Vue d'ensemble globale" />
        <CardBody>
          <ResponsiveContainer width="100%" height={168}>
            <BarChart data={byType} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Consultations" radius={[6, 6, 0, 0]}>
                {byType.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  )
}

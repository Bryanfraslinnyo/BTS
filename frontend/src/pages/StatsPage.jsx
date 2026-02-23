import { useMemo } from 'react'
import { useApp } from '../context/Appcontext.jsx'
import { BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Card, { CardHeader, CardBody } from '../components/ui/Card.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import ChartTooltip from '../components/ui/ChartTooltip.jsx'
import { calcAge, MONTHS_FR } from '../utils/helpers.js'
import { CHART_PALETTE } from '../utils/constants.js'

export default function StatsPage() {
  const { patients, consultations, examens, stats } = useApp()

  const monthly = useMemo(() =>
    MONTHS_FR.map((mois, i) => ({
      mois,
      consultations: consultations.filter((c) => new Date(c.date).getMonth() === i).length,
      examens:       examens.filter((e)        => new Date(e.date).getMonth() === i).length,
    })),
    [consultations, examens]
  )

  const bySpec = useMemo(() => {
    const ct = {}
    consultations.forEach((c) => { ct[c.specialite] = (ct[c.specialite] || 0) + 1 })
    return Object.entries(ct).map(([name, value]) => ({ name: name.replace('Médecine Générale', 'Méd. Gén.'), value }))
  }, [consultations])

  const byMedecin = useMemo(() => {
    const ct = {}
    consultations.forEach((c) => { ct[c.medecin] = (ct[c.medecin] || 0) + 1 })
    return Object.entries(ct).map(([name, value]) => ({ name: name.replace('Dr. ', ''), value }))
  }, [consultations])

  const byStatut = useMemo(() => {
    const ct = {}
    consultations.forEach((c) => { ct[c.statut] = (ct[c.statut] || 0) + 1 })
    return Object.entries(ct).map(([name, value]) => ({ name, value }))
  }, [consultations])

  const byAge = useMemo(() => [
    { tranche: '0-17',  patients: patients.filter((p) => calcAge(p.dob) <= 17).length },
    { tranche: '18-30', patients: patients.filter((p) => { const a = calcAge(p.dob); return a >= 18 && a <= 30 }).length },
    { tranche: '31-45', patients: patients.filter((p) => { const a = calcAge(p.dob); return a >= 31 && a <= 45 }).length },
    { tranche: '46-60', patients: patients.filter((p) => { const a = calcAge(p.dob); return a >= 46 && a <= 60 }).length },
    { tranche: '60+',   patients: patients.filter((p) => calcAge(p.dob) > 60).length },
  ], [patients])

  const maxMed = Math.max(...byMedecin.map((d) => d.value), 1)

  return (
    <div className="page-content page-enter">
      {/* Stats row */}
      <div className="grid-4 mb-6">
        <StatCard icon="📋" label="Total consultations"      value={stats.totalConsultations}  colorClass="stat-icon-blue"   />
        <StatCard icon="✅" label="Taux de finalisation"    value={`${Math.round((stats.terminatedConsults / Math.max(stats.totalConsultations, 1)) * 100)}%`} colorClass="stat-icon-green" />
        <StatCard icon="🔬" label="Examens avec résultats"  value={examens.filter((e) => e.statut === 'Résultat disponible').length} colorClass="stat-icon-cyan" />
        <StatCard icon="👥" label="Patients enregistrés"    value={stats.totalPatients}        colorClass="stat-icon-orange" />
      </div>

      {/* Row 1: Monthly + By specialty */}
      <div className="grid-2 mb-5">
        <Card>
          <CardHeader title="Activité mensuelle" subtitle="Consultations & examens par mois" />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="consultations" name="Consultations" fill={CHART_PALETTE[0]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="examens"       name="Examens"       fill={CHART_PALETTE[2]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Consultations par spécialité" />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bySpec} layout="vertical" margin={{ top: 0, right: 20, left: 72, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={72} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" name="Consultations" radius={[0, 6, 6, 0]}>
                  {bySpec.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Row 2: Statuts + Medecins + Ages */}
      <div className="grid-3">
        <Card>
          <CardHeader title="Statuts des consultations" />
          <CardBody>
            <ResponsiveContainer width="100%" height={155}>
              <PieChart>
                <Pie data={byStatut} cx="50%" cy="50%" outerRadius={62} paddingAngle={3} dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {byStatut.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
              {byStatut.map((d, i) => (
                <div key={i} className="flex items-center gap-2" style={{ fontSize: 12 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 2, background: CHART_PALETTE[i], flexShrink: 0 }} />
                  <span style={{ flex: 1, color: 'var(--text-muted)' }}>{d.name}</span>
                  <strong>{d.value}</strong>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Activité par médecin" />
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {byMedecin.map((d, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2" style={{ fontSize: 12.5 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{d.name}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{d.value}</strong>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(d.value / maxMed) * 100}%`, background: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Répartition par tranche d'âge" />
          <CardBody>
            <ResponsiveContainer width="100%" height={198}>
              <BarChart data={byAge} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="tranche" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="patients" name="Patients" radius={[6, 6, 0, 0]}>
                  {byAge.map((_, i) => <Cell key={i} fill={CHART_PALETTE[(i + 3) % CHART_PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

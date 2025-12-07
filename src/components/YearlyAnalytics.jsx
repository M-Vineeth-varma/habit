import React, { useMemo, useState } from 'react'
import { useBackups } from '../hooks/useHabitsSync'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

export default function YearlyAnalytics() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const { backups } = useBackups()

  // Only backups for the chosen year
  const yearBackups = useMemo(
    () => backups.filter(b => Number(b.year) === Number(year)),
    [backups, year],
  )

  // OVERALL YEAR STATS
  const yearTotals = useMemo(() => {
    let totalChecks = 0
    let totalPossible = 0
    let maxHabits = 0

    yearBackups.forEach(b => {
      const habits = b.habits || []
      if (habits.length > maxHabits) maxHabits = habits.length

      habits.forEach(h => {
        const arr = h.checks || []
        totalPossible += arr.length
        totalChecks += arr.filter(Boolean).length
      })
    })

    const progressPct =
      totalPossible === 0
        ? 0
        : Math.round((totalChecks / totalPossible) * 10000) / 100

    return { totalChecks, totalPossible, maxHabits, progressPct }
  }, [yearBackups])

  // per-month stats (chart + month cards)
  const monthlyStats = useMemo(() => {
    return MONTHS.map(fullName => {
      const short = fullName.slice(0, 3)
      const monthBackups = yearBackups.filter(b => b.month === fullName)

      let totalChecks = 0
      let totalPossible = 0
      let maxHabits = 0

      monthBackups.forEach(b => {
        const habits = b.habits || []
        if (habits.length > maxHabits) maxHabits = habits.length

        habits.forEach(h => {
          const arr = h.checks || []
          totalPossible += arr.length
          totalChecks += arr.filter(Boolean).length
        })
      })

      const pct =
        totalPossible === 0
          ? 0
          : Math.round((totalChecks / totalPossible) * 10000) / 100

      return {
        fullMonth: fullName,
        month: short,
        numHabits: maxHabits,
        completed: totalChecks,
        pct,
      }
    })
  }, [yearBackups])

  const yearsAvailable = useMemo(
    () =>
      Array.from(new Set(backups.map(b => Number(b.year))))
        .filter(x => !Number.isNaN(x))
        .sort((a, b) => a - b),
    [backups],
  )

  const goPrevYear = () => setYear(y => y - 1)
  const goNextYear = () => setYear(y => y + 1)

  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      {/* Top grey bar like monthly header */}
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrevYear}
            className="px-2 py-1 text-xs border rounded"
          >
            ◀
          </button>
          <div className="h2">Yearly Statistics</div>
          <div className="text-sm text-slate-500">{year}</div>
          <select
            className="ml-2 text-xs border rounded px-2 py-1"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {Array.from(new Set([...yearsAvailable, now.getFullYear()]))
              .sort((a, b) => a - b)
              .map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
          </select>
          <button
            onClick={goNextYear}
            className="px-2 py-1 text-xs border rounded"
          >
            ▶
          </button>
        </div>

        <div className="flex gap-6 text-xs text-slate-700">
          <div>
            <div>Number of habits</div>
            <div className="font-semibold text-right">
              {yearTotals.maxHabits}
            </div>
          </div>
          <div>
            <div>Completed habits</div>
            <div className="font-semibold text-right">
              {yearTotals.totalChecks}
            </div>
          </div>
          <div className="w-40">
            <div>Progress</div>
            <div className="progress-bg mt-1">
              <div
                className="progress-fill"
                style={{ width: `${yearTotals.progressPct}%` }}
              />
            </div>
          </div>
          <div>
            <div>Progress in %</div>
            <div className="font-semibold text-right">
              {yearTotals.progressPct.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Title text similar to slide */}
      <div className="mb-2">
        <div className="text-base font-semibold">
          Analyze your yearly results to see your monthly progress!
        </div>
        <div className="text-xs text-slate-500">
          Powered by your Monthly backups.
        </div>
      </div>

      {/* Green yearly area chart */}
      <div className="border rounded p-3 mb-4">
        <div className="text-xs text-slate-500 mb-1">
          Monthly completion trend
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyStats}
              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="yearlyProgress"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#bbf7d0"
                    stopOpacity={0.95}
                  />
                  <stop
                    offset="100%"
                    stopColor="#bbf7d0"
                    stopOpacity={0.2}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis
                tick={{ fontSize: 10 }}
                domain={[0, 100]}
                tickFormatter={v => `${v}%`}
              />
              <Tooltip
                formatter={(value) => `${value}%`}
                labelFormatter={label => `Month: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="pct"
                stroke="#22c55e"
                fill="url(#yearlyProgress)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Month cards below chart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {monthlyStats.map(m => (
          <div
            key={m.fullMonth}
            className="border rounded-lg px-3 py-2 text-xs bg-slate-50"
          >
            <div className="font-semibold text-sm mb-1">
              {m.fullMonth}
            </div>
            <div>
              Number of Habits:{' '}
              <span className="font-medium">{m.numHabits}</span>
            </div>
            <div>
              Completed:{' '}
              <span className="font-medium">{m.completed}</span>
            </div>
            <div>
              Progress:{' '}
              <span className="font-medium">{m.pct.toFixed(2)}%</span>
            </div>
          </div>
        ))}
      </div>

      {yearBackups.length === 0 && (
        <div className="mt-3 text-[11px] text-slate-400">
          No yearly data yet. Go to the Monthly tab and create at least one
          backup snapshot to see stats here.
        </div>
      )}
    </div>
  )
}

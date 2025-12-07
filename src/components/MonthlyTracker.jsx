// MonthlyTracker.jsx
import React, { useState, useMemo } from 'react'
import useHabitsSync, { useBackups } from '../hooks/useHabitsSync'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from 'recharts'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const COLORS = ['#34d399','#60a5fa','#fb7185','#facc15','#a78bfa']

const DAYS_IN_MONTH = 30
const MAX_HABITS = 15     // 🔒 hard cap per month

export default function MonthlyTracker() {
  const now = new Date()
  const [month, setMonth] = useState(MONTHS[now.getMonth()])
  const [year, setYear] = useState(now.getFullYear())
  const [isDarkMode, setIsDarkMode] = useState(true)

  // simple add-form state
  const [newTitle, setNewTitle] = useState('')
  const [newColor, setNewColor] = useState(COLORS[0])

  const { habits, addHabit, updateHabit, removeHabit, loading } =
    useHabitsSync(month, year)
  const { backups, createBackup } = useBackups()

  // only use the first MAX_HABITS habits everywhere in the UI
  const limitedHabits = useMemo(
    () => habits.slice(0, MAX_HABITS),
    [habits]
  )

  // --------------------------------------------------
  // ADD / EDIT / DELETE
  // --------------------------------------------------
  async function handleAddHabit() {
    const title = newTitle.trim()
    if (!title) return

    if (limitedHabits.length >= MAX_HABITS) {
      alert(`You can track up to ${MAX_HABITS} habits per month.`)
      return
    }

    await addHabit({
      title,
      checks: Array(DAYS_IN_MONTH).fill(false),
      streak: 0,
      color: newColor,
      month,
      year,
      order: habits.length, // keep new ones at the end
    })

    setNewTitle('')
  }

  async function handleEditHabit(habit) {
    const newName = window.prompt('Edit habit name', habit.title)
    if (!newName) return
    const trimmed = newName.trim()
    if (!trimmed) return

    await updateHabit(habit.id, { title: trimmed })
  }

  async function handleDeleteHabit(id) {
    const ok = window.confirm('Delete this habit?')
    if (!ok) return
    await removeHabit(id)
  }

  // 🔥 CLEAR ALL HABITS FOR THIS MONTH
  async function handleClearAll() {
    if (limitedHabits.length === 0) return
    const ok = window.confirm(
      `Delete all ${limitedHabits.length} habits for ${month} ${year}?`
    )
    if (!ok) return
    await Promise.all(limitedHabits.map(h => removeHabit(h.id)))
  }

  // --------------------------------------------------
  // ANALYTICS (based on limitedHabits only)
  // --------------------------------------------------
  const totalChecks = limitedHabits
    .flatMap(h => h.checks || [])
    .filter(Boolean).length

  const totalPossible = limitedHabits.length * DAYS_IN_MONTH

  const progressPct =
    Math.round((totalChecks / Math.max(1, totalPossible)) * 10000) / 100

  // per-day stats (for progress row + green graph)
  const perDay = Array.from({ length: DAYS_IN_MONTH }).map((_, d) => {
    const done = limitedHabits.reduce(
      (acc, h) => acc + ((h.checks && h.checks[d]) ? 1 : 0),
      0,
    )
    const notDone = Math.max(0, limitedHabits.length - done)
    const pct =
      limitedHabits.length === 0 ? 0 : Math.round((done / limitedHabits.length) * 100)
    return { day: d + 1, done, notDone, pct }
  })

  // per-habit analysis (status bars)
  const analysisRows = useMemo(
    () =>
      limitedHabits.map(h => {
        const goal = DAYS_IN_MONTH
        const actual = (h.checks || []).filter(Boolean).length
        const pct = goal === 0 ? 0 : Math.round((actual / goal) * 100)
        return { id: h.id, title: h.title, goal, actual, pct }
      }),
    [limitedHabits],
  )

  // derive simple "mental" + "mood" from completion %
  const moodSeries = useMemo(
    () =>
      perDay.map(d => {
        const base = d.pct
        return {
          day: d.day,
          mood: Math.min(100, Math.max(20, base + 15)),
          motivation: Math.min(100, Math.max(20, base + 5)),
        }
      }),
    [perDay],
  )

  async function toggle(hid, idx) {
    const h = limitedHabits.find(x => x.id === hid)
    if (!h) return
    const newChecks = (h.checks || []).slice()
    newChecks[idx] = !newChecks[idx]
    await updateHabit(hid, { checks: newChecks })
  }

  const goPrevMonth = () => {
    const i = MONTHS.indexOf(month)
    if (i === 0) {
      setMonth(MONTHS[11])
      setYear(y => y - 1)
    } else setMonth(MONTHS[i - 1])
  }

  const goNextMonth = () => {
    const i = MONTHS.indexOf(month)
    if (i === 11) {
      setMonth(MONTHS[0])
      setYear(y => y + 1)
    } else setMonth(MONTHS[i + 1])
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="rounded-2xl p-4 shadow-lg bg-gray-900 text-white text-sm">
        Loading monthly tracker...
      </div>
    )
  }

  return (
    <div className={`rounded-2xl p-4 shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white' : 'bg-white'}`}>
      {/* TOP HEADER */}
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrevMonth}
            className="px-2 py-1 text-xs border rounded"
          >
            ◀
          </button>
          <div className="h2">{month}</div>
          <div className="text-sm text-slate-500">{year}</div>
          <button
            onClick={goNextMonth}
            className="px-2 py-1 text-xs border rounded"
          >
            ▶
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-xs text-slate-700 items-end">
          <div>
            <div>Number of habits</div>
            <div className="font-semibold text-right">
              {limitedHabits.length} / {MAX_HABITS}
            </div>
          </div>
          <div>
            <div>Completed habits</div>
            <div className="font-semibold text-right">{totalChecks}</div>
          </div>
          <div className="w-40">
            <div>Progress</div>
            <div className="progress-bg mt-1">
              <div
                className="progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <div>
            <div>Progress in %</div>
            <div className="font-semibold text-right">
              {progressPct.toFixed(2)}%
            </div>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="px-3 py-1 rounded bg-gray-600 text-white text-xs"
          >
            {isDarkMode ? 'Light' : 'Dark'}
          </button>
          {/* CLEAR ALL BUTTON */}
          <button
            onClick={handleClearAll}
            className="px-3 py-1 rounded bg-red-600 text-white text-xs"
            disabled={limitedHabits.length === 0}
          >
            Clear all habits
          </button>
        </div>
      </div>

      {/* ADD HABIT FORM */}
      <div className={`border rounded-lg p-3 mb-4 shadow-md transition-all duration-300 ${isDarkMode ? 'border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-slate-50'}`}>
        <div className="text-sm font-semibold mb-2">Add New Habit</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Habit Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className={`flex-1 px-3 py-2 border rounded text-sm ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
          />
          <select
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className={`px-3 py-2 border rounded text-sm ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
          >
            {COLORS.map(color => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
          <button
            onClick={handleAddHabit}
            className="px-4 py-2 bg-emerald-500 text-white rounded text-sm hover:bg-emerald-600 transition-colors"
          >
            Add Habit
          </button>
        </div>
      </div>

      {/* GRID + ANALYSIS SIDE-BY-SIDE */}
      <div className="flex flex-col lg:flex-row gap-3 mb-3">
        {/* GRID */}
        <div className={`flex-1 overflow-auto border rounded p-2 ${isDarkMode ? 'border-gray-600 bg-gray-800' : ''}`}>
          <table className="min-w-[960px] w-full table-fixed table-grid md:min-w-full">
            <thead>
              <tr>
                <th className={`w-[240px] text-left ${isDarkMode ? 'text-white' : ''}`}>My Habits</th>
                {Array.from({ length: DAYS_IN_MONTH }).map((_, i) => (
                  <th key={i} className={`text-center text-[11px] ${isDarkMode ? 'text-gray-300' : ''}`}>
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {limitedHabits.map((h) => (
                <tr key={h.id} className={`border-t group ${isDarkMode ? 'border-gray-600' : ''}`}>
                  <td className="p-2 align-top">
                    <div className="flex justify-between items-center">
                      <div className={`font-semibold text-[13px] ${isDarkMode ? 'text-white' : ''}`}>
                        {h.title}
                      </div>
                      {/* edit / delete buttons */}
                      <div className="flex gap-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditHabit(h)}
                          className={`px-2 py-0.5 border rounded ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'bg-slate-50'}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteHabit(h.id)}
                          className={`px-2 py-0.5 border rounded ${isDarkMode ? 'border-gray-600 bg-red-800 text-white' : 'bg-red-50 text-red-600'}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </td>
                  {(h.checks || Array(DAYS_IN_MONTH).fill(false)).map(
                    (c, d) => (
                      <td
                        key={d}
                        className="p-1 text-center align-middle"
                      >
                        <button
                          onClick={() => toggle(h.id, d)}
                          className={`checkbox-btn ${c ? 'checked' : ''}`}
                          aria-pressed={c ? 'true' : 'false'}
                        />
                      </td>
                    ))}
                </tr>
              ))}
              {limitedHabits.length === 0 && (
                <tr>
                  <td colSpan={DAYS_IN_MONTH + 1} className={`text-center text-xs py-4 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>
                    No habits yet. Add one above to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ANALYSIS STATUS BARS */}
        <div className={`w-full lg:w-64 border rounded-lg p-2 shadow-md transition-all duration-300 ${isDarkMode ? 'border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-slate-50'}`}>
          <div className={`text-sm font-semibold mb-2 text-center ${isDarkMode ? 'text-white' : ''}`}>
            Analysis
          </div>
          <table className="w-full text-[11px]">
            <thead>
              <tr className={`${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                <th className="text-left">Goal</th>
                <th className="text-left">Actual</th>
                <th className="text-left">Progress</th>
              </tr>
            </thead>
            <tbody>
              {analysisRows.map(row => (
                <tr key={row.id}>
                  <td className={`${isDarkMode ? 'text-white' : ''}`}>{row.goal}</td>
                  <td className={`${isDarkMode ? 'text-white' : ''}`}>{row.actual}</td>
                  <td>
                    <div className="progress-bg" style={{ height: 10 }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {analysisRows.length === 0 && (
                <tr>
                  <td colSpan={3} className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>
                    No habits yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROGRESS / DONE / NOT DONE ROWS */}
      <div className="overflow-auto border rounded p-2 mb-4">
        <table className="min-w-[960px] w-full table-fixed table-grid lg:min-w-full">
          <tbody>
            <tr>
              <td className="font-semibold text-xs">Progress</td>
              {perDay.map(d => (
                <td key={d.day} className="text-center text-[10px]">
                  {d.pct}%
                </td>
              ))}
            </tr>
            <tr>
              <td className="font-semibold text-xs text-emerald-600">Done</td>
              {perDay.map(d => (
                <td key={d.day} className="text-center text-[10px]">
                  {d.done}
                </td>
              ))}
            </tr>
            <tr>
              <td className="font-semibold text-xs text-slate-500">
                Not Done
              </td>
              {perDay.map(d => (
                <td key={d.day} className="text-center text-[10px]">
                  {d.notDone}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* GREEN PROGRESS TREND */}
      <div className={`border rounded-lg p-3 mb-4 shadow-md transition-all duration-300 ${isDarkMode ? 'border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900' : ''}`}>
        <div className="text-xs text-slate-500 mb-1">
          Progress trend for this month
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={perDay}
              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="monthlyProgress" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="#bbf7d0"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="100%"
                    stopColor="#bbf7d0"
                    stopOpacity={0.2}
                  />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="pct"
                stroke="#34d399"
                fill="url(#monthlyProgress)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PINK MENTAL STATE / MOOD TREND */}
      <div className={`border rounded-lg p-3 mb-4 shadow-md transition-all duration-300 ${isDarkMode ? 'border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900' : ''}`}>
        <div className="text-xs text-slate-500 mb-1">
          Mental state: mood &amp; motivation
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={moodSeries}
              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="moodGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#fecaca" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#fecaca" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="#fb7185"
                fill="url(#moodGradient)"
                strokeWidth={2}
                name="Mood"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          Mood is derived from your completion % for now—you can later
          replace it with manual 1–10 ratings.
        </div>
      </div>

      {/* BACKUPS PANEL */}
      <div className={`border rounded-lg p-3 text-xs shadow-md transition-all duration-300 ${isDarkMode ? 'border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900 text-gray-300' : 'text-slate-600'}`}>
        <div className="font-semibold mb-2">Analysis &amp; Backups</div>
        <button
          onClick={() => createBackup(month, year, limitedHabits)}
          className="px-3 py-1.5 rounded bg-emerald-500 text-white text-xs mb-2"
        >
          Create backup snapshot
        </button>
        <div className="space-y-1 max-h-24 overflow-auto">
          {backups.length === 0 && (
            <div className="text-slate-400 text-[11px]">No backups yet.</div>
          )}
          {backups.map(b => (
            <div
              key={b.id}
              className="flex justify-between text-[11px]"
            >
              <span>
                {b.month} {b.year}
              </span>
              <span>{new Date(b.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[10px] text-slate-400">
          These snapshots power your yearly statistics and deeper analysis.
        </div>
      </div>
    </div>
  )
}

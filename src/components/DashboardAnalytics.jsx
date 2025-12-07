import React, { useMemo, useState } from 'react'
import useHabitsSync from '../hooks/useHabitsSync'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const COLORS_PRIORITY = ['#f97373', '#fb923c', '#60a5fa', '#e5e7eb']
const COLORS_STATUS = ['#22c55e', '#e5e7eb']
const COLORS_CATEGORY = ['#22c55e','#3b82f6','#facc15','#a855f7','#ec4899','#6b7280']

export default function DashboardAnalytics() {
  const now = new Date()
  const [month] = useState(MONTHS[now.getMonth()])
  const [year] = useState(now.getFullYear())
  const { habits } = useHabitsSync(month, year)

  const {
    statusPie,
    priorityPie,
    categoryPie,
    totalTasks,
    overdue,
    notCompleted,
    completedToday,
  } = useMemo(() => {
    let totalSlots = 0
    let totalCompleted = 0

    const categoryMap = {}
    const priorityMap = { High: 0, Medium: 0, Low: 0, Optional: 0 }

    habits.forEach(h => {
      const checks = h.checks || []
      const done = checks.filter(Boolean).length
      const possible = checks.length || 1

      totalSlots += possible
      totalCompleted += done

      const cat = h.category || 'Other'
      categoryMap[cat] = (categoryMap[cat] || 0) + done

      const pct = (done / possible) * 100
      let key
      if (pct >= 70) key = 'High'
      else if (pct >= 40) key = 'Medium'
      else if (pct > 0) key = 'Low'
      else key = 'Optional'
      priorityMap[key] += 1
    })

    const notDone = Math.max(0, totalSlots - totalCompleted)

    return {
      totalTasks: habits.length,
      overdue: 0, // placeholder
      notCompleted: notDone,
      completedToday: 0, // placeholder
      statusPie: [
        { name: 'Completed', value: totalCompleted },
        { name: 'Not completed', value: notDone },
      ],
      priorityPie: Object.entries(priorityMap)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value })),
      categoryPie: Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value,
      })),
    }
  }, [habits])

  return (
    <div className="bg-white rounded-2xl p-4 shadow card-hover">
      <div className="flex justify-between items-center mb-3">
        <div>
          <div className="text-base font-semibold">
            Analyze your effort distribution with charts
          </div>
          <div className="text-xs text-slate-500">
            Understand where your time actually goes.
          </div>
        </div>
        <div className="text-xs text-slate-500 text-right">
          <div>Date: {now.toLocaleDateString()}</div>
          <div>Dashboard</div>
        </div>
      </div>

      {/* top metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4 border rounded p-2 bg-slate-50">
        <div>
          <div className="text-slate-500">Total tasks / habits</div>
          <div className="font-semibold text-lg">{totalTasks}</div>
        </div>
        <div>
          <div className="text-slate-500">Overdue</div>
          <div className="font-semibold text-lg">{overdue}</div>
        </div>
        <div>
          <div className="text-slate-500">Not completed</div>
          <div className="font-semibold text-lg">{notCompleted}</div>
        </div>
        <div>
          <div className="text-slate-500">Today</div>
          <div className="font-semibold text-lg">{completedToday}</div>
        </div>
      </div>

      {/* three pies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Priority */}
        <div className="border rounded p-2">
          <div className="text-xs font-semibold mb-1">Priority</div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityPie}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={60}
                  labelLine={false}
                >
                  {priorityPie.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS_PRIORITY[index % COLORS_PRIORITY.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={24} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status */}
        <div className="border rounded p-2">
          <div className="text-xs font-semibold mb-1">Status</div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPie}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={60}
                  labelLine={false}
                >
                  {statusPie.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={24} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category */}
        <div className="border rounded p-2">
          <div className="text-xs font-semibold mb-1">Category</div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPie}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={60}
                  labelLine={false}
                >
                  {categoryPie.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS_CATEGORY[index % COLORS_CATEGORY.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={24} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

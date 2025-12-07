import React, { useState, useEffect } from 'react'
import useHabitsSync from '../hooks/useHabitsSync'
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

export default function WeeklyAnalytics() {
  const now = new Date()
  const [month] = useState(MONTHS[now.getMonth()])
  const [year] = useState(now.getFullYear())
  const { habits } = useHabitsSync(month, year)

  const [categoryData, setCategoryData] = useState([])

  useEffect(() => {
    const map = {}
    habits.forEach(h => {
      const cat = h.category || 'Other'
      const done = (h.checks || []).filter(Boolean).length
      map[cat] = (map[cat] || 0) + done
    })
    const arr = Object.entries(map).map(([k, v]) => ({
      category: k,
      value: v,
    }))
    setCategoryData(arr)
  }, [habits])

  return (
    <div className="bg-white rounded-2xl p-4 shadow card-hover mt-4">
      <div className="flex justify-between mb-4">
        <div>
          <h2 className="h2">Weekly / Category Analytics</h2>
          <div className="text-xs text-slate-500">
            Completion count by category for this month
          </div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={categoryData}>
            <XAxis dataKey="category" />
            <Tooltip />
            <Bar dataKey="value" fill="#34d399" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

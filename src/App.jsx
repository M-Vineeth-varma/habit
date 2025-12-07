import React, { useState } from 'react'
import Header from './components/Header'
import MonthlyTracker from './components/MonthlyTracker'
import WeeklyPlanner from './components/WeeklyPlanner'
import WeeklyAnalytics from './components/WeeklyAnalytics'
import YearlyAnalytics from './components/YearlyAnalytics'
import DashboardAnalytics from './components/DashboardAnalytics'

export default function App() {
  const [route, setRoute] = useState('monthly')

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-[1200px] mx-auto">
        <Header onNavigate={setRoute} active={route} />

        <main className="mt-6 space-y-4">
          {route === 'monthly' && <MonthlyTracker />}

          {route === 'weekly' && (
            <>
              <WeeklyPlanner />
              <WeeklyAnalytics />
              <DashboardAnalytics />
            </>
          )}

          {route === 'yearly' && <YearlyAnalytics />}
        </main>
      </div>
    </div>
  )
}

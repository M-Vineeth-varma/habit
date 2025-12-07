import React from 'react'
import { motion } from 'framer-motion'

export default function Header({ onNavigate, active }) {
  const nav = ['monthly', 'weekly', 'yearly']

  return (
    <div className="flex items-center justify-between p-4 rounded-lg glass">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center text-white font-bold shadow-sm">
          HT
        </div>
        <div>
          <h2 className="text-lg font-semibold">Habit Tracker</h2>
          <div className="text-xs text-gray-500">Simple habits, smarter days</div>
        </div>
      </div>

      <nav className="flex items-center gap-3">
        {nav.map((n) => (
          <button
            key={n}
            onClick={() => onNavigate(n)}
            className={`relative px-3 py-2 rounded-md text-sm capitalize ${
              active === n
                ? 'text-white bg-gradient-to-r from-green-500 to-emerald-400 shadow'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <motion.span layout initial={false}>
              {n}
            </motion.span>
          </button>
        ))}
      </nav>
    </div>
  )
}

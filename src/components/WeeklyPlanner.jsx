import React from 'react'
import { motion } from 'framer-motion'

const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
export default function WeeklyPlanner(){
  const dayData = days.map((d,i)=> ({day:d, pct: [67,86,80,60,17,80,71][i]}))

  return (
    <motion.div className="p-4 rounded-lg glass" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="h2">Weekly Planner</h3>
        <div className="text-sm text-gray-500">Overview</div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {dayData.map((d,idx)=> (
          <motion.div
            key={d.day}
            className="p-3 rounded card-hover"
            initial={{opacity:0, scale:0.985}}
            animate={{opacity:1, scale:1}}
            transition={{delay: idx * 0.03}}
          >
            <div className="text-xs text-gray-500">{d.day}</div>
            <div className="flex items-center justify-center my-2">
              <svg viewBox="0 0 40 40" className="w-16 h-16">
                <defs>
                  <linearGradient id={`wg${idx}`} x1="0" x2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                <circle cx="20" cy="20" r="14" stroke="#eef2f7" strokeWidth="6" fill="none" />
                <circle cx="20" cy="20" r="14" stroke={`url(#wg${idx})`} strokeWidth="6" strokeDasharray={`${(d.pct/100)*2*Math.PI*14} 999`} transform="rotate(-90 20 20)" strokeLinecap="round" />
                <text x="20" y="24" fontSize="8" textAnchor="middle" fill="#0f172a">{d.pct}%</text>
              </svg>
            </div>
            <div className="text-xs text-gray-600">Tasks</div>
            <ul className="text-xs mt-2 space-y-1 h-28 overflow-auto text-gray-700">
              <li><label className="flex items-center gap-2"><input type="checkbox"/> Quick review</label></li>
              <li><label className="flex items-center gap-2"><input type="checkbox"/> Focus session</label></li>
              <li><label className="flex items-center gap-2"><input type="checkbox"/> Plan</label></li>
            </ul>
            <div className="text-xs mt-2 text-green-600 font-semibold">Completed 4</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

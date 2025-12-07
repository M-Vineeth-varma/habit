import React from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts'

const months = ['Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct']
const data = months.map((m,i)=> ({month:m, pct: [30,45,67,50,22,52,70,67,45,23,0,0][i] }))

export default function YearlyStats(){
  return (
    <motion.div className="p-4 rounded-lg glass" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div className="flex items-center justify-between">
        <h3 className="h2">Yearly Statistics</h3>
        <div className="text-sm text-gray-500">Monthly summary</div>
      </div>

      <div className="h-48 mt-3 bg-transparent">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{top:6,right:6,left:6,bottom:0}}>
            <defs>
              <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#bbf7d0" stopOpacity={0.95}/>
                <stop offset="100%" stopColor="#bbf7d0" stopOpacity={0.18}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="pct" stroke="#10b981" fill="url(#g2)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        {months.map((m,idx)=> (
          <motion.div key={m} className="p-3 rounded card-hover" whileHover={{y:-4}} transition={{type:'spring',stiffness:220}}>
            <div className="flex items-center justify-between">
              <div className="font-semibold">{m}</div>
              <div className="text-sm text-gray-500">{data[idx].pct}%</div>
            </div>
            <div className="text-xs text-gray-500 mt-2">Habits: <span className="font-medium">{ [0,4,7,12,8,7,12,12,8,0,0,0][idx] || 0 }</span></div>
            <div className="mt-3">
              <div className="progress-bg">
                <div className="progress-fill" style={{width: `${data[idx].pct}%`}} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

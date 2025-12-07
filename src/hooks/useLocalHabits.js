import { useEffect, useState } from 'react'

// Simple localStorage-backed hook for habits
export default function useLocalHabits(initial, key = 'habits_v1'){
  const [state, setState] = useState(()=>{
    try{
      const raw = localStorage.getItem(key)
      if(raw){
        return JSON.parse(raw)
      }
    }catch(_){
      // ignore
    }
    return typeof initial === 'function' ? initial() : initial
  })

  useEffect(()=>{
    try{
      localStorage.setItem(key, JSON.stringify(state))
    }catch{
      // ignore
    }
  }, [key, state])

  return [state, setState]
}

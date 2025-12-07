import { useEffect, useState, useCallback } from 'react'
import { db } from '../firebase'
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  orderBy,
  where,
} from 'firebase/firestore'

// ✅ MAIN HABIT SYNC HOOK (MONTH + YEAR SAFE)
export default function useHabitsSync(month, year) {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!month || !year) return

    setLoading(true)

    const q = query(
      collection(db, 'habits'),
      where('month', '==', month),
      where('year', '==', year),
      orderBy('createdAt', 'asc'),
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr = []
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }))
        setHabits(arr)
        setLoading(false)
      },
      (err) => {
        console.error('Firestore error:', err)
        setLoading(false)
      },
    )

    return () => unsub()
  }, [month, year])

  // ✅ ADD HABIT
  const addHabit = useCallback(async (payload) => {
    try {
      await addDoc(collection(db, 'habits'), {
        title: payload.title,
        // no category
        color: payload.color,
        month: payload.month,
        year: payload.year,
        order: payload.order || 0,
        streak: payload.streak || 0,
        checks: payload.checks || Array(30).fill(false),
        createdAt: Date.now(),
      })
    } catch (e) {
      console.error('Error adding habit:', e)
    }
  }, [])

  // ✅ UPDATE HABIT (EDIT NAME, CHECKBOX, ETC.)
  const updateHabit = useCallback(async (id, payload) => {
    try {
      await updateDoc(doc(db, 'habits', id), payload)
    } catch (e) {
      console.error('Error updating habit:', e)
    }
  }, [])

  // ✅ DELETE HABIT (PERMANENT)
  const removeHabit = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, 'habits', id))
    } catch (e) {
      console.error('Error removing habit:', e)
    }
  }, [])

  return { habits, addHabit, updateHabit, removeHabit, loading }
}

// ✅ BACKUP SYSTEM (USED ONLY FOR YEARLY ANALYTICS)
export function useBackups() {
  const [backups, setBackups] = useState([])

  useEffect(() => {
    const q = query(
      collection(db, 'backups'),
      orderBy('createdAt', 'desc'),
    )

    const unsub = onSnapshot(q, (snap) => {
      const arr = []
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }))
      setBackups(arr)
    })

    return () => unsub()
  }, [])

  // ✅ CREATE BACKUP SNAPSHOT
  const createBackup = useCallback(async (month, year, habits) => {
    try {
      await addDoc(collection(db, 'backups'), {
        month,
        year,
        habits: habits.map((h) => ({
          title: h.title,
          // no category
          color: h.color,
          checks: h.checks,
        })),
        createdAt: Date.now(),
      })
    } catch (e) {
      console.error('Error creating backup:', e)
    }
  }, [])

  return { backups, createBackup }
}

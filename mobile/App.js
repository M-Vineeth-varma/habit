import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  FlatList
} from 'react-native'
import Svg, { Circle, Text as SvgText } from 'react-native-svg'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore'

// Initialize firebase - use same config as web
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: process.env.FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'YOUR_BUCKET',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MSG_ID',
  appId: process.env.FIREBASE_APP_ID || 'YOUR_APP_ID'
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderBottomWidth: 1
  },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  progressBox: {
    marginVertical: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10
  },
  small: { color: '#6b7280', marginBottom: 8, fontSize: 12 },
  progressBarBg: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6
  },
  progressBar: { height: 12, backgroundColor: '#34d399' },
  progressText: { fontSize: 12, color: '#374151', fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: 'rgba(0,0,0,0.06)',
    borderWidth: 1
  },
  habitTitle: { fontWeight: '700', fontSize: 14, color: '#0f172a' },
  habitSub: { color: '#6b7280', fontSize: 12, marginTop: 4 },
  weekPreview: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8
  },
  dayCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  dayChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981'
  },
  dayText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  loadingText: { textAlign: 'center', color: '#6b7280', marginTop: 20 }
})


export default function App() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const q = query(collection(db, 'habits'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, snap => {
      const arr = []
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }))
      setHabits(arr)
      setLoading(false)
    }, err => {
      console.error('Firestore error:', err)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function toggle(hid, idx) {
    const h = habits.find(x => x.id === hid)
    if (!h) return
    const newChecks = (h.checks || Array(30).fill(false)).slice()
    newChecks[idx] = !newChecks[idx]
    try {
      await updateDoc(doc(db, 'habits', hid), { checks: newChecks })
    } catch (e) {
      console.error('Error updating:', e)
    }
  }

  // Mobile UI mirrors web
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Habit Tracker</Text>
        <Text style={styles.subtitle}>Mobile</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <View style={styles.progressBox}>
          <Text style={styles.small}>Monthly Progress</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBar, { width: '58%' }]} />
          </View>
          <Text style={styles.progressText}>58%</Text>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading habits...</Text>
        ) : (
          <FlatList
            data={habits}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.card} key={item.id}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.habitTitle}>{item.title}</Text>
                  <Text style={styles.habitSub}>
                    Completed: {(item.checks || []).filter(Boolean).length}/30
                  </Text>
                </View>

                {/* Simplified week preview (7 days) */}
                <View style={styles.weekPreview}>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => toggle(item.id, i)}
                      style={[
                        styles.dayCheckbox,
                        (item.checks && item.checks[i]) ? styles.dayChecked : {}
                      ]}
                    >
                      <Text style={styles.dayText}>
                        {(item.checks && item.checks[i]) ? '✓' : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

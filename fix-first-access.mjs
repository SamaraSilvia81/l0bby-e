import { readFileSync } from 'fs'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore'

const env = {}
readFileSync('.env', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=')
  if (k && v.length) env[k.trim()] = v.join('=').trim()
})

const app = initializeApp({
  apiKey: env.VITE_FB_API_KEY, authDomain: env.VITE_FB_AUTH_DOMAIN,
  projectId: env.VITE_FB_PROJECT_ID, storageBucket: env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FB_MESSAGING_SENDER_ID, appId: env.VITE_FB_APP_ID,
})
const db = getFirestore(app)

// Matrículas/usernames que NÃO devem ter firstAccess
const SKIP = ['DS-2026-SAMS', 'COORD-001', 'sams']

async function fix() {
  console.log('\n🔧 Configurando firstAccess...\n')
  const snap = await getDocs(collection(db, 'students'))
  let fixed = 0, skip = 0

  for (const d of snap.docs) {
    const data = d.data()
    // Pula admin, staff e a Samara
    if (data.role === 'admin' || data.role === 'staff') { skip++; continue }
    if (SKIP.includes(data.matricula) || SKIP.includes(data.username)) { skip++; continue }
    // Só atualiza se firstAccess não está true ainda
    if (data.firstAccess !== true) {
      await updateDoc(doc(db, 'students', d.id), { firstAccess: true })
      console.log(`  ✓ ${data.name || data.matricula}`)
      fixed++
    } else {
      skip++
    }
  }

  console.log(`\n✅ ${fixed} alunos configurados com firstAccess, ${skip} pulados.`)
  process.exit(0)
}

fix().catch(err => { console.error('❌', err.message); process.exit(1) })

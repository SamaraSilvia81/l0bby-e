import { readFileSync } from 'fs'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc, deleteField } from 'firebase/firestore'

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

async function fix() {
  console.log('\n🔧 Corrigindo campo nome → name...\n')
  const snap = await getDocs(collection(db, 'students'))
  let fixed = 0
  for (const d of snap.docs) {
    const data = d.data()
    if (data.nome && !data.name) {
      await updateDoc(doc(db, 'students', d.id), {
        name: data.nome,
        nome: deleteField()
      })
      console.log(`  ✓ ${data.nome}`)
      fixed++
    }
  }
  console.log(`\n✅ ${fixed} alunos corrigidos!`)
  process.exit(0)
}

fix().catch(err => { console.error('❌', err.message); process.exit(1) })

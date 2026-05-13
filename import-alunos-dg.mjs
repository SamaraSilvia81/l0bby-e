import { readFileSync } from 'fs'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore'

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

const uid = () => Math.random().toString(36).slice(2,10) + Date.now().toString(36)

const ALUNOS_DG = [
  {
    "nome": "Aline Maria Da Silva",
    "matricula": "2101261",
    "username": "asilva1",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2101261"
  },
  {
    "nome": "Alysson Henrique Galvão Cabral",
    "matricula": "2225270",
    "username": "acabral2",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2225270"
  },
  {
    "nome": "Amanda Maria Galindo Costa E Silva",
    "matricula": "2594716",
    "username": "asilva3",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2594716"
  },
  {
    "nome": "Ana Beatriz Alves Silva",
    "matricula": "4059393",
    "username": "asilva4",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4059393"
  },
  {
    "nome": "Carlos Eduardo Da Silva Dias",
    "matricula": "1699625",
    "username": "cdias5",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "1699625"
  },
  {
    "nome": "Carlos Eduardo Da Silva Lima",
    "matricula": "2987716",
    "username": "clima6",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2987716"
  },
  {
    "nome": "Cauã José Do Nascimento",
    "matricula": "2230526",
    "username": "cnascimento7",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2230526"
  },
  {
    "nome": "Cleisla De Albuquerque Rodrigues",
    "matricula": "4059483",
    "username": "crodrigues8",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4059483"
  },
  {
    "nome": "Damyane Emanuelly Lopes Da Silva Duarte",
    "matricula": "4067558",
    "username": "dduarte9",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4067558"
  },
  {
    "nome": "Davi Gabriel Cabral Soares",
    "matricula": "3351045",
    "username": "dsoares10",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "3351045"
  },
  {
    "nome": "Davyson Farias Dos Santos",
    "matricula": "4067246",
    "username": "dsantos11",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4067246"
  },
  {
    "nome": "Dyre Winter Frost Da Silva",
    "matricula": "1948360",
    "username": "dsilva12",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "1948360"
  },
  {
    "nome": "Emerson Gomes Barbosa",
    "matricula": "756854",
    "username": "ebarbosa13",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "756854"
  },
  {
    "nome": "Esdras Magalhães Vila Nova",
    "matricula": "2209040",
    "username": "enova14",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2209040"
  },
  {
    "nome": "Estevão José Dos Santos Chagas",
    "matricula": "2091220",
    "username": "echagas15",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2091220"
  },
  {
    "nome": "Guilherme Hermano De Sousa",
    "matricula": "3695975",
    "username": "gsousa16",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "3695975"
  },
  {
    "nome": "Guilherme Nunes Marques",
    "matricula": "3225276",
    "username": "gmarques17",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "3225276"
  },
  {
    "nome": "Jennifer Emylle Lopes Nascimento",
    "matricula": "4059413",
    "username": "jnascimento18",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4059413"
  },
  {
    "nome": "Josimar Lourenco Da Silva Junior",
    "matricula": "642103",
    "username": "jjunior19",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "642103"
  },
  {
    "nome": "Joyce Cristina Alves Da Silva",
    "matricula": "4067247",
    "username": "jsilva20",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4067247"
  },
  {
    "nome": "Julianne Matias De Lima Silva",
    "matricula": "2391623",
    "username": "jsilva21",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2391623"
  },
  {
    "nome": "Kauã Vinicios Ferreira Da Silva",
    "matricula": "2916133",
    "username": "ksilva22",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2916133"
  },
  {
    "nome": "Laura Ribeiro Moreira",
    "matricula": "4059394",
    "username": "lmoreira23",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4059394"
  },
  {
    "nome": "Leandro Ulysses Rodrigues",
    "matricula": "3496879",
    "username": "lrodrigues24",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "3496879"
  },
  {
    "nome": "Luciene Do Nascimento Cavalcante",
    "matricula": "4059424",
    "username": "lcavalcante25",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4059424"
  },
  {
    "nome": "Ludmyla Monteiro Barreto",
    "matricula": "3427260",
    "username": "lbarreto26",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "3427260"
  },
  {
    "nome": "Matheus Álefe Bezerra Da Silva",
    "matricula": "2464120",
    "username": "msilva27",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2464120"
  },
  {
    "nome": "Mayra Marielly Dos Santos Ferreira",
    "matricula": "4059430",
    "username": "mferreira28",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4059430"
  },
  {
    "nome": "Natali Da Silva Correia",
    "matricula": "4059463",
    "username": "ncorreia29",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4059463"
  },
  {
    "nome": "Paulo Roberto Mendes De Lima",
    "matricula": "4059426",
    "username": "plima30",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4059426"
  },
  {
    "nome": "Sued Navarro Souza Dos Santos",
    "matricula": "3052756",
    "username": "ssantos31",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "3052756"
  },
  {
    "nome": "Tarciana Valeria Da Silva",
    "matricula": "4059480",
    "username": "tsilva32",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4059480"
  },
  {
    "nome": "Vânia Francisca Do Nascimento",
    "matricula": "3694817",
    "username": "vnascimento33",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "3694817"
  },
  {
    "nome": "Victor Hugo Ferreira Farias",
    "matricula": "2748211",
    "username": "vfarias34",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2748211"
  },
  {
    "nome": "Waleria Cristina Virginia De Andrade",
    "matricula": "2900168",
    "username": "wandrade35",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2900168"
  }
]

async function importar() {
  console.log(`\n🌱 Importando ${ALUNOS_DG.length} alunos de Design Gráfico...\n`)
  let ok = 0, skip = 0

  for (const alu of ALUNOS_DG) {
    // Verifica se matrícula já existe
    const q = query(collection(db, 'students'), where('matricula', '==', alu.matricula))
    const snap = await getDocs(q)
    if (!snap.empty) {
      console.log(`  ⏭  já existe: ${alu.nome} (${alu.matricula})`)
      skip++; continue
    }
    const id = 'stu-dg-' + uid()
    await setDoc(doc(db, 'students', id), {
      ...alu,
      role: 'student',
      firstAccess: true,
      createdAt: new Date().toISOString(),
    })
    console.log(`  ✓  importado: ${alu.nome} (@${alu.username})`)
    ok++
  }

  console.log(`\n✅ Concluído! ${ok} importados, ${skip} já existiam.`)
  console.log('   Senha inicial de cada aluno = sua matrícula.')
  console.log('   No primeiro login serão solicitados a trocar a senha.')
  process.exit(0)
}

importar().catch(err => { console.error('❌', err.message); process.exit(1) })

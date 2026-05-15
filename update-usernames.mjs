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

// Mapa matrícula → username correto
const MAPA = {
  "2101261": "aline.maria.s.moda",
  "2225270": "alysson.henrique.c.moda",
  "2594716": "amanda.maria.s.moda",
  "4059393": "ana.beatriz.s.moda",
  "1699625": "carlos.eduardo.d.moda",
  "2987716": "carlos.eduardo.l.moda",
  "2230526": "caua.jose.n.moda",
  "4059483": "cleisla.albuquerque.r.moda",
  "4067558": "damyane.emanuelly.d.moda",
  "3351045": "davi.gabriel.s.moda",
  "4067246": "davyson.farias.s.moda",
  "1948360": "dyre.winter.s.moda",
  "756854": "emerson.gomes.b.moda",
  "2209040": "esdras.magalhaes.n.moda",
  "2091220": "estevao.jose.c.moda",
  "3695975": "guilherme.hermano.s.moda",
  "3225276": "guilherme.nunes.m.moda",
  "4059413": "jennifer.emylle.n.moda",
  "642103": "josimar.lourenco.j.moda",
  "4067247": "joyce.cristina.s.moda",
  "2391623": "julianne.matias.s.moda",
  "2916133": "kaua.vinicios.s.moda",
  "4059394": "laura.ribeiro.m.moda",
  "3496879": "leandro.ulysses.r.moda",
  "4059424": "luciene.nascimento.c.moda",
  "3427260": "ludmyla.monteiro.b.moda",
  "2464120": "matheus.alefe.s.moda",
  "4059430": "mayra.marielly.f.moda",
  "4059463": "natali.silva.c.moda",
  "4059426": "paulo.roberto.l.moda",
  "3052756": "sued.navarro.s.moda",
  "4059480": "tarciana.valeria.s.moda",
  "3694817": "vania.francisca.n.moda",
  "2748211": "victor.hugo.f.moda",
  "2900168": "waleria.cristina.a.moda",
  "3898184": "ana.paula.e.mod3",
  "3320037": "debora.lopes.m.mod3",
  "3898213": "edja.eliza.s.mod3",
  "3898211": "elda.maria.s.mod3",
  "3898196": "estephane.clemente.l.mod3",
  "2811353": "gustavo.vieira.m.mod3",
  "1032625": "karen.vitoria.s.mod3",
  "2419726": "karolyne.sales.r.mod3",
  "2291753": "lazaro.luiz.v.mod3",
  "2537449": "lucas.felipe.s.mod3",
  "2246903": "alexandra.santos.p.moda",
  "4059427": "alice.amorim.f.moda",
  "3489716": "allyce.vitoria.a.moda",
  "3474522": "alvaro.miguel.n.moda",
  "4059406": "andre.silva.d.moda",
  "4059471": "andrea.cristina.c.moda",
  "4059432": "andreza.germana.s.moda",
  "4059438": "arthur.borges.f.moda",
  "2434534": "arthur.leonardo.s.moda",
  "4059462": "ayran.gabriel.l.moda",
  "2445224": "bennyson.xavier.s.moda",
  "4059441": "bruna.maria.c.moda",
  "4059402": "bruno.flaubert.s.moda",
  "4059478": "caio.ricardo.m.moda",
  "3378799": "carlos.fernando.n.moda",
  "4059451": "cristofanis.francisco.a.moda",
  "4059464": "daniel.jose.f.moda",
  "3361233": "emilly.maria.a.moda",
  "4059403": "erika.patricia.l.moda",
  "4059455": "ewerton.danilo.a.moda",
  "4059408": "fernando.verner.c.moda",
  "4059405": "helia.luiza.m.moda",
  "4059434": "hugo.henrique.moda",
  "4059485": "ilka.kesia.s.moda",
  "4059476": "jaqueline.santos.s.moda",
  "4059425": "joao.gabriel.l.moda",
  "4059409": "joao.guilherme.m.moda",
  "4059417": "joao.pedro.r.moda",
  "4059459": "joao.pedro.c.moda",
  "4059431": "julia.beatriz.s.moda",
  "4059396": "luiz.henrique.s.moda",
  "4059410": "marcos.paulo.n.moda",
  "2554842": "maria.luisa.s.moda",
  "4059487": "maria.patricia.s.moda",
  "4059419": "maria.zilda.p.moda",
  "4059439": "mariana.monteiro.s.moda",
  "4059477": "matheus.eduardo.o.moda",
  "4059436": "miguel.goncalves.a.moda",
  "4059404": "nathalia.kayanne.p.moda",
  "4059398": "nedison.manoel.d.moda",
  "4059473": "paloma.borges.f.moda",
  "4059450": "pedro.henrique.a.moda",
  "4059440": "rafael.vitor.o.moda",
  "4059422": "suammyr.cavalcante.c.moda",
  "4059465": "tacio.araujo.a.moda",
  "4059446": "thallys.vinicius.r.moda",
  "4059433": "yasmin.lauryn.s.moda",
  "4067248": "elizabete.paixao.d.modb",
  "1359130": "estefhany.santos.v.modb",
  "2384024": "felipe.santos.m.modb",
  "2592791": "gabriel.davy.a.modb",
  "4067249": "gian.thiago.f.modb",
  "2058773": "igor.neto.o.modb",
  "4067250": "iran.barboza.c.modb",
  "893665": "jadilson.francisco.s.modb",
  "2098997": "janaina.maria.s.modb",
  "2238477": "jefesson.correia.s.modb",
  "4067253": "jessica.rodrigues.l.modb",
  "1741329": "jose.augusto.s.modb",
  "3361829": "julia.sousa.f.modb",
  "3281050": "karla.beatriz.s.modb",
  "1495073": "lethicia.albuquerque.r.modb",
  "3394164": "luan.victor.s.modb",
  "2082953": "lucas.lima.s.modb",
  "3167311": "lucas.luiz.a.modb",
  "3233025": "luiz.miguel.a.modb",
  "4067255": "marcia.helena.f.modb",
  "2909850": "marco.antonio.m.modb",
  "2259350": "maria.luiza.b.modb",
  "3279875": "michele.karine.b.modb",
  "1722283": "milena.silva.l.modb",
  "693976": "millena.maria.s.modb",
  "3360791": "pamela.rodrigues.p.modb",
  "4067262": "paulo.henrique.g.modb",
  "4067260": "paulo.mariano.n.modb",
  "1536925": "paulo.william.f.modb",
  "3407695": "pedro.oliveira.l.modb",
  "3371939": "pedro.victor.p.modb",
  "3240130": "rayane.vitoria.s.modb",
  "4067257": "ronaldo.roberio.s.modb",
  "3369427": "ruan.gabriel.d.modb",
  "2790020": "ryan.diego.a.modb",
  "3399252": "silvio.salomao.a.modb",
  "2006940": "stefania.silva.m.modb",
  "314518": "tamires.santos.modb",
  "2025125": "tarciano.paulo.s.modb",
  "2054304": "thiago.henrique.m.modb",
  "4067256": "vinicius.hermann.f.modb",
  "534285": "vitoria.maria.s.modb",
  "836410": "wandeson.batista.t.modb",
  "514152": "wellington.alves.j.modb",
  "2930663": "yuri.silvano.s.modb",
  "2277461": "airton.lopo.s.mod3",
  "3898212": "caio.andrade.a.mod3",
  "3098701": "cybele.costa.s.mod3",
  "2502044": "davi.valeriano.s.mod3",
  "2197766": "emanoel.bruno.r.mod3",
  "3898220": "fagner.xavier.c.mod3",
  "3898169": "flavia.regina.s.mod3",
  "3262782": "guilherme.ghabriell.s.mod3",
  "3898167": "israel.jose.p.mod3",
  "3269492": "larissa.paiva.s.mod3",
  "3898176": "levi.oliveira.f.mod3",
  "3898241": "magali.maria.l.mod3",
  "3247138": "petyson.cauan.r.mod3",
  "3547282": "roberta.maria.s.mod3",
  "2255968": "thalison.felipe.s.mod3",
  "1929760": "valter.santos.a.mod3",
  "3898243": "vinicius.adorno.m.mod3",
  "3236420": "wallace.cezar.s.mod3",
  "1272018": "william.jose.s.mod3",
  "3898236": "yuri.wesley.m.mod3"
}

async function update() {
  console.log('\n🔧 Atualizando usernames...\n')
  const snap = await getDocs(collection(db, 'students'))
  let ok = 0, skip = 0

  for (const d of snap.docs) {
    const data = d.data()
    const novoUsername = MAPA[data.matricula]
    if (!novoUsername) { skip++; continue }
    if (data.username === novoUsername) { skip++; continue }
    await updateDoc(doc(db, 'students', d.id), { username: novoUsername })
    console.log(`  ✓ ${data.name || data.matricula} → @${novoUsername}`)
    ok++
  }

  console.log(`\n✅ ${ok} atualizados, ${skip} pulados.`)
  console.log('\nRegra do username:')
  console.log('  primeiro.segundo.inicialSobrenome.turma')
  console.log('  Ex: Aline Maria da Silva (MOD-A) → aline.maria.s.moda')
  process.exit(0)
}

update().catch(err => { console.error('❌', err.message); process.exit(1) })

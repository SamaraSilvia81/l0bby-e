import { readFileSync } from 'fs'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore'

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

const ALUNOS = [
  {
    "name": "Aline Maria Da Silva",
    "matricula": "2101261",
    "username": "asilva1dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2101261"
  },
  {
    "name": "Alysson Henrique Galvão Cabral",
    "matricula": "2225270",
    "username": "acabral2dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2225270"
  },
  {
    "name": "Amanda Maria Galindo Costa E Silva",
    "matricula": "2594716",
    "username": "asilva3dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2594716"
  },
  {
    "name": "Ana Beatriz Alves Silva",
    "matricula": "4059393",
    "username": "asilva4dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4059393"
  },
  {
    "name": "Carlos Eduardo Da Silva Dias",
    "matricula": "1699625",
    "username": "cdias5dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "1699625"
  },
  {
    "name": "Carlos Eduardo Da Silva Lima",
    "matricula": "2987716",
    "username": "clima6dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2987716"
  },
  {
    "name": "Cauã José Do Nascimento",
    "matricula": "2230526",
    "username": "cnascimento7dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2230526"
  },
  {
    "name": "Cleisla De Albuquerque Rodrigues",
    "matricula": "4059483",
    "username": "crodrigues8dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4059483"
  },
  {
    "name": "Damyane Emanuelly Lopes Da Silva Duarte",
    "matricula": "4067558",
    "username": "dduarte9dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4067558"
  },
  {
    "name": "Davi Gabriel Cabral Soares",
    "matricula": "3351045",
    "username": "dsoares10dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "3351045"
  },
  {
    "name": "Davyson Farias Dos Santos",
    "matricula": "4067246",
    "username": "dsantos11dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4067246"
  },
  {
    "name": "Dyre Winter Frost Da Silva",
    "matricula": "1948360",
    "username": "dsilva12dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "1948360"
  },
  {
    "name": "Emerson Gomes Barbosa",
    "matricula": "756854",
    "username": "ebarbosa13dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "756854"
  },
  {
    "name": "Esdras Magalhães Vila Nova",
    "matricula": "2209040",
    "username": "enova14dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2209040"
  },
  {
    "name": "Estevão José Dos Santos Chagas",
    "matricula": "2091220",
    "username": "echagas15dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2091220"
  },
  {
    "name": "Guilherme Hermano De Sousa",
    "matricula": "3695975",
    "username": "gsousa16dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "3695975"
  },
  {
    "name": "Guilherme Nunes Marques",
    "matricula": "3225276",
    "username": "gmarques17dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "3225276"
  },
  {
    "name": "Jennifer Emylle Lopes Nascimento",
    "matricula": "4059413",
    "username": "jnascimento18dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4059413"
  },
  {
    "name": "Josimar Lourenco Da Silva Junior",
    "matricula": "642103",
    "username": "jjunior19dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "642103"
  },
  {
    "name": "Joyce Cristina Alves Da Silva",
    "matricula": "4067247",
    "username": "jsilva20dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4067247"
  },
  {
    "name": "Julianne Matias De Lima Silva",
    "matricula": "2391623",
    "username": "jsilva21dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2391623"
  },
  {
    "name": "Kauã Vinicios Ferreira Da Silva",
    "matricula": "2916133",
    "username": "ksilva22dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2916133"
  },
  {
    "name": "Laura Ribeiro Moreira",
    "matricula": "4059394",
    "username": "lmoreira23dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4059394"
  },
  {
    "name": "Leandro Ulysses Rodrigues",
    "matricula": "3496879",
    "username": "lrodrigues24dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "3496879"
  },
  {
    "name": "Luciene Do Nascimento Cavalcante",
    "matricula": "4059424",
    "username": "lcavalcante25dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4059424"
  },
  {
    "name": "Ludmyla Monteiro Barreto",
    "matricula": "3427260",
    "username": "lbarreto26dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "3427260"
  },
  {
    "name": "Matheus Álefe Bezerra Da Silva",
    "matricula": "2464120",
    "username": "msilva27dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2464120"
  },
  {
    "name": "Mayra Marielly Dos Santos Ferreira",
    "matricula": "4059430",
    "username": "mferreira28dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4059430"
  },
  {
    "name": "Natali Da Silva Correia",
    "matricula": "4059463",
    "username": "ncorreia29dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4059463"
  },
  {
    "name": "Paulo Roberto Mendes De Lima",
    "matricula": "4059426",
    "username": "plima30dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4059426"
  },
  {
    "name": "Sued Navarro Souza Dos Santos",
    "matricula": "3052756",
    "username": "ssantos31dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "3052756"
  },
  {
    "name": "Tarciana Valeria Da Silva",
    "matricula": "4059480",
    "username": "tsilva32dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "4059480"
  },
  {
    "name": "Vânia Francisca Do Nascimento",
    "matricula": "3694817",
    "username": "vnascimento33dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "3694817"
  },
  {
    "name": "Victor Hugo Ferreira Farias",
    "matricula": "2748211",
    "username": "vfarias34dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2748211"
  },
  {
    "name": "Waleria Cristina Virginia De Andrade",
    "matricula": "2900168",
    "username": "wandrade35dgmoda",
    "turma": "DG_MOD_A",
    "curso": "Design Gráfico",
    "pass": "2900168"
  },
  {
    "name": "Ana Paula Emídio",
    "matricula": "3898184",
    "username": "aemídio1dgmod3",
    "turma": "DG_MOD_3",
    "curso": "Design Gráfico",
    "pass": "3898184"
  },
  {
    "name": "Debora Lopes Pacheco De Medeiros",
    "matricula": "3320037",
    "username": "dmedeiros2dgmod3",
    "turma": "DG_MOD_3",
    "curso": "Design Gráfico",
    "pass": "3320037"
  },
  {
    "name": "Edja Eliza Rodrigues Dos Santos",
    "matricula": "3898213",
    "username": "esantos3dgmod3",
    "turma": "DG_MOD_3",
    "curso": "Design Gráfico",
    "pass": "3898213"
  },
  {
    "name": "Elda Maria Dos Santos",
    "matricula": "3898211",
    "username": "esantos4dgmod3",
    "turma": "DG_MOD_3",
    "curso": "Design Gráfico",
    "pass": "3898211"
  },
  {
    "name": "Estephane Clemente De Lima",
    "matricula": "3898196",
    "username": "elima5dgmod3",
    "turma": "DG_MOD_3",
    "curso": "Design Gráfico",
    "pass": "3898196"
  },
  {
    "name": "Gustavo Vieira Milei",
    "matricula": "2811353",
    "username": "gmilei6dgmod3",
    "turma": "DG_MOD_3",
    "curso": "Design Gráfico",
    "pass": "2811353"
  },
  {
    "name": "Karen Vitória Candido Da Silva",
    "matricula": "1032625",
    "username": "ksilva7dgmod3",
    "turma": "DG_MOD_3",
    "curso": "Design Gráfico",
    "pass": "1032625"
  },
  {
    "name": "Karolyne Sales Ramalho",
    "matricula": "2419726",
    "username": "kramalho8dgmod3",
    "turma": "DG_MOD_3",
    "curso": "Design Gráfico",
    "pass": "2419726"
  },
  {
    "name": "Lazaro Luiz Matias Vieira",
    "matricula": "2291753",
    "username": "lvieira9dgmod3",
    "turma": "DG_MOD_3",
    "curso": "Design Gráfico",
    "pass": "2291753"
  },
  {
    "name": "Lucas Felipe De Melo Ramos Silva",
    "matricula": "2537449",
    "username": "lsilva10dgmod3",
    "turma": "DG_MOD_3",
    "curso": "Design Gráfico",
    "pass": "2537449"
  },
  {
    "name": "Alexandra Dos Santos Pantazis",
    "matricula": "2246903",
    "username": "apantazis1dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2246903"
  },
  {
    "name": "Alice De Amorim Ferraz",
    "matricula": "4059427",
    "username": "aferraz2dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059427"
  },
  {
    "name": "Allyce Vitória Tavares De Albuquerque",
    "matricula": "3489716",
    "username": "aalbuquerque3dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3489716"
  },
  {
    "name": "Álvaro Miguel Santos Nunes",
    "matricula": "3474522",
    "username": "ánunes4dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3474522"
  },
  {
    "name": "Andre Da Silva Duraes",
    "matricula": "4059406",
    "username": "aduraes5dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059406"
  },
  {
    "name": "Andrea Cristina Pereira Camargo",
    "matricula": "4059471",
    "username": "acamargo6dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059471"
  },
  {
    "name": "Andreza Germana Da Silva",
    "matricula": "4059432",
    "username": "asilva7dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059432"
  },
  {
    "name": "Arthur Borges Ferreira",
    "matricula": "4059438",
    "username": "aferreira8dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059438"
  },
  {
    "name": "Arthur Leonardo Vieira Moraes Dos Santos",
    "matricula": "2434534",
    "username": "asantos9dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2434534"
  },
  {
    "name": "Ayran Gabriel Duque Souza Lima",
    "matricula": "4059462",
    "username": "alima10dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059462"
  },
  {
    "name": "Bennyson Xavier Da Silva",
    "matricula": "2445224",
    "username": "bsilva11dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2445224"
  },
  {
    "name": "Bruna Maria Do Nascimento Costa",
    "matricula": "4059441",
    "username": "bcosta12dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059441"
  },
  {
    "name": "Bruno Flaubert Silveira Dos Santos",
    "matricula": "4059402",
    "username": "bsantos13dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059402"
  },
  {
    "name": "Caio Ricardo De Lima Moraes",
    "matricula": "4059478",
    "username": "cmoraes14dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059478"
  },
  {
    "name": "Carlos Fernando Dos Santos Paes Neto",
    "matricula": "3378799",
    "username": "cneto15dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3378799"
  },
  {
    "name": "Cristofanis Francisco De Souza De Araujo",
    "matricula": "4059451",
    "username": "caraujo16dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059451"
  },
  {
    "name": "Daniel Jose Barroso Filho",
    "matricula": "4059464",
    "username": "dfilho17dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059464"
  },
  {
    "name": "Emilly Maria De Barros Agostinho",
    "matricula": "3361233",
    "username": "eagostinho18dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3361233"
  },
  {
    "name": "Erika Patricia Medeiros Da Silveira Lucindo",
    "matricula": "4059403",
    "username": "elucindo19dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059403"
  },
  {
    "name": "Ewerton Danilo Alves",
    "matricula": "4059455",
    "username": "ealves20dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059455"
  },
  {
    "name": "Fernando Verner De Lima Cabral Costa",
    "matricula": "4059408",
    "username": "fcosta21dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059408"
  },
  {
    "name": "Helia Luiza Vidal Marinho",
    "matricula": "4059405",
    "username": "hmarinho22dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059405"
  },
  {
    "name": "Hugo Henrique",
    "matricula": "4059434",
    "username": "hhenrique23dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059434"
  },
  {
    "name": "Ilka Kesia Pereira Lacerda Santos",
    "matricula": "4059485",
    "username": "isantos24dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059485"
  },
  {
    "name": "Jaqueline Dos Santos Andre Da Silva",
    "matricula": "4059476",
    "username": "jsilva25dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059476"
  },
  {
    "name": "João Gabriel Cavalcanti Chaves Loureiro",
    "matricula": "4059425",
    "username": "jloureiro26dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059425"
  },
  {
    "name": "João Guilherme Lira De Miranda",
    "matricula": "4059409",
    "username": "jmiranda27dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059409"
  },
  {
    "name": "João Pedro Rodrigues",
    "matricula": "4059417",
    "username": "jrodrigues28dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059417"
  },
  {
    "name": "João Pedro Xavier Gomes Costa",
    "matricula": "4059459",
    "username": "jcosta29dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059459"
  },
  {
    "name": "Júlia Beatriz Da Silva",
    "matricula": "4059431",
    "username": "jsilva30dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059431"
  },
  {
    "name": "Luiz Henrique Santos Silva",
    "matricula": "4059396",
    "username": "lsilva31dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059396"
  },
  {
    "name": "Marcos Paulo De Vasconcelos Nascimento",
    "matricula": "4059410",
    "username": "mnascimento32dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059410"
  },
  {
    "name": "Maria Luisa Rodrigues Souza",
    "matricula": "2554842",
    "username": "msouza33dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2554842"
  },
  {
    "name": "Maria Patricia Dos Santos",
    "matricula": "4059487",
    "username": "msantos34dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059487"
  },
  {
    "name": "Maria Zilda Ferreira Pinto",
    "matricula": "4059419",
    "username": "mpinto35dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059419"
  },
  {
    "name": "Mariana Monteiro Silva",
    "matricula": "4059439",
    "username": "msilva36dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059439"
  },
  {
    "name": "Matheus Eduardo Moura De Oliveira",
    "matricula": "4059477",
    "username": "moliveira37dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059477"
  },
  {
    "name": "Miguel Gonçalves Arcanjo",
    "matricula": "4059436",
    "username": "marcanjo38dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059436"
  },
  {
    "name": "Nathalia Kayanne De Souza Polito",
    "matricula": "4059404",
    "username": "npolito39dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059404"
  },
  {
    "name": "Nedison Manoel Dionísio",
    "matricula": "4059398",
    "username": "ndionísio40dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059398"
  },
  {
    "name": "Paloma Borges De Freitas",
    "matricula": "4059473",
    "username": "pfreitas41dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059473"
  },
  {
    "name": "Pedro Henrique De Melo Albuquerque",
    "matricula": "4059450",
    "username": "palbuquerque42dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059450"
  },
  {
    "name": "Rafael Vitor Coutinho De Oliveira",
    "matricula": "4059440",
    "username": "roliveira43dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059440"
  },
  {
    "name": "Suammyr Cavalcante Do Carmo",
    "matricula": "4059422",
    "username": "scarmo44dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059422"
  },
  {
    "name": "Tácio Araújo Lopes De Amorim",
    "matricula": "4059465",
    "username": "tamorim45dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059465"
  },
  {
    "name": "Thallys Vinicius Lopes Da Rocha",
    "matricula": "4059446",
    "username": "trocha46dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059446"
  },
  {
    "name": "Yasmin Lauryn Francine De Souza Silva",
    "matricula": "4059433",
    "username": "ysilva47dsmod1a",
    "turma": "DS_MOD1_A",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4059433"
  },
  {
    "name": "Elizabete Paixao Pedro Diniz",
    "matricula": "4067248",
    "username": "ediniz1dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4067248"
  },
  {
    "name": "Estefhany Dos Santos Valentim",
    "matricula": "1359130",
    "username": "evalentim2dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "1359130"
  },
  {
    "name": "Felipe Santos De Melo",
    "matricula": "2384024",
    "username": "fmelo3dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2384024"
  },
  {
    "name": "Gabriel Davy Verçosa De Andrade",
    "matricula": "2592791",
    "username": "gandrade4dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2592791"
  },
  {
    "name": "Gian Thiago Sousa Ferreira",
    "matricula": "4067249",
    "username": "gferreira5dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4067249"
  },
  {
    "name": "Igor Neto De Oliveira",
    "matricula": "2058773",
    "username": "ioliveira6dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2058773"
  },
  {
    "name": "Iran Barboza Carneiro",
    "matricula": "4067250",
    "username": "icarneiro7dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4067250"
  },
  {
    "name": "Jadilson Francisco Silva Dos Santos",
    "matricula": "893665",
    "username": "jsantos8dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "893665"
  },
  {
    "name": "Janaina Maria Dos Santos",
    "matricula": "2098997",
    "username": "jsantos9dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2098997"
  },
  {
    "name": "Jefesson Correia Dos Santos",
    "matricula": "2238477",
    "username": "jsantos10dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2238477"
  },
  {
    "name": "Jessica Rodrigues De Lima",
    "matricula": "4067253",
    "username": "jlima11dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4067253"
  },
  {
    "name": "Jose Augusto Dos Santos",
    "matricula": "1741329",
    "username": "jsantos12dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "1741329"
  },
  {
    "name": "Júlia De Sousa Firmino",
    "matricula": "3361829",
    "username": "jfirmino13dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3361829"
  },
  {
    "name": "Karla Beatriz De Souza",
    "matricula": "3281050",
    "username": "ksouza14dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3281050"
  },
  {
    "name": "Lethicia De Albuquerque Rodrigues",
    "matricula": "1495073",
    "username": "lrodrigues15dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "1495073"
  },
  {
    "name": "Luan Victor Targino Dos Santos",
    "matricula": "3394164",
    "username": "lsantos16dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3394164"
  },
  {
    "name": "Lucas Lima Da Silva",
    "matricula": "2082953",
    "username": "lsilva17dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2082953"
  },
  {
    "name": "Lucas Luiz Nery De Almeida",
    "matricula": "3167311",
    "username": "lalmeida18dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3167311"
  },
  {
    "name": "Luiz Miguel Lima De Albuquerque",
    "matricula": "3233025",
    "username": "lalbuquerque19dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3233025"
  },
  {
    "name": "Marcia Helena Bemvindo De Farias",
    "matricula": "4067255",
    "username": "mfarias20dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4067255"
  },
  {
    "name": "Marco Antônio Aguiar Mendes",
    "matricula": "2909850",
    "username": "mmendes21dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2909850"
  },
  {
    "name": "Maria Luiza Bezerra De Barros",
    "matricula": "2259350",
    "username": "mbarros22dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2259350"
  },
  {
    "name": "Michele Karine Barreto",
    "matricula": "3279875",
    "username": "mbarreto23dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3279875"
  },
  {
    "name": "Milena Da Silva Lima",
    "matricula": "1722283",
    "username": "mlima24dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "1722283"
  },
  {
    "name": "Millena Maria Dos Santos",
    "matricula": "693976",
    "username": "msantos25dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "693976"
  },
  {
    "name": "Pâmela Rodrigues Pereira",
    "matricula": "3360791",
    "username": "ppereira26dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3360791"
  },
  {
    "name": "Paulo Henrique Ferreira Gonçalves",
    "matricula": "4067262",
    "username": "pgonçalves27dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4067262"
  },
  {
    "name": "Paulo Mariano Do Nascimento",
    "matricula": "4067260",
    "username": "pnascimento28dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4067260"
  },
  {
    "name": "Paulo William Barbosa De Franca",
    "matricula": "1536925",
    "username": "pfranca29dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "1536925"
  },
  {
    "name": "Pedro Oliveira Vasconcelos Lins",
    "matricula": "3407695",
    "username": "plins30dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3407695"
  },
  {
    "name": "Pedro Victor Andrade Palmeira",
    "matricula": "3371939",
    "username": "ppalmeira31dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3371939"
  },
  {
    "name": "Rayane Vitória Lima Da Silva",
    "matricula": "3240130",
    "username": "rsilva32dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3240130"
  },
  {
    "name": "Ronaldo Robério Dionizio Da Silva",
    "matricula": "4067257",
    "username": "rsilva33dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4067257"
  },
  {
    "name": "Ruan Gabriel Borges Diniz",
    "matricula": "3369427",
    "username": "rdiniz34dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3369427"
  },
  {
    "name": "Ryan Diego Alves De Albuquerque",
    "matricula": "2790020",
    "username": "ralbuquerque35dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2790020"
  },
  {
    "name": "Silvio Salomão Patriota De Andrade",
    "matricula": "3399252",
    "username": "sandrade36dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3399252"
  },
  {
    "name": "Stefania Silva De Melo",
    "matricula": "2006940",
    "username": "smelo37dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2006940"
  },
  {
    "name": "Tamires Santos",
    "matricula": "314518",
    "username": "tsantos38dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "314518"
  },
  {
    "name": "Tarciano Paulo Da Silva",
    "matricula": "2025125",
    "username": "tsilva39dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2025125"
  },
  {
    "name": "Thiago Henrique Santos De Moura",
    "matricula": "2054304",
    "username": "tmoura40dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2054304"
  },
  {
    "name": "Vinícius Hermann Cordeiro De França",
    "matricula": "4067256",
    "username": "vfrança41dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "4067256"
  },
  {
    "name": "Vitória Maria Da Silva",
    "matricula": "534285",
    "username": "vsilva42dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "534285"
  },
  {
    "name": "Wandeson Batista Tavares",
    "matricula": "836410",
    "username": "wtavares43dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "836410"
  },
  {
    "name": "Wellington Alves De Melo Junior",
    "matricula": "514152",
    "username": "wjunior44dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "514152"
  },
  {
    "name": "Yuri Silvano Da Silva Santana",
    "matricula": "2930663",
    "username": "ysantana45dsmod1b",
    "turma": "DS_MOD1_B",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2930663"
  },
  {
    "name": "Airton Lopo De Siqueira",
    "matricula": "2277461",
    "username": "asiqueira1dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2277461"
  },
  {
    "name": "Caio De Andrade Amaral",
    "matricula": "3898212",
    "username": "camaral2dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3898212"
  },
  {
    "name": "Cybele Costa Silva",
    "matricula": "3098701",
    "username": "csilva3dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3098701"
  },
  {
    "name": "Davi Valeriano Silva",
    "matricula": "2502044",
    "username": "dsilva4dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2502044"
  },
  {
    "name": "Emanoel Bruno Da Rocha",
    "matricula": "2197766",
    "username": "erocha5dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2197766"
  },
  {
    "name": "Fagner Xavier Duarte Coutinho",
    "matricula": "3898220",
    "username": "fcoutinho6dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3898220"
  },
  {
    "name": "Flavia Regina Ulisses Da Silva",
    "matricula": "3898169",
    "username": "fsilva7dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3898169"
  },
  {
    "name": "Guilherme Ghabriell Clemente Da Silva",
    "matricula": "3262782",
    "username": "gsilva8dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3262782"
  },
  {
    "name": "Israel Jose Da Paz",
    "matricula": "3898167",
    "username": "ipaz9dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3898167"
  },
  {
    "name": "Larissa Paiva Dos Santos",
    "matricula": "3269492",
    "username": "lsantos10dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3269492"
  },
  {
    "name": "Levi De Oliveira Filho",
    "matricula": "3898176",
    "username": "lfilho11dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3898176"
  },
  {
    "name": "Magali Maria De Franca Lins",
    "matricula": "3898241",
    "username": "mlins12dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3898241"
  },
  {
    "name": "Petyson Cauan Lelis Da Rocha",
    "matricula": "3247138",
    "username": "procha13dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3247138"
  },
  {
    "name": "Roberta Maria Pereira Da Silva",
    "matricula": "3547282",
    "username": "rsilva14dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3547282"
  },
  {
    "name": "Thalison Felipe Barbosa Da Silva",
    "matricula": "2255968",
    "username": "tsilva15dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "2255968"
  },
  {
    "name": "Valter Santos Araujo",
    "matricula": "1929760",
    "username": "varaujo16dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "1929760"
  },
  {
    "name": "Vinicius Adorno Morais",
    "matricula": "3898243",
    "username": "vmorais17dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3898243"
  },
  {
    "name": "Wallace Cezar Gomes Da Silva",
    "matricula": "3236420",
    "username": "wsilva18dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3236420"
  },
  {
    "name": "William José Mendes Da Silva",
    "matricula": "1272018",
    "username": "wsilva19dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "1272018"
  },
  {
    "name": "Yuri Wesley Dias De Morais",
    "matricula": "3898236",
    "username": "ymorais20dsmod3",
    "turma": "DS_MOD3",
    "curso": "Desenvolvimento de Sistemas",
    "pass": "3898236"
  }
]

async function importar() {
  console.log(`\n🌱 Importando ${ALUNOS.length} alunos...\n`)
  
  const turmasCount = {}
  let ok = 0, skip = 0

  for (const alu of ALUNOS) {
    const q = query(collection(db, 'students'), where('matricula', '==', alu.matricula))
    const snap = await getDocs(q)
    if (!snap.empty) {
      skip++; continue
    }
    const id = 'stu-' + uid()
    await setDoc(doc(db, 'students', id), {
      ...alu,
      role: 'student',
      firstAccess: true,
      createdAt: new Date().toISOString(),
    })
    turmasCount[alu.turma] = (turmasCount[alu.turma] || 0) + 1
    console.log(`  ✓ [${alu.turma}] ${alu.name} (@${alu.username})`)
    ok++
  }

  console.log('\n✅ Concluído!')
  console.log(`   ${ok} importados, ${skip} já existiam`)
  console.log('\nPor turma:')
  Object.entries(turmasCount).forEach(([t,c]) => console.log(`   ${t}: ${c} alunos`))
  console.log('\n   Senha inicial = matrícula de cada aluno')
  console.log('   Primeiro acesso: serão solicitados a trocar a senha')
  process.exit(0)
}

importar().catch(err => { console.error('❌', err.message); process.exit(1) })

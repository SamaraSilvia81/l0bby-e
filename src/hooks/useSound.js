// ─────────────────────────────────────────────
//  L0bby-E — useSound (Web Audio API)
//  Sons sintetizados, zero assets externos
// ─────────────────────────────────────────────

let ctx = null
const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

const play = (type) => {
  try {
    const ac = getCtx()
    if (ac.state === 'suspended') ac.resume()

    const o = ac.createOscillator()
    const g = ac.createGain()
    o.connect(g)
    g.connect(ac.destination)

    const now = ac.currentTime

    switch (type) {
      case 'click': {
        o.type = 'square'
        o.frequency.setValueAtTime(880, now)
        o.frequency.exponentialRampToValueAtTime(440, now + 0.04)
        g.gain.setValueAtTime(0.08, now)
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
        o.start(now); o.stop(now + 0.06)
        break
      }
      case 'hover': {
        o.type = 'sine'
        o.frequency.setValueAtTime(1200, now)
        g.gain.setValueAtTime(0.03, now)
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
        o.start(now); o.stop(now + 0.04)
        break
      }
      case 'success': {
        // acorde ascendente
        const freqs = [523, 659, 784]
        freqs.forEach((f, i) => {
          const osc = ac.createOscillator()
          const gain = ac.createGain()
          osc.connect(gain); gain.connect(ac.destination)
          osc.type = 'sine'
          osc.frequency.setValueAtTime(f, now + i * 0.07)
          gain.gain.setValueAtTime(0, now + i * 0.07)
          gain.gain.linearRampToValueAtTime(0.1, now + i * 0.07 + 0.02)
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.18)
          osc.start(now + i * 0.07)
          osc.stop(now + i * 0.07 + 0.2)
        })
        return
      }
      case 'error': {
        o.type = 'sawtooth'
        o.frequency.setValueAtTime(220, now)
        o.frequency.exponentialRampToValueAtTime(110, now + 0.15)
        g.gain.setValueAtTime(0.1, now)
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
        o.start(now); o.stop(now + 0.18)
        break
      }
      case 'enroll': {
        // dois tons rápidos — confirmação
        const freqs2 = [660, 880]
        freqs2.forEach((f, i) => {
          const osc = ac.createOscillator()
          const gain = ac.createGain()
          osc.connect(gain); gain.connect(ac.destination)
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(f, now + i * 0.08)
          gain.gain.setValueAtTime(0.09, now + i * 0.08)
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.12)
          osc.start(now + i * 0.08)
          osc.stop(now + i * 0.08 + 0.15)
        })
        return
      }
      case 'cert': {
        // sweep ascendente — conquista
        o.type = 'sine'
        o.frequency.setValueAtTime(400, now)
        o.frequency.exponentialRampToValueAtTime(1200, now + 0.3)
        g.gain.setValueAtTime(0.12, now)
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
        o.start(now); o.stop(now + 0.35)
        break
      }
      case 'nav': {
        o.type = 'sine'
        o.frequency.setValueAtTime(600, now)
        o.frequency.exponentialRampToValueAtTime(800, now + 0.05)
        g.gain.setValueAtTime(0.05, now)
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.07)
        o.start(now); o.stop(now + 0.07)
        break
      }
      default: break
    }

    o.start && o.start(now)
    o.stop && o.stop(now + 0.1)
  } catch (e) {
    // silencia erros de AudioContext (ex: autoplay policy)
  }
}

export const useSound = () => ({ play })

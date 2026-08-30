import { useState, useRef } from 'react'
import * as Tone from 'tone'

function MusicControl() {
  const [playing, setPlaying] = useState(false)
  const synthRef = useRef(null)
  const loopRef = useRef(null)

  const toggleMusic = async () => {
    if (!playing) {
      await Tone.start()
      if (!synthRef.current) {
        synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination()
        synthRef.current.volume.value = -15
      }

      const melody = [
        { note: 'C4', time: '0:0' }, { note: 'E4', time: '0:1' }, { note: 'G4', time: '0:2' }, { note: 'C5', time: '0:3' },
        { note: 'G4', time: '1:0' }, { note: 'E4', time: '1:1' }, { note: 'C4', time: '1:2' }, { note: 'G3', time: '1:3' },
        { note: 'F4', time: '2:0' }, { note: 'A4', time: '2:1' }, { note: 'C5', time: '2:2' }, { note: 'F5', time: '2:3' },
        { note: 'C5', time: '3:0' }, { note: 'A4', time: '3:1' }, { note: 'F4', time: '3:2' }, { note: 'C4', time: '3:3' },
      ]

      const part = new Tone.Part((time, value) => {
        synthRef.current.triggerAttackRelease(value.note, '8n', time)
      }, melody)

      part.loop = true
      part.loopEnd = '4m'
      part.start(0)
      Tone.Transport.bpm.value = 100
      Tone.Transport.start()
      loopRef.current = part
      setPlaying(true)
    } else {
      Tone.Transport.stop()
      loopRef.current?.stop()
      setPlaying(false)
    }
  }

  return (
    <button className={`music-control ${playing ? 'playing' : ''}`} onClick={toggleMusic} title={playing ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}>
      {playing ? '🔊' : '🔇'}
    </button>
  )
}

export default MusicControl

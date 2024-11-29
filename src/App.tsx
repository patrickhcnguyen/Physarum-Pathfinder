import { useEffect, useRef, useState } from 'react'
import ControlPanel from './components/ControlPanel'
import './App.css'

interface Particle {
  x: number
  y: number
  angle: number
  speed: number
  color: string
}

interface Config {
  width: number
  height: number
  particleCount: number
  sensorAngle: number
  sensorDistance: number
  depositAmount: number
  evaporationRate: number
  diffusionRate: number
  resolution: number
  color: string
}

interface SimulationState {
  particles: Particle[]
  trailGrid: number[][]
  time: number
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const simStateRef = useRef<SimulationState | null>(null)
  const animationFrameRef = useRef<number>()
  
  const [config, setConfig] = useState<Config>({
    width: window.innerWidth,
    height: window.innerHeight,
    particleCount: 3000,
    sensorAngle: Math.PI / 4,
    sensorDistance: 15,
    depositAmount: 40,
    evaporationRate: 0.002,
    diffusionRate: 0.1,
    resolution: 1,
    color: '#ffffff'
  })

  const [showPanel, setShowPanel] = useState(true)  

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    canvas.width = config.width / config.resolution
    canvas.height = config.height / config.resolution
    canvas.style.width = `${config.width}px`
    canvas.style.height = `${config.height}px`

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 100

    // Reinitialize simulation state
    simStateRef.current = {
      particles: Array.from({ length: config.particleCount }, () => {
        return {
          x: centerX + (Math.random() - 0.5) * radius * 2,
          y: centerY + (Math.random() - 0.5) * radius * 2,
          angle: Math.random() * 2 * Math.PI,
          speed: 2 + Math.random() * 2,
          color: `rgba(255, 255, 255, 0.8)`,
        }
      }),
      trailGrid: Array(canvas.height).fill(0).map(() => Array(canvas.width).fill(0)),
      time: 0
    }

    const moveCenter = () => {
      if (!simStateRef.current) return { x: centerX, y: centerY }
      simStateRef.current.time += 0.01
      const newCenterX = centerX + Math.sin(simStateRef.current.time) * 200
      const newCenterY = centerY + Math.cos(simStateRef.current.time * 0.5) * 150
      return { x: newCenterX, y: newCenterY }
    }

    const sense = (particle: Particle, angleOffset: number): number => {
      if (!simStateRef.current) return 0
      const sensorAngle = particle.angle + angleOffset
      const sensorX = particle.x + Math.cos(sensorAngle) * config.sensorDistance
      const sensorY = particle.y + Math.sin(sensorAngle) * config.sensorDistance

      const gridX = Math.floor(sensorX)
      const gridY = Math.floor(sensorY)

      if (gridX >= 0 && gridX < canvas.width && gridY >= 0 && gridY < canvas.height) {
        return simStateRef.current.trailGrid[gridY][gridX]
      }
      return 0
    }

    const simulate = (): void => {
      if (!simStateRef.current || !ctx) return

      const { particles, trailGrid } = simStateRef.current
      const center = moveCenter()

      // Shuffle particles before processing
      shuffleArray(particles)

      particles.forEach((particle) => {
        const dx = center.x - particle.x
        const dy = center.y - particle.y
        const distToCenter = Math.sqrt(dx * dx + dy * dy)
        
        if (distToCenter > 100) {
          if (Math.random() < 0.05) {
            particle.angle = Math.atan2(dy, dx) + Math.PI + (Math.random() - 0.5) * 2.0
            particle.speed = 3 + Math.random() * 2
          }
        }

        const leftSensor = sense(particle, -config.sensorAngle)
        const frontSensor = sense(particle, 0)
        const rightSensor = sense(particle, config.sensorAngle)

        if (frontSensor > leftSensor && frontSensor > rightSensor) {
          particle.angle += (Math.random() - 0.5) * 0.3
        } else if (leftSensor > rightSensor) {
          particle.angle -= Math.random() * 0.8
        } else if (rightSensor > leftSensor) {
          particle.angle += Math.random() * 0.8
        }

        particle.speed = 2 + (Math.max(leftSensor, frontSensor, rightSensor) / 255) * 3
        if (distToCenter > 150) {
          particle.speed += 0.5 + Math.random()
        }

        particle.x += Math.cos(particle.angle) * particle.speed
        particle.y += Math.sin(particle.angle) * particle.speed

        particle.x = (particle.x + canvas.width) % canvas.width
        particle.y = (particle.y + canvas.height) % canvas.height

        const gridX = Math.floor(particle.x)
        const gridY = Math.floor(particle.y)
        if (gridX >= 0 && gridX < canvas.width && gridY >= 0 && gridY < canvas.height) {
          trailGrid[gridY][gridX] += config.depositAmount
        }
      })

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const r = parseInt(config.color.slice(1, 3), 16)
      const g = parseInt(config.color.slice(3, 5), 16)
      const b = parseInt(config.color.slice(5, 7), 16)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          if (trailGrid[y][x] > 0) {
            trailGrid[y][x] *= 1 - config.evaporationRate
            const index = (y * canvas.width + x) * 4
            const intensity = Math.min(255, trailGrid[y][x] * 1.5)
            data[index] = (r * intensity) / 255
            data[index + 1] = (g * intensity) / 255
            data[index + 2] = (b * intensity) / 255
            data[index + 3] = 255
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0)
      animationFrameRef.current = requestAnimationFrame(simulate)
    }

    animationFrameRef.current = requestAnimationFrame(simulate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [config]) 

  return (
    <div className="App">
      <canvas 
        ref={canvasRef} 
        style={{ background: 'black' }}
      />
      <button 
        className="panel-toggle"
        onClick={() => setShowPanel(!showPanel)}
        style={{
          position: 'fixed',
          top: '10px',
          right: showPanel ? '310px' : '10px',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          border: '1px solid white',
          padding: '8px 12px',
          cursor: 'pointer'
        }}
      >
        {showPanel ? '→' : '←'}
      </button>
      {showPanel && <ControlPanel config={config} setConfig={setConfig} />}
    </div>
  )
}

export default App

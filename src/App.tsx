import { useEffect, useRef } from 'react'
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
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const config: Config = {
    width: window.innerWidth,
    height: window.innerHeight,
    particleCount: 5000,
    sensorAngle: Math.PI / 4,
    sensorDistance: 15,
    depositAmount: 30,
    evaporationRate: 0.003,
    diffusionRate: 0.1
  }

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // Set canvas size
    canvas.width = config.width
    canvas.height = config.height

    // Initialize particles with colors
    let particles: Particle[] = Array.from({ length: config.particleCount }, () => ({
      x: Math.random() * config.width,
      y: Math.random() * config.height,
      angle: Math.random() * 2 * Math.PI,
      speed: 2 + Math.random() * 2,
      color: `rgba(255, 255, 255, 0.8)`
    }))

    // Create trail grid
    let trailGrid: number[][] = Array(config.height).fill(0).map(() => 
      Array(config.width).fill(0)
    )

    const sense = (particle: Particle, angleOffset: number): number => {
      const sensorAngle = particle.angle + angleOffset
      const sensorX = particle.x + Math.cos(sensorAngle) * config.sensorDistance
      const sensorY = particle.y + Math.sin(sensorAngle) * config.sensorDistance
      
      const gridX = Math.floor(sensorX)
      const gridY = Math.floor(sensorY)
      
      if (gridX >= 0 && gridX < config.width && gridY >= 0 && gridY < config.height) {
        return trailGrid[gridY][gridX]
      }
      return 0
    }

    const diffuseAndEvaporate = (): void => {
      for (let y = 0; y < config.height; y++) {
        for (let x = 0; x < config.width; x++) {
          trailGrid[y][x] *= (1 - config.evaporationRate)
        }
      }
    }

    const updateVisualization = (): void => {
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, config.width, config.height)

      // Draw trails
      const imageData = ctx.getImageData(0, 0, config.width, config.height)
      const data = imageData.data

      for (let y = 0; y < config.height; y++) {
        for (let x = 0; x < config.width; x++) {
          if (trailGrid[y][x] > 0) {
            const index = (y * config.width + x) * 4
            const value = Math.min(255, trailGrid[y][x])
            data[index] = value     // R
            data[index + 1] = value // G
            data[index + 2] = value // B
            data[index + 3] = 255   // A
          }
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }

    const simulate = (): void => {
      particles.forEach(particle => {
        const leftSensor = sense(particle, -config.sensorAngle)
        const frontSensor = sense(particle, 0)
        const rightSensor = sense(particle, config.sensorAngle)

        if (frontSensor > leftSensor && frontSensor > rightSensor) {
          particle.angle += (Math.random() - 0.5) * 0.2
        } else if (leftSensor > rightSensor) {
          particle.angle -= Math.random() * 0.8
        } else if (rightSensor > leftSensor) {
          particle.angle += Math.random() * 0.8
        } else {
          particle.angle += (Math.random() - 0.5) * 0.4
        }

        // Update speed based on sensors
        const signalStrength = Math.max(leftSensor, frontSensor, rightSensor)
        particle.speed = 2 + (signalStrength / 255) * 2

        particle.x += Math.cos(particle.angle) * particle.speed
        particle.y += Math.sin(particle.angle) * particle.speed

        particle.x = (particle.x + config.width) % config.width
        particle.y = (particle.y + config.height) % config.height

        const gridX = Math.floor(particle.x)
        const gridY = Math.floor(particle.y)
        if (gridX >= 0 && gridX < config.width && gridY >= 0 && gridY < config.height) {
          trailGrid[gridY][gridX] += config.depositAmount
        }
      })

      updateVisualization()
      diffuseAndEvaporate()

      requestAnimationFrame(simulate)
    }

    const animationFrame = requestAnimationFrame(simulate)

    return () => cancelAnimationFrame(animationFrame)
  }, [])

  return (
    <div className="App">
      <canvas ref={canvasRef} style={{ background: 'black' }}></canvas>
    </div>
  )
}

export default App

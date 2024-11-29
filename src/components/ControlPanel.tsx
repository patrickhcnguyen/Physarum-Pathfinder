import React from 'react'
import './ControlPanel.css'

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
  xMultiplier: number
  yMultiplier: number
}

interface ControlPanelProps {
  config: Config
  setConfig: (config: Config) => void
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig }) => {
  const handleChange = (key: keyof Config, value: number | string) => {
    setConfig({ ...config, [key]: value })
  }

  return (
    <div className="control-panel">
      <h3>Slime Mold Controls</h3>
      
      <div className="control-group">
        <label>Particle Count</label>
        <input 
          type="range" 
          min="1000" 
          max="10000" 
          value={config.particleCount}
          onChange={(e) => handleChange('particleCount', parseInt(e.target.value))}
        />
        <span>{config.particleCount}</span>
      </div>

      <div className="control-group">
        <label>Sensor Angle</label>
        <input 
          type="range" 
          min="0" 
          max={Math.PI} 
          step="0.1"
          value={config.sensorAngle}
          onChange={(e) => handleChange('sensorAngle', parseFloat(e.target.value))}
        />
        <span>{config.sensorAngle.toFixed(2)}</span>
      </div>

      <div className="control-group">
        <label>Sensor Distance</label>
        <input 
          type="range" 
          min="5" 
          max="30"
          value={config.sensorDistance}
          onChange={(e) => handleChange('sensorDistance', parseInt(e.target.value))}
        />
        <span>{config.sensorDistance}</span>
      </div>

      <div className="control-group">
        <label>Deposit Amount</label>
        <input 
          type="range" 
          min="10" 
          max="100"
          value={config.depositAmount}
          onChange={(e) => handleChange('depositAmount', parseInt(e.target.value))}
        />
        <span>{config.depositAmount}</span>
      </div>

      <div className="control-group">
        <label>Evaporation Rate</label>
        <input 
          type="range" 
          min="0.001" 
          max="0.01" 
          step="0.001"
          value={config.evaporationRate}
          onChange={(e) => handleChange('evaporationRate', parseFloat(e.target.value))}
        />
        <span>{config.evaporationRate.toFixed(4)}</span>
      </div>

      <div className="control-group">
        <label>X Multiplier</label>
        <input 
            type="range" 
            min="1" 
            max="20" 
            value={config.xMultiplier}
            onChange={(e) => handleChange('xMultiplier', parseFloat(e.target.value))}
        />
        <span>{config.xMultiplier}</span>
        </div>

        <div className="control-group">
        <label>Y Multiplier</label>
        <input 
            type="range" 
            min="1" 
            max="20" 
            value={config.yMultiplier}
            onChange={(e) => handleChange('yMultiplier', parseFloat(e.target.value))}
        />
        <span>{config.yMultiplier}</span>
        </div>

      <div className="control-group">
        <label>Color</label>
        <input 
          type="color" 
          value={config.color}
          onChange={(e) => handleChange('color', e.target.value)}
        />
      </div>
    </div>
  )

  
}

export default ControlPanel 
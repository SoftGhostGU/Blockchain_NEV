import { View, Text } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import './VehicleDetailModal.scss'
import CarBodyIcon from '../pages/order/icons/CarBodyIcon'
import TirePressureIcon from '../pages/order/icons/TirePressureIcon'
import BrakeSystemIcon from '../pages/order/icons/BrakeSystemIcon'
import PowerSystemIcon from '../pages/order/icons/PowerSystemIcon'

interface VehicleDetailModalProps {
  visible: boolean
  onClose: () => void
}

export default function VehicleDetailModal({ visible, onClose }: VehicleDetailModalProps) {
  if (!visible) return null

  // 车辆状态数据
  const vehicleData = {
    battery: 85,
    range: 350,
    systems: [
      { name: '车身状态', status: 'normal', icon: 'car-body' },
      { name: '轮胎气压', status: 'normal', icon: 'tire-pressure' },
      { name: '制动系统', status: 'warning', icon: 'brake-system' },
      { name: '动力系统', status: 'danger', icon: 'power-system' }
    ]
  }

  // 计算圆圈进度
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (vehicleData.battery / 100) * circumference

  // 根据续航公里数返回颜色
  const getRangeColor = (range: number) => {
    if (range >= 100) return '#4CAF50' // 绿色
    if (range >= 50) return '#FF9800'  // 黄色
    return '#F44336' // 红色
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#4CAF50'
      case 'warning': return '#FF9800'
      case 'danger': return '#F44336'
      default: return '#999'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return '正常'
      case 'warning': return '注意'
      case 'danger': return '危险'
      default: return '未知'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return 'check-circle'
      case 'warning': return 'alert-circle'
      case 'danger': return 'close-circle'
      default: return 'help-circle'
    }
  }

  return (
    <View className='vehicle-detail-modal'>
      <View className='modal-overlay' onClick={onClose} />
      <View className='modal-content'>
        {/* 头部 */}
        <View className='modal-header'>
          <View className='back-button' onClick={onClose}>
            <AtIcon value='chevron-left' size='24' />
          </View>
          <Text className='modal-title'>车况信息</Text>
        </View>

        {/* 电量和续航信息 */}
        <View className='battery-section'>
          <View className='info-headers'>
            <View className='battery-info'>
              <View className='battery-icon'>
                <AtIcon value='lightning' size='20' />
              </View>
              <Text className='battery-label'>电量</Text>
            </View>
            <View className='range-info-header'>
              <Text className='range-label'>预计续航</Text>
              <Text 
                className='range-value-header' 
                style={{ color: getRangeColor(vehicleData.range) }}
              >
                {vehicleData.range}km
              </Text>
            </View>
          </View>
          
          <View className='battery-content'>
            <View className='battery-circle'>
              <View className='circle-container'>
                <svg className='progress-ring' width='100' height='100' viewBox='0 0 100 100'>
                  <circle
                    className='progress-ring-background'
                    stroke='#E8F0FE'
                    strokeWidth='8'
                    fill='transparent'
                    r='42'
                    cx='50'
                    cy='50'
                  />
                  <circle
                    className='progress-ring-progress'
                    stroke='url(#batteryGradient)'
                    strokeWidth='8'
                    fill='transparent'
                    r={radius}
                    cx='50'
                    cy='50'
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap='round'
                  />
                  <defs>
                    <linearGradient id='batteryGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
                      <stop offset='0%' stopColor='#4CAF50' />
                      <stop offset='100%' stopColor='#2196F3' />
                    </linearGradient>
                  </defs>
                </svg>
                <View className='battery-percentage'>
                  <Text className='percentage-text'>{vehicleData.battery}%</Text>
                </View>
              </View>
            </View>

            <View className='range-info'>
            {/* 续航数值已移至标题下方 */}
          </View>
          </View>
        </View>

        {/* 系统状态 */}
        <View className='systems-section'>
          {vehicleData.systems.map((system, index) => (
            <View key={index} className='system-item'>
              <View className='system-info'>
                {system.icon === 'car-body' ? (
                  <CarBodyIcon size={20} className='system-icon' />
                ) : system.icon === 'tire-pressure' ? (
                  <TirePressureIcon size={20} className='system-icon' />
                ) : system.icon === 'brake-system' ? (
                  <BrakeSystemIcon size={20} className='system-icon' />
                ) : system.icon === 'power-system' ? (
                  <PowerSystemIcon size={20} className='system-icon' />
                ) : (
                  <AtIcon value={system.icon} size='20' className='system-icon' />
                )}
                <Text className='system-name'>{system.name}</Text>
              </View>
              <View className='system-status' style={{ color: getStatusColor(system.status) }}>
                <Text className='status-text'>{getStatusText(system.status)}</Text>
                <AtIcon 
                  value={getStatusIcon(system.status)} 
                  size='16' 
                  style={{ color: getStatusColor(system.status) }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
// src/pages/ride/index.tsx  
import { View, Text, Image, Button, Input } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
import { useLoad, showToast, showLoading, hideLoading, navigateTo, showModal } from '@tarojs/taro'
import { AtIcon, AtActionSheet, AtActionSheetItem } from 'taro-ui'
import classnames from 'classnames'
import './index.scss'

import EconomyIcon from './icons/EconomyIcon'
import ComfortIcon from './icons/ComfortIcon'
import LuxuryIcon from './icons/LuxuryIcon'
import QuietIcon from './icons/QuietIcon'
import FastIcon from './icons/FastIcon'
import SlowIcon from './icons/SlowIcon'

import rideService from '../../api/rideService'
import { Location, PriceEstimateRequest, CreateOrderRequest } from '../../api/type'
import Fab from '../../components/Fab'
import Map from '../../components/Map'

// 全局 store（确保路径和文件名和你项目一致： src/store/ride.js 或 src/store/rideStore.js）
import { useRideStore } from '../../store/ride'
// ---------- 导入模拟订单数据 ----------
import { getMockDataByCarType, getMockOrderVariants } from './mockOrderData'

export default function Ride() {
  // ----- 从 store 选取需要的业务字段 -----
  const currentLocation = useRideStore((s) => s.currentLocation)
  const destinationLocation = useRideStore((s) => s.destinationLocation)
  const selectedCarType = useRideStore((s) => s.selectedCarType)
  const travelPreference = useRideStore((s) => s.travelPreference)
  const selectedTimeOption = useRideStore((s) => s.selectedTimeOption)
  const startAddressInput = useRideStore((s) => s.startAddressInput)
  const endAddressInput = useRideStore((s) => s.endAddressInput)

  // ----- 从 store 获取操作函数 -----
  const setCurrentLocation = useRideStore((s) => s.setCurrentLocation)
  const setDestinationLocation = useRideStore((s) => s.setDestinationLocation)
  const setSelectedCarType = useRideStore((s) => s.setSelectedCarType)
  const setTravelPreference = useRideStore((s) => s.setTravelPreference)
  const setSelectedTimeOption = useRideStore((s) => s.setSelectedTimeOption)
  const setStartAddressInput = useRideStore((s) => s.setStartAddressInput)
  const setEndAddressInput = useRideStore((s) => s.setEndAddressInput)

  // 订单相关 store 操作
  const addLocalOrder = useRideStore((s) => s.addLocalOrder)
  const replaceOrder = useRideStore((s) => s.replaceOrder)
  const updateOrder = useRideStore((s) => s.updateOrder)

  // ---------- 页面本地 UI 状态（保留本地管理） ----------
  const [pageLoaded, setPageLoaded] = useState(false)
  const [elementsLoaded, setElementsLoaded] = useState({
    map: false,
    address: false,
    carTypes: false,
    price: false
  })
  const [priceData, setPriceData] = useState<any>(null)
  const [isPriceLoading, setIsPriceLoading] = useState(false)
  const [isOrderCreating, setIsOrderCreating] = useState(false)
  const [lastPriceUpdate, setLastPriceUpdate] = useState('')

  const [isActionSheetOpened, setIsActionSheetOpened] = useState(false)
  const [showPreferencePopup, setShowPreferencePopup] = useState(false)
  const [showTimePopup, setShowTimePopup] = useState(false)
  
  // 地图展开状态管理
  const [isMapExpanded, setIsMapExpanded] = useState(false)

  useLoad(() => {
    // 清空上次的目的地输入
    setDestinationLocation(null)
    setEndAddressInput('')
    
    // 页面分阶段动画
    setTimeout(() => setElementsLoaded(prev => ({ ...prev, map: true })), 100)
    setTimeout(() => setElementsLoaded(prev => ({ ...prev, address: true })), 300)
    setTimeout(() => setElementsLoaded(prev => ({ ...prev, carTypes: true })), 500)
    setTimeout(() => setElementsLoaded(prev => ({ ...prev, price: true })), 700)
    setTimeout(() => setPageLoaded(true), 900)

    // 初次加载时估价（如已存在选择）
    estimatePrice(selectedCarType)
  })

  // 添加新的状态管理
  const [showPricing, setShowPricing] = useState(false) // 控制是否显示价格和时间
  const [carTypePricing, setCarTypePricing] = useState<{[key: string]: {time: string, price: number}}>({}) // 存储各车型的动态价格和时间

  // ------ 车类型与时间选项数据（UI） ------
  const carTypes = [
    { id: 'economy', name: '经济型', time: '3分钟', price: 28, icon: EconomyIcon },
    { id: 'comfort', name: '舒适型', time: '5分钟', price: 35, icon: ComfortIcon },
    { id: 'luxury', name: '豪华型', time: '8分钟', price: 45, icon: LuxuryIcon },
  ]

  const timeOptions = [
    { id: 'now', label: '立即出发', description: '马上叫车' },
    { id: '5min', label: '5分钟后', description: '稍后出发' },
    { id: '10min', label: '10分钟后', description: '稍后出发' },
    { id: '15min', label: '15分钟后', description: '稍后出发' },
    { id: '30min', label: '30分钟后', description: '预约出行' },
    { id: '1hour', label: '1小时后', description: '预约出行' },
  ]

  // ---------- 价格预估（每次手动或触发时调用） ----------
  const estimatePrice = async (carTypeId: string) => {
    // 防护：必须有起点/终点
    if (!currentLocation || !destinationLocation) {
      setPriceData(null)
      return
    }

    setIsPriceLoading(true)
    
    try {
      // 模拟异步加载，延迟1-2秒
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
      
      const request: PriceEstimateRequest = {
        startLocation: currentLocation,
        endLocation: destinationLocation as Location,
        carType: carTypeId,
        departureTime: selectedTimeOption,
        preference: travelPreference
      }

      const resp = await rideService.estimatePrice(request)
      if (resp.success) {
        setPriceData(resp.data)
        setLastPriceUpdate(new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        }))
        
        // 更新所有车型的价格和时间信息
        updateAllCarTypesPricing()
      } else {
        showToast({ title: resp.error || '获取价格失败', icon: 'none' })
      }
    } catch (err) {
      console.error('estimatePrice error', err)
      showToast({ title: '网络异常，请稍后重试', icon: 'none' })
    } finally {
      setIsPriceLoading(false)
    }
  }

  // 更新所有车型的价格和时间信息
  const updateAllCarTypesPricing = () => {
    const basePricing = {
      economy: { basePrice: 28, baseTime: 15 },
      comfort: { basePrice: 35, baseTime: 12 },
      luxury: { basePrice: 45, baseTime: 8 }
    }
    
    const newPricing: {[key: string]: {time: string, price: number}} = {}
    
    Object.keys(basePricing).forEach(carType => {
      const base = basePricing[carType as keyof typeof basePricing]
      let timeMultiplier = 1
      let priceMultiplier = 1
      
      // 根据出行偏好调整时间（快车/慢车）
      if (travelPreference === 'fast') {
        timeMultiplier = 0.8 // 快车时间减少20%
        priceMultiplier = 1.2 // 快车价格增加20%
      } else if (travelPreference === 'slow') {
        timeMultiplier = 1.3 // 慢车时间增加30%
        priceMultiplier = 0.9 // 慢车价格减少10%
      }
      // quiet选项不影响时间和价格
      
      const finalTime = Math.round(base.baseTime * timeMultiplier)
      const finalPrice = Math.round(base.basePrice * priceMultiplier)
      
      newPricing[carType] = {
        time: `${finalTime}分钟`,
        price: finalPrice
      }
    })
    
    setCarTypePricing(newPricing)
    setShowPricing(true) // 显示价格信息
  }

  // 处理车型切换（写入 store 并重新估价）
  const handleCarTypeChange = (carTypeId: string) => {
    setSelectedCarType(carTypeId)
    estimatePrice(carTypeId)
  }

  // 地图展开相关事件处理
  const handleMapExpand = () => {
    setIsMapExpanded(!isMapExpanded)
  }

  const handleMapCollapse = () => {
    setIsMapExpanded(!isMapExpanded)
  }

  
  // 处理选择目的地（内置常用目的地）
  const destinations: Location[] = [
    { latitude: 22.5649, longitude: 114.0681, address: '深圳市福田区平安金融中心', landmark: '平安国际金融中心' },
    { latitude: 22.5270, longitude: 114.0598, address: '深圳市南山区海岸城', landmark: '海岸城购物中心' },
    { latitude: 22.5386, longitude: 114.0955, address: '深圳市福田区市民中心', landmark: '深圳市政府' },
    { latitude: 22.6056, longitude: 114.0201, address: '深圳市宝安区深圳宝安国际机场', landmark: '深圳机场T3航站楼' }
  ]

  const selectDestination = () => setIsActionSheetOpened(true)
  const handleDestinationSelect = (index: number) => {
    const selected = destinations[index]
    setDestinationLocation(selected)
    setEndAddressInput(selected.landmark || selected.address)
    // 立刻用 known dest 估价（不用等 store 异步）
    if (currentLocation) {
      estimatePrice(selectedCarType)
    }
    setIsActionSheetOpened(false)
  }

  // 处理目的地输入
  const handleDestinationInput = (value: string) => {
    setEndAddressInput(value)
    // 当用户输入目的地时，创建一个基本的Location对象
    if (value.trim()) {
      const destinationObj: Location = {
        latitude: currentLocation?.latitude || 0,
        longitude: currentLocation?.longitude || 0,
        address: value,
        landmark: value
      }
      setDestinationLocation(destinationObj)
      
      // 开始异步加载价格
      if (currentLocation) {
        estimatePrice(selectedCarType)
      }
    } else {
      setDestinationLocation(null)
      setShowPricing(false) // 隐藏价格信息
      setCarTypePricing({}) // 清空价格数据
    }
  }

  // 出行偏好选择
  const handlePreferenceSelect = (preference: string) => {
    if (travelPreference === preference) {
      setTravelPreference('')
    } else {
      setTravelPreference(preference)
    }
    
    // 如果有目的地，重新计算价格和时间（快慢车会影响时间）
    if (destinationLocation && showPricing && (preference === 'fast' || preference === 'slow')) {
      updateAllCarTypesPricing()
    }
  }

  // 手动刷新价格（UI 按钮）
  const refreshPrice = () => estimatePrice(selectedCarType)

  // 简化距离计算（确保传参有效）
  const calculateDistance = (start?: Location | null, end?: Location | null): number => {
    if (!start || !end) return 0
    const R = 6371
    const dLat = (end.latitude - start.latitude) * Math.PI / 180
    const dLon = (end.longitude - start.longitude) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(start.latitude * Math.PI / 180) * Math.cos(end.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return Math.round(R * c * 10) / 10
  }
  const actualDistance = calculateDistance(currentLocation, destinationLocation)

  // ---------- 下单（乐观策略） ----------
  const createOrder = async () => {
    if (isOrderCreating) return

    // 必要检查
    if (!currentLocation || !currentLocation.landmark) {
      showToast({ title: '请先选择上车地点', icon: 'none' })
      return
    }
    if (!destinationLocation || !destinationLocation.landmark) {
      showToast({ title: '请先选择目的地', icon: 'none' })
      return
    }
    if (!selectedCarType) {
      showToast({ title: '请选择车型', icon: 'none' })
      return
    }

    setIsOrderCreating(true)
    showLoading({ title: '正在创建订单...' })

    try {
      // 获取对应车型的mock数据（价格、司机、车辆信息）
      const mockData = getMockDataByCarType(selectedCarType)
      
      // 创建订单数据：用户选择 + mock数据
      const orderData = {
        // 用户在页面选择的数据
        startLocation: currentLocation,
        endLocation: destinationLocation,
        carTypeId: selectedCarType,
        preference: travelPreference,
        departureTime: selectedTimeOption,
        
        // mock数据提供的信息
        price: mockData.price,
        driver: mockData.driver,
        vehicle: mockData.vehicle,
        
        // 订单状态
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      // 添加到本地订单存储
      const localId = addLocalOrder(orderData)
      
      hideLoading()
      
      // 显示创建成功提示
      showToast({ 
        title: '订单创建成功', 
        icon: 'success',
        duration: 1500
      })

      // 跳转到订单页面
      setTimeout(async () => {
        try {
          await navigateTo({ url: `/pages/order/index?orderId=${localId}` })
        } catch (navErr) {
          console.warn('导航订单页面失败', navErr)
          showToast({ title: '跳转失败，请在订单列表查看', icon: 'none' })
        }
      }, 1500)

    } catch (err) {
      console.error('创建订单失败', err)
      hideLoading()
      showModal({
        title: '创建订单失败',
        content: '系统异常，请稍后重试',
        showCancel: true,
        confirmText: '重试',
        success: (res) => {
          if (res.confirm) createOrder()
        }
      })
    } finally {
      setIsOrderCreating(false)
    }
  }

  // ---------- 价格显示辅助 ----------
  const getDisplayPrice = () => {
    if (isPriceLoading) return '估算中...'
    if (!showPricing) return '--' // 没有目的地时不显示价格
    return priceData ? priceData.estimatedPrice : (carTypePricing[selectedCarType]?.price || '--')
  }

  const getDisplayTime = (carTypeId: string) => {
    if (isPriceLoading && selectedCarType === carTypeId) return '计算中...'
    if (!showPricing) return '--' // 没有目的地时不显示时间
    return carTypePricing[carTypeId]?.time || '--'
  }

  const getDisplayCarPrice = (carTypeId: string) => {
    if (isPriceLoading && selectedCarType === carTypeId) return '估算中...'
    if (!showPricing) return '--' // 没有目的地时不显示价格
    return carTypePricing[carTypeId]?.price || '--'
  }

  const getPriceUpdateText = () => {
    if (isPriceLoading) return '计算中'
    if (lastPriceUpdate) return `${lastPriceUpdate} 更新`
    return '实时更新'
  }

  // ---------- 渲染（保留原有 UI 结构，替换数据来源） ----------
  return (
    <View className={classnames('ride-page', { 'map-expanded': isMapExpanded })}>
      <View 
        className={classnames('map-container', { 'expanded': isMapExpanded })}
        onTouchMove={!isMapExpanded ? handleMapExpand : undefined}
      >
        <Map />
        
        {/* 地图展开时的返回箭头 */}
        {isMapExpanded && (
          <View className='map-back-arrow' onClick={handleMapCollapse}>
            <AtIcon value='chevron-left' size='24' color='#000' />
          </View>
        )}
      </View>

      <View className={classnames('main-content', { 'loaded': pageLoaded })}>
        {/* 地址卡片 - 在地图展开时仍然可见 */}
        <View className={classnames('address-card', { 'loaded': elementsLoaded.address })}>
          <View className='address-row start-location'>
            <View className='location-dot green-dot'></View>
            <View className='address-info'>
              <Text className='current-location-text'>{currentLocation?.landmark || currentLocation?.address || '定位中'}</Text>
            </View>
          </View>
          <View className='address-row destination-location'>
            <View className='location-dot orange-dot animated-dot'>
              <View className='dot-glow-outer'></View>
              <View className='dot-glow-inner'></View>
              <View className='dot-core'></View>
              <View className='dot-ripple'></View>
            </View>
            <View className='address-input-container'>
              <Input
                className='address-input destination-input'
                value={endAddressInput || ''}
                placeholder='您要去哪儿？'
                onInput={(e) => handleDestinationInput(e.detail.value)}
              />
            </View>
          </View>
        </View>

        {/* 其他组件 - 在地图展开时隐藏 */}
        <View className={classnames('other-content', { 'hidden': isMapExpanded })}>
          <View className='car-type-selector'>
          {carTypes.map((car, index) => {
            const IconComponent = car.icon
            return (
              <View
                key={car.id}
                className={classnames('car-type-option', {
                  selected: selectedCarType === car.id,
                  loading: isPriceLoading && selectedCarType === car.id,
                  loaded: elementsLoaded.carTypes
                })}
                onClick={() => handleCarTypeChange(car.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <View className='car-icon-wrapper'>
                  <IconComponent className='custom-car-icon' />
                </View>
                <Text className='car-name'>{car.name}</Text>
              </View>
            )
          })}
        </View>

        {/* 偏好 & 出发时间 */}
        <View className='preference-buttons'>
          <View className='preference-button-container'>
            <View className='preference-button' onClick={() => setShowPreferencePopup(!showPreferencePopup)}>
              <View className='preference-mainline'>
                <AtIcon value='settings' size='16' className='preference-icon' />
                <Text className='preference-text'>出行偏好</Text>
              </View>
              <Text className='preference-subtext'>
                {travelPreference === '' && '未选择'}
                {travelPreference === 'quiet' && '更安静'}
                {travelPreference === 'fast' && '速度快'}
                {travelPreference === 'slow' && '速度慢'}
              </Text>
            </View>
            {showPreferencePopup && (
              <View className='preference-popup'>
                <View className='popup-content'>
                  <View
                    className={`preference-option quiet ${travelPreference === 'quiet' ? 'selected' : ''}`}
                    onClick={() => handlePreferenceSelect('quiet')}
                  >
                    <QuietIcon className='option-icon' />
                    <Text className='option-text'>更安静</Text>
                  </View>
                  <View
                    className={`preference-option fast ${travelPreference === 'fast' ? 'selected' : ''}`}
                    onClick={() => handlePreferenceSelect('fast')}
                  >
                    <FastIcon className='option-icon' />
                    <Text className='option-text'>速度快</Text>
                  </View>
                  <View
                    className={`preference-option slow ${travelPreference === 'slow' ? 'selected' : ''}`}
                    onClick={() => handlePreferenceSelect('slow')}
                  >
                    <SlowIcon className='option-icon' />
                    <Text className='option-text'>速度慢</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          <View className='preference-button-container'>
            <View className='preference-button' onClick={() => setShowTimePopup(true)}>
              <View className='preference-mainline'>
                <AtIcon value='clock' size='16' className='preference-icon' />
                <Text className='preference-text'>出发时间</Text>
              </View>
              <Text className='preference-subtext'>
                {selectedTimeOption === 'now' && '立即出发'}
                {selectedTimeOption === '5min' && '5分钟后'}
                {selectedTimeOption === '10min' && '10分钟后'}
                {selectedTimeOption === '15min' && '15分钟后'}
                {selectedTimeOption === '30min' && '30分钟后'}
                {selectedTimeOption === '1hour' && '1小时后'}
              </Text>
            </View>
          </View>
        </View>

        <View className={classnames('price-card', { 'loaded': elementsLoaded.price })}>
          <View className='price-header'>
            <View className='price-title-group'>
              <AtIcon value='reload' size='18' className={`price-icon ${isPriceLoading ? 'rotating' : ''}`} onClick={refreshPrice} />
              <Text className='price-title'>价格预估</Text>
            </View>
            <Text className='price-update-time'>{getPriceUpdateText()}</Text>
          </View>

          <View className='price-body'>
            <Text className='price-amount'>¥{isPriceLoading ? '...' : (priceData?.estimatedPrice || getDisplayPrice())}</Text>
            <View className='payment-method-outline'>
              <AtIcon value='shopping-bag' size='16' className='wallet-icon' />
              <Text>微信支付</Text>
            </View>
          </View>

          <Text className='price-subtext'>
            预计行程 {priceData?.estimatedDistance || actualDistance} 公里 · 预计时间 {isPriceLoading ? '...' : getDisplayTime(selectedCarType)}
            {priceData?.blockchainFee ? ` · 手续费 ¥${priceData.blockchainFee}` : ''}
          </Text>

          {priceData?.priceBreakdown && (
            <View className='price-breakdown'>
              <Text className='breakdown-title'>费用明细：</Text>
              {priceData.priceBreakdown
                .filter(item => item.label !== '区块链手续费')
                .map((item, index) => (
                  <View key={index} className='breakdown-item'>
                    <Text className='breakdown-label'>{item.label}</Text>
                    <Text className='breakdown-amount'>¥{item.amount}</Text>
                  </View>
                ))}
            </View>
          )}
        </View>
      </View>

      <View className='footer'>
        <View className='footer-bar'>
          <View className='info-section'>
            <AtIcon value='wifi' size='16' className='info-icon' />
            <Text className='info-text'>节点已连接</Text>
          </View>
          <View className='info-section'>
            <AtIcon value='star' size='16' className='info-icon' />
            <Text className='info-text'>燃油费指数: 低</Text>
          </View>
        </View>

        </View> {/* 关闭 other-content */}

        <View className='action-button-container'>
          <Button
            className={`action-button-primary ${isOrderCreating ? 'loading' : ''}`}
            onClick={createOrder}
            disabled={isOrderCreating || isPriceLoading || !destinationLocation?.landmark}
          >
            {isOrderCreating ? '创建中...' : '立即用车'}
          </Button>
        </View>
      </View>

      <Fab />

      <AtActionSheet
        isOpened={isActionSheetOpened}
        cancelText='取消'
        title='请选择目的地'
        onClose={() => setIsActionSheetOpened(false)}
        onCancel={() => setIsActionSheetOpened(false)}
      >
        {destinations.map((dest, index) => (
          <AtActionSheetItem key={index} onClick={() => handleDestinationSelect(index)}>
            {dest.landmark || dest.address}
          </AtActionSheetItem>
        ))}
      </AtActionSheet>

      {/* 出发时间弹窗 */}
      {showTimePopup && (
        <View className='time-popup-overlay' onClick={() => setShowTimePopup(false)}>
          <View className='time-popup-container' onClick={(e) => e.stopPropagation()}>
            <View className='time-popup-header'>
              <Text className='time-popup-title'>选择出发时间</Text>
              <AtIcon value='close' size='20' className='time-popup-close' onClick={() => setShowTimePopup(false)} />
            </View>
            <View className='time-options-grid'>
              {timeOptions.map((option) => (
                <View
                  key={option.id}
                  className={`time-option-card ${selectedTimeOption === option.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedTimeOption(option.id)
                    setShowTimePopup(false)
                  }}
                >
                  <Text className='time-option-label'>{option.label}</Text>
                  <Text className='time-option-description'>{option.description}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

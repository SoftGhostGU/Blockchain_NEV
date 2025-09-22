
// src/pages/ride/index.tsx  （或你当前的路径）
import { View, Text, Image, Button, Input } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
import { useLoad, showToast, showLoading, hideLoading, navigateTo, showModal } from '@tarojs/taro'
import { AtIcon, AtActionSheet, AtActionSheetItem } from 'taro-ui'
import classnames from 'classnames'
import './index.scss'

import EconomyIcon from './icons/EconomyIcon'
import ComfortIcon from './icons/ComfortIcon'
import LuxuryIcon from './icons/LuxuryIcon'
import CleanIcon from './icons/CleanIcon'
import QuietIcon from './icons/QuietIcon'
import SpaceIcon from './icons/SpaceIcon'

import rideService from '../../api/rideService'
import { Location, PriceEstimateRequest, CreateOrderRequest } from '../../api/type'
import Fab from '../../components/Fab'

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
  const priceTimerRef = useRef<any>(null) // 使用 ref 保存定时器（不触发渲染）

  const [isActionSheetOpened, setIsActionSheetOpened] = useState(false)
  const [showPreferencePopup, setShowPreferencePopup] = useState(false)
  const [showTimePopup, setShowTimePopup] = useState(false)

  useLoad(() => {
    // 页面分阶段动画
    setTimeout(() => setElementsLoaded(prev => ({ ...prev, map: true })), 100)
    setTimeout(() => setElementsLoaded(prev => ({ ...prev, address: true })), 300)
    setTimeout(() => setElementsLoaded(prev => ({ ...prev, carTypes: true })), 500)
    setTimeout(() => setElementsLoaded(prev => ({ ...prev, price: true })), 700)
    setTimeout(() => setPageLoaded(true), 900)

    // 初次加载时估价（如已存在选择）
    estimatePrice(selectedCarType)
  })

  // 清理定时器（组件卸载）
  useEffect(() => {
    return () => {
      if (priceTimerRef.current) {
        clearTimeout(priceTimerRef.current)
        priceTimerRef.current = null
      }
    }
  }, [])

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
    const request: PriceEstimateRequest = {
      startLocation: currentLocation as Location,
      endLocation: destinationLocation as Location,
      carTypeId,
      // 这里暂用页面估算或后端要求字段
      estimatedDistance: 12,
      estimatedDuration: 30,
    }

    try {
      const resp = await rideService.estimatePrice(request)
      if (resp && resp.success && resp.data) {
        setPriceData(resp.data)
        setLastPriceUpdate(new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        }))

        // 清理之前定时器并创建新的自动更新定时器（5 分钟）
        if (priceTimerRef.current) {
          clearTimeout(priceTimerRef.current)
        }
        priceTimerRef.current = setTimeout(() => {
          estimatePrice(carTypeId)
        }, 5 * 60 * 1000)
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

  // 处理车型切换（写入 store 并重新估价）
  const handleCarTypeChange = (carTypeId: string) => {
    setSelectedCarType(carTypeId)
    estimatePrice(carTypeId)
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
    estimatePrice(selectedCarType)
    setIsActionSheetOpened(false)
  }

  // 处理目的地输入
  const handleDestinationInput = (value: string) => {
    setEndAddressInput(value)
    // 当用户输入目的地时，创建一个基本的Location对象
    if (value.trim()) {
      const destinationObj: Location = {
        latitude: 22.5431, // 使用默认坐标（实际应用中可以通过地理编码获取）
        longitude: 114.0579,
        address: value.trim(),
        landmark: value.trim()
      }
      setDestinationLocation(destinationObj)
    } else {
      setDestinationLocation(null)
    }
  }

  // 出行偏好选择
  const handlePreferenceSelect = (preference: string) => {
    if (travelPreference === preference) setTravelPreference('')
    else setTravelPreference(preference)
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
    return priceData ? priceData.estimatedPrice : (carTypes.find(c => c.id === selectedCarType)?.price || 0)
  }

  const getPriceUpdateText = () => {
    if (isPriceLoading) return '计算中'
    if (lastPriceUpdate) return `${lastPriceUpdate} 更新`
    return '实时更新'
  }

  // ---------- 渲染（保留原有 UI 结构，替换数据来源） ----------
  return (
    <View className='ride-page'>
      <View className='map-container'>
        <Image
          className='map-image'
          src='https://developers.google.com/static/codelabs/maps-platform/maps-platform-101-js/img/e52623cb8578d625.png?hl=zh-cn'
          mode='aspectFill'
        />
      </View>

      <View className={classnames('main-content', { 'loaded': pageLoaded })}>
        <View className={classnames('address-card', { 'loaded': elementsLoaded.address })}>
          <View className='address-row start-location'>
            <View className='location-dot green-dot'></View>
            <View className='address-info'>
              <Text className='current-location-text'>{currentLocation?.landmark || currentLocation?.address || '定位中'}</Text>
            </View>
          </View>
          <View className='address-row destination-location'>
            <View className='location-dot orange-dot'></View>
            <View className='address-input-container'>
              <Input
                className='address-input destination-input'
                value={endAddressInput || ''}
                placeholder='请输入目的地'
                onInput={(e) => handleDestinationInput(e.detail.value)}
              />
            </View>
          </View>
        </View>

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
                <View className='car-details'>
                  <AtIcon value='clock' size='14' className='time-icon' />
                  <Text className='car-time'>{car.time}</Text>
                </View>
                <Text className='car-price'>
                  ¥{selectedCarType === car.id ? getDisplayPrice() : car.price}
                </Text>
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
                {travelPreference === 'clean' && '更干净'}
                {travelPreference === 'spacious' && '空间更大'}
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
                    className={`preference-option clean ${travelPreference === 'clean' ? 'selected' : ''}`}
                    onClick={() => handlePreferenceSelect('clean')}
                  >
                    <CleanIcon className='option-icon' />
                    <Text className='option-text'>更干净</Text>
                  </View>
                  <View
                    className={`preference-option space ${travelPreference === 'spacious' ? 'selected' : ''}`}
                    onClick={() => handlePreferenceSelect('spacious')}
                  >
                    <SpaceIcon className='option-icon' />
                    <Text className='option-text'>空间更大</Text>
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
            预计行程 {priceData?.estimatedDistance || actualDistance} 公里
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

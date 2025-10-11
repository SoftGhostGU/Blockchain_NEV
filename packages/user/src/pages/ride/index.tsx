// src/pages/ride/index.tsx  
import { View, Text, Image, Button, Input } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
import { useLoad, showToast, showLoading, hideLoading, navigateTo, showModal, usePageScroll, useDidShow, useDidHide } from '@tarojs/taro'
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
import AMapLoader from '@amap/amap-jsapi-loader'
import CarSelectionPopup from './components/CarSelectionPopup'

// 根据选择的车型生成 4 辆同类型车辆（含型号、电量、距离）
const generateMockCars = (carTypeId: string) => {
  const typeNameMap: Record<string, string> = {
    economy: '经济型',
    comfort: '舒适型',
    luxury: '豪华型',
  }

  const modelMap: Record<string, string[]> = {
    economy: ['广汽埃安 AION S', '比亚迪 秦Plus', '丰田 雷凌', '大众 朗逸'],
    comfort: ['本田 雅阁', '丰田 凯美瑞', '大众 迈腾', '尼桑 天籁'],
    luxury: ['奔驰 E级', '宝马 5系', '奥迪 A6L', '特斯拉 Model S'],
  }

  const basePrices: Record<string, number> = { economy: 28, comfort: 35, luxury: 45 }
  const baseTimes: Record<string, string> = { economy: '约3分钟', comfort: '约5分钟', luxury: '约8分钟' }

  const name = typeNameMap[carTypeId] || '经济型'
  const models = modelMap[carTypeId] || modelMap.economy

  const phones = ['13800001111', '13800002222', '13800003333', '13800004444']
  const unifiedImage = 'https://image.bitauto.com/autoalbum/files/20250120/239/202501204021736376523945122-900x600-w0.png'

  return new Array(4).fill(0).map((_, idx) => {
    const battery = Math.min(95, Math.max(25, 70 + (idx * 5 - 10))) // 约 60-90%
    const distanceKm = (0.6 + idx * 0.4).toFixed(1)
    return {
      id: idx + 1,
      name,
      price: basePrices[carTypeId] + idx * 5,
      time: baseTimes[carTypeId],
      plate: `粤B ${10000 + idx}`,
      driver: ['张师傅', '李师傅', '王师傅', '赵师傅'][idx] || '张师傅',
      phone: phones[idx] || '13800001111',
      avatar: unifiedImage,
      model: models[idx % models.length],
      battery,
      distance: `${distanceKm}km`,
    }
  })
}

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
// 新增：由高德驾车规划得到的真实里程/时长
const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null)
const [routeDurationMin, setRouteDurationMin] = useState<number | null>(null)
  const [isOrderCreating, setIsOrderCreating] = useState(false)
  const [lastPriceUpdate, setLastPriceUpdate] = useState('')

  const [isActionSheetOpened, setIsActionSheetOpened] = useState(false)
  const [showPreferencePopup, setShowPreferencePopup] = useState(false)
  const [showTimePopup, setShowTimePopup] = useState(false)
  
  // 车辆选择弹窗状态
  const [showCarSelection, setShowCarSelection] = useState(false)

  // 地图展开状态管理
  const [isMapExpanded, setIsMapExpanded] = useState(false)

  // 滚动淡出状态
  const [scrollTop, setScrollTop] = useState(0)
  usePageScroll(({ scrollTop }) => {
    setScrollTop(scrollTop)
  })

  // 地图可见性与强制重挂载 key（返回页面时重建地图实例）
  const [mapVisible, setMapVisible] = useState(false)
  const [mapKey, setMapKey] = useState(0)

  // ----- 联想与防抖相关状态 -----
  type Suggestion = { name: string; district?: string; address?: string; adcode?: string; location?: any }
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSuggestLoading, setIsSuggestLoading] = useState(false)
  const debounceTimerRef = useRef<any>(null)
  const autoCompleteRef = useRef<any>(null)
  const placeSearchRef = useRef<any>(null)
  const amapReadyRef = useRef<boolean>(false)
  const [currentCity, setCurrentCity] = useState<string>('')

  // 从地址字符串中尽力提取城市名（例如：江苏省南通市如皋市城北街道 -> 南通市或如皋市）
  const deriveCityFromAddress = (addr?: string): string => {
    if (!addr) return ''
    // 优先匹配“xx市”
    const cityMatch = addr.match(/([\u4e00-\u9fa5]{2,}市)/)
    if (cityMatch) {
      return cityMatch[1]
    }
    // 其次匹配“xx区/县”作为退化
    const districtMatch = addr.match(/([\u4e00-\u9fa5]{2,}(?:区|县))/)
    if (districtMatch) {
      return districtMatch[1]
    }
    return ''
  }

  // 固定头像点击跳转主页
  const handleAvatarClick = () => {
    navigateTo({ url: '/pages/home/index' })
  }

  // 获取当前城市并设置到联想搜索
  useEffect(() => {
    (async () => {
      try {
        const AMap = await ensureAMapReady()
        const citySearch = new (AMap as any).CitySearch()
        citySearch.getLocalCity((status: string, result: any) => {
          if (status === 'complete' && result?.city) {
            setCurrentCity(result.city)
            if (autoCompleteRef.current) {
              autoCompleteRef.current.setCity(result.city)
            }
            if (placeSearchRef.current) {
              placeSearchRef.current.setCity(result.city)
            }
          } else {
            // 回退：从当前定位地址中抽取城市名，避免徽标为空
            const fallback = deriveCityFromAddress(currentLocation?.address || currentLocation?.landmark)
            if (fallback) setCurrentCity(fallback)
          }
        })
      } catch (err) {
        console.warn('CitySearch failed:', err)
        const fallback = deriveCityFromAddress(currentLocation?.address || currentLocation?.landmark)
        if (fallback) setCurrentCity(fallback)
      }
    })()
  }, [])

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
  // 车辆弹窗异步加载状态
  const [carsLoading, setCarsLoading] = useState<boolean>(false)
  const [carsData, setCarsData] = useState<any[]>([])

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

  // 异步获取后端车辆（占位：可替换为真实接口）
  const fetchCarsByType = async (carTypeId: string) => {
    try {
      // TODO: 调用真实后端接口获取车辆列表
      // 这里先模拟网络延时
      await new Promise(resolve => setTimeout(resolve, 800))
      return generateMockCars(carTypeId)
    } catch (e) {
      console.warn('fetchCarsByType error:', e)
      return []
    }
  }

  // 打开弹窗时触发异步加载
  useEffect(() => {
    if (showCarSelection) {
      setCarsLoading(true)
      fetchCarsByType(selectedCarType).then(data => {
        setCarsData(data)
      }).finally(() => setCarsLoading(false))
    } else {
      // 关闭时重置，避免旧数据闪现
      setCarsData([])
    }
  }, [showCarSelection, selectedCarType])

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

  // 确保高德 JS API 可用（一次加载）
  const ensureAMapReady = async () => {
    if ((window as any).AMap && amapReadyRef.current) return (window as any).AMap
    ;(window as any)._AMapSecurityConfig = {
      securityJsCode: '847370c4fd8230a39278ac95e450d9c6',
    }
    const AMap = await AMapLoader.load({
      key: '2cbfc31f5eae1f3dd09f26255f115449',
      version: '2.0',
      plugins: ['AMap.AutoComplete', 'AMap.PlaceSearch', 'AMap.Geocoder', 'AMap.CitySearch']
    })
    amapReadyRef.current = true
    return AMap
  }

  // 页面显示时，若经纬度未就绪，主动获取一次定位；同时使地图重新挂载
  const ensureCurrentLocationReady = async () => {
    try {
      const AMap = await ensureAMapReady()
      ;(AMap as any).plugin('AMap.Geolocation', () => {
        const geolocation = new (AMap as any).Geolocation({
          enableHighAccuracy: true,
          timeout: 10000,
          zoomToAccuracy: false,
          position: 'RB'
        })
        geolocation.getCurrentPosition((status: string, result: any) => {
          if (status === 'complete' && result?.position) {
            const { lng, lat } = result.position
            if (typeof lng === 'number' && typeof lat === 'number' && !isNaN(lng) && !isNaN(lat)) {
              const updated: Location = {
                latitude: lat,
                longitude: lng,
                address: currentLocation?.address || '当前位置',
                landmark: currentLocation?.landmark || '当前位置'
              }
              setCurrentLocation(updated)
            }
          }
        })
      })
    } catch (e) {
      console.warn('ensureCurrentLocationReady failed:', e)
    }
  }

  const coordsReady = typeof currentLocation?.latitude === 'number' && typeof currentLocation?.longitude === 'number' && !isNaN(currentLocation!.latitude as any) && !isNaN(currentLocation!.longitude as any)

  useDidShow(() => {
    setMapVisible(true)
    setMapKey((k) => k + 1) // 强制 Map 组件重新挂载，重建实例
    if (!coordsReady) {
      // 返回页面时若没有有效经纬度，先获取一次，避免地图内部出现 NaN
      ensureCurrentLocationReady()
    }
  })

  useDidHide(() => {
    // 隐藏页面时卸载地图，避免旧实例残留
    setMapVisible(false)
  })

  // 处理目的地输入（防抖 + 高德联想）
  const handleDestinationInput = (value: string) => {
    setEndAddressInput(value)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    const keyword = value.trim()

    if (!keyword) {
      setShowSuggestions(false)
      setSuggestions([])
      setDestinationLocation(null)
      setShowPricing(false)
      setCarTypePricing({})
      return
    }

    // 防抖后触发联想
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setIsSuggestLoading(true)
        const AMap = await ensureAMapReady()
    if (!autoCompleteRef.current) {
      autoCompleteRef.current = new (AMap as any).AutoComplete({ city: currentCity || undefined, citylimit: false })
    }
        autoCompleteRef.current.search(keyword, (status: string, result: any) => {
          if (status === 'complete' && result?.tips?.length) {
            const tips: Suggestion[] = result.tips.map((t: any) => ({
              name: t.name,
              district: t.district,
              adcode: t.adcode,
              location: t.location
            }))
            setSuggestions(tips)
            setShowSuggestions(true)
          } else {
            setSuggestions([])
            setShowSuggestions(true)
          }
          setIsSuggestLoading(false)
        })
      } catch (err) {
        console.warn('AutoComplete error:', err)
        setIsSuggestLoading(false)
      }
    }, 350)
  }

  // 选择联想候选，获取坐标并更新目的地
  const handleSuggestionChoose = async (item: Suggestion) => {
    try {
      const AMap = await ensureAMapReady()
      // 优先使用联想返回的坐标
      const loc = item.location
      const usePlaceSearch = !loc || (typeof loc?.lng === 'undefined' || typeof loc?.lat === 'undefined')

      let lng = 0, lat = 0
      let finalName = item.name

    if (usePlaceSearch) {
      if (!placeSearchRef.current) {
        placeSearchRef.current = new (AMap as any).PlaceSearch({ city: currentCity || undefined, citylimit: false })
      }
        placeSearchRef.current.search(item.name, (status: string, result: any) => {
          if (status === 'complete' && result?.poiList?.pois?.length) {
            const poi = result.poiList.pois[0]
            const pos = poi.location
            lng = pos.lng
            lat = pos.lat
            finalName = poi.name || item.name
            const destinationObj: Location = {
              latitude: lat,
              longitude: lng,
              address: finalName,
              landmark: finalName
            }
            setDestinationLocation(destinationObj)
            setEndAddressInput(finalName)
            setShowSuggestions(false)
            setShowPricing(true)
            if (currentLocation) {
              estimatePrice(selectedCarType)
            }
          } else {
            // 无坐标，fallback 为当前坐标
            const destinationObj: Location = {
              latitude: currentLocation?.latitude || 0,
              longitude: currentLocation?.longitude || 0,
              address: finalName,
              landmark: finalName
            }
            setDestinationLocation(destinationObj)
            setEndAddressInput(finalName)
            setShowSuggestions(false)
            setShowPricing(true)
            if (currentLocation) {
              estimatePrice(selectedCarType)
            }
          }
        })
      } else {
        lng = loc.lng
        lat = loc.lat
        const destinationObj: Location = {
          latitude: lat,
          longitude: lng,
          address: finalName,
          landmark: finalName
        }
        setDestinationLocation(destinationObj)
        setEndAddressInput(finalName)
        setShowSuggestions(false)
        setShowPricing(true)
        if (currentLocation) {
          estimatePrice(selectedCarType)
        }
      }
    } catch (err) {
      console.warn('handleSuggestionChoose error:', err)
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

  // ---------- 处理下单按钮点击 ----------
  const handleCreateOrder = () => {
    // 必要的检查
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

    // 显示车辆选择弹窗
    setShowCarSelection(true)
  }

  // ---------- 下单（乐观策略） ----------
  const createOrder = async (selectedCar?: any) => {
    if (isOrderCreating) return

    setIsOrderCreating(true)
    showLoading({ title: '正在创建订单...' })

    try {
      // 获取对应车型的mock数据（价格、司机、车辆信息）
      const mockData = getMockDataByCarType(selectedCarType)
      
      // 创建订单数据：用户选择 + mock数据/选中车辆
      const orderData = {
        // 用户在页面选择的数据
        startLocation: currentLocation,
        endLocation: destinationLocation,
        carTypeId: selectedCarType,
        preference: travelPreference,
        departureTime: selectedTimeOption,
        
        // 价格信息
        price: mockData.price,
        // 司机与车辆信息以用户选中为准（若存在），否则使用mock
        driver: selectedCar ? { name: selectedCar.driver, phone: selectedCar.phone || mockData.driver?.phone || '' } : mockData.driver,
        vehicle: selectedCar
          ? { type: `${selectedCar.name} · ${selectedCar.model}`, plateNumber: selectedCar.plate, imageUrl: selectedCar.avatar }
          : mockData.vehicle,
        
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
          if (res.confirm) createOrder(selectedCar)
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
        {mapVisible && coordsReady && (
          <Map 
            key={mapKey}
            destinationLocation={destinationLocation || undefined}
            startLocation={currentLocation || undefined}
            onStartLocationChange={setCurrentLocation}
            onRouteInfo={(info) => {
              try {
                const distKm = info.distanceMeters > 0 ? Number((info.distanceMeters / 1000).toFixed(1)) : null
                const durMin = info.durationSeconds > 0 ? Math.max(1, Math.round(info.durationSeconds / 60)) : null
                setRouteDistanceKm(distKm)
                setRouteDurationMin(durMin)
              } catch (e) {
                setRouteDistanceKm(null)
                setRouteDurationMin(null)
              }
            }}
          />
        )}
        
        {/* 地图展开时的返回箭头 */}
        {isMapExpanded && (
          <View className='map-back-arrow' onClick={handleMapCollapse}>
            <AtIcon value='chevron-left' size='18' color='#000' />
          </View>
        )}
      </View>

      <View className={classnames('main-content', { 'loaded': pageLoaded })}>
        {/* 固定用户头像（左上角，地图展开时隐藏） */}
        {!isMapExpanded && (
          <View className='fixed-user-avatar' style={{ opacity: Math.max(0.3, 1 - Math.min(scrollTop / 200, 0.7)) }}>
            <View className='avatar-circle' onClick={handleAvatarClick}>
              <AtIcon value='user' size='20' className='avatar-icon' />
            </View>
            <View className='current-city-badge'>
              <Text className='city-text'>{currentCity || '定位中'}</Text>
              <View className='city-dot'></View>
            </View>
          </View>
        )}

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
              {showSuggestions && (
                <View className='suggestion-dropdown'>
                  {isSuggestLoading && (
                    <View className='suggestion-item'>正在搜索…</View>
                  )}
                  {!isSuggestLoading && suggestions.length === 0 && (
                    <View className='suggestion-empty'>无相关结果</View>
                  )}
                  {!isSuggestLoading && suggestions.map((s, idx) => (
                    <View
                      key={idx}
                      className='suggestion-item'
                      onClick={() => handleSuggestionChoose(s)}
                    >
                      <View className='suggestion-icon'>
                        <svg
                          className='suggestion-icon-svg'
                          viewBox='0 0 1024 1024'
                          xmlns='http://www.w3.org/2000/svg'
                          width='200'
                          height='200'
                        >
                          <path d='M511.998977 65.290005c-173.638689 0-314.904063 138.294716-314.904063 308.281225 0 77.603449 31.020504 185.005574 85.10633 294.67023 53.746088 108.971877 124.852566 209.287607 195.185424 275.377838 8.955976 9.602705 21.51092 15.08865 34.612309 15.08865 12.913101 0 25.359574-5.358031 34.296107-14.736633 149.549038-140.014894 280.608979-406.358985 280.608979-570.401108C826.904063 203.584722 685.637666 65.290005 511.998977 65.290005zM517.467525 914.127613l-1.128707 1.13894c-0.816598 0.8913-2.232854 1.952468-4.339842 1.952468-2.245134 0-3.695159-1.251503-4.361331-1.997494l-1.294482-1.327228C366.207519 782.579555 238.584863 525.041014 238.584863 373.572254c0-147.109476 122.652458-266.791276 273.414113-266.791276 150.761656 0 273.415137 119.6818 273.415137 266.791276C785.414113 525.483082 657.700383 783.130094 517.467525 914.127613z' fill='#272636'></path>
                          <path d='M513.044796 181.616384c-91.091648 0-165.199483 74.112951-165.199483 165.210739 0 91.076298 74.107835 165.172877 165.199483 165.172877 91.083461 0 165.184133-74.096579 165.184133-165.172877C678.228929 255.729336 604.128257 181.616384 513.044796 181.616384zM513.044796 470.51005c-68.213591 0-123.709533-55.484685-123.709533-123.682927 0-68.219731 55.495942-123.720789 123.709533-123.720789 68.205405 0 123.694183 55.501058 123.694183 123.720789C636.738979 415.025365 581.2502 470.51005 513.044796 470.51005z' fill='#272636'></path>
                        </svg>
                      </View>
                      <View className='suggestion-content'>
                        <Text className='suggestion-title'>{s.name}</Text>
                        <Text className='suggestion-subtitle'>{s.address || s.district || ''}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
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
                {travelPreference === 'slow' && '更舒缓'}
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
                    <Text className='option-text'>更舒缓</Text>
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
            预计行程 {routeDistanceKm ?? priceData?.estimatedDistance ?? actualDistance} 公里 · 预计时间 {routeDurationMin != null ? `${routeDurationMin} 分钟` : (isPriceLoading ? '...' : getDisplayTime(selectedCarType))}
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
            onClick={handleCreateOrder}
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

      {showCarSelection && (
        <CarSelectionPopup
          cars={carsData}
          loading={carsLoading}
          onClose={() => setShowCarSelection(false)}
          onConfirm={(car) => {
            console.log('Selected car:', car)
            setShowCarSelection(false)
            createOrder(car)
          }}
        />
      )}
    </View>
  )
}

// 导入Taro相关的组件和API
import { View, Text, Input } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { useLoad, navigateBack, showToast, chooseLocation } from '@tarojs/taro'
import { AtIcon, AtList, AtListItem } from 'taro-ui'
import './index.scss'

/**
 * 地址选择页面组件 - 适配Taro小程序
 * 功能包括：
 * 1. 顶部搜索栏，包含返回按钮、城市显示、搜索输入框和额外操作
 * 2. 快捷地址选择（家、公司、固定地址）
 * 3. 历史地点列表显示
 * 4. 小程序位置选择功能
 */
export default function AddressSelect() {
  // 状态管理
  const [searchValue, setSearchValue] = useState('') // 搜索输入值
  const [currentCity, setCurrentCity] = useState('上海') // 当前城市
  const [isLoading, setIsLoading] = useState(false) // 加载状态

  // 历史地点数据，包含地点名称、地铁线路信息和距离
  const [historyPlaces, setHistoryPlaces] = useState([
    {
      id: 1,
      name: "国家会展中心(17号线)地铁站16号口",
      sub: "17号线",
      distance: "11.28km",
      latitude: 31.1478,
      longitude: 121.3147
    },
    {
      id: 2,
      name: "上海虹桥国际机场T2航站楼",
      sub: "地铁2号线",
      distance: "8.5km",
      latitude: 31.1979,
      longitude: 121.3364
    }
  ])

  // 快捷地址数据
  const [quickAddresses, setQuickAddresses] = useState([
    { type: 'home', name: '家', icon: 'home', address: '' },
    { type: 'company', name: '公司', icon: 'briefcase', address: '' },
    { type: 'fixed', name: '固定', icon: 'map-pin', address: '' }
  ])

  // 页面加载时的初始化
  useLoad(() => {
    console.log('地址选择页面加载')
    // 可以在这里获取用户的历史地址数据
    loadUserAddresses()
  })

  /**
   * 加载用户地址数据
   */
  const loadUserAddresses = async () => {
    try {
      setIsLoading(true)
      // 这里可以调用API获取用户的历史地址和快捷地址
      // const addresses = await addressService.getUserAddresses()
      // setHistoryPlaces(addresses.history)
      // setQuickAddresses(addresses.quick)
    } catch (error) {
      console.error('加载地址数据失败:', error)
      showToast({
        title: '加载地址失败',
        icon: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 返回按钮点击处理
   */
  const handleBack = () => {
    navigateBack()
  }

  /**
   * 搜索输入变化处理
   */
  const handleSearchChange = (e) => {
    setSearchValue(e.detail.value)
    // 可以在这里实现搜索防抖和地址搜索功能
    if (e.detail.value.length > 0) {
      // debounceSearch(e.detail.value)
    }
  }

  /**
   * 添加途径点击处理
   */
  const handleAddWaypoint = () => {
    showToast({
      title: '添加途径功能开发中',
      icon: 'none'
    })
  }

  /**
   * 取消按钮点击处理
   */
  const handleCancel = () => {
    navigateBack()
  }

  /**
   * 快捷地址点击处理
   */
  const handleQuickAddressClick = (type: string) => {
    const address = quickAddresses.find(item => item.type === type)
    if (address?.address) {
      // 如果已设置地址，直接选择
      handleAddressSelect({
        name: address.name,
        address: address.address
      })
    } else {
      // 如果未设置，跳转到设置页面或使用位置选择
      handleLocationPicker(type)
    }
  }

  /**
   * 使用小程序位置选择器
   */
  const handleLocationPicker = (type?: string) => {
    chooseLocation({
      success: (res) => {
        const selectedAddress = {
          name: res.name,
          address: res.address,
          latitude: res.latitude,
          longitude: res.longitude
        }
        
        if (type) {
          // 更新快捷地址
          setQuickAddresses(prev => 
            prev.map(item => 
              item.type === type 
                ? { ...item, address: res.address }
                : item
            )
          )
        }
        
        handleAddressSelect(selectedAddress)
      },
      fail: (err) => {
        console.error('选择位置失败:', err)
        showToast({
          title: '选择位置失败',
          icon: 'error'
        })
      }
    })
  }

  /**
   * 历史地点点击处理
   */
  const handleHistoryPlaceClick = (place) => {
    handleAddressSelect({
      name: place.name,
      address: place.name,
      latitude: place.latitude,
      longitude: place.longitude
    })
  }

  /**
   * 地址选择处理
   */
  const handleAddressSelect = (address) => {
    console.log('选择的地址:', address)
    
    // 这里可以通过事件或store将选择的地址传递给调用页面
    // 例如：使用Taro的事件总线或全局状态管理
    
    showToast({
      title: '地址已选择',
      icon: 'success'
    })
    
    // 延迟返回，让用户看到成功提示
    setTimeout(() => {
      navigateBack()
    }, 1000)
  }

  /**
   * 分享地址处理
   */
  const handleShareAddress = (place) => {
    // 小程序分享功能
    showToast({
      title: '分享功能开发中',
      icon: 'none'
    })
  }

  return (
    <View className="address-page">
      {/* 顶部栏 - 包含返回按钮、城市、搜索框和操作按钮 */}
      <View className="header">
        {/* 返回按钮 */}
        <View className="back-icon" onClick={handleBack}>
          <AtIcon value="chevron-left" size="20" color="#333" />
        </View>
        
        {/* 当前城市显示 */}
        <View className="city">{currentCity}</View>
        
        {/* 地址搜索输入框 */}
        <Input
          className="search-input"
          placeholder="您要到哪里"
          value={searchValue}
          onInput={handleSearchChange}
          confirmType="search"
        />
        
        {/* 额外操作按钮区域 */}
        <View className="extra">
          <Text className="add" onClick={handleAddWaypoint}>+途径</Text>
          <Text className="cancel" onClick={handleCancel}>取消</Text>
        </View>
      </View>

      {/* 快捷地址选择区域 - 提供家、公司、固定地址的快速选择 */}
      <View className="quick-section">
        {quickAddresses.map((item) => (
          <View 
            className="quick-item" 
            key={item.type}
            onClick={() => handleQuickAddressClick(item.type)}
          >
            <AtIcon value={item.icon} size="24" color="#666" />
            <Text className="quick-text">{item.name}</Text>
            {item.address && <Text className="quick-address">{item.address}</Text>}
          </View>
        ))}
      </View>

      {/* 位置选择按钮 */}
      <View className="location-picker">
        <AtListItem
          title="选择位置"
          arrow="right"
          iconInfo={{ value: 'map-pin', color: '#00b578' }}
          onClick={() => handleLocationPicker()}
        />
      </View>

      {/* 历史地点区域 - 显示用户之前选择过的地址 */}
      <View className="section">
        <Text className="section-title">历史地点</Text>
        
        {/* 使用AtList组件优化列表显示 */}
        <AtList>
          {historyPlaces.map((item) => (
            <AtListItem
              key={item.id}
              title={item.name}
              note={item.sub}
              extraText={item.distance}
              arrow="right"
              iconInfo={{ value: 'map-pin', color: '#999' }}
              onClick={() => handleHistoryPlaceClick(item)}
              onSwitchChange={() => handleShareAddress(item)}
            />
          ))}
        </AtList>
        
        {/* 如果没有历史地点 */}
        {historyPlaces.length === 0 && (
          <View className="empty-state">
            <AtIcon value="map" size="48" color="#ccc" />
            <Text className="empty-text">暂无历史地点</Text>
          </View>
        )}
      </View>
    </View>
  )
}
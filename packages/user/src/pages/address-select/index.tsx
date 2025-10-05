// src/pages/address-detail/index.tsx
import { View, Text, Input, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { useLoad, navigateBack, showToast } from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import classnames from 'classnames'
import './index.scss'

// 地址数据接口定义
interface AddressItem {
  id: string
  name: string
  address: string
  distance: string
  latitude: number
  longitude: number
  type?: 'home' | 'company' | 'history' | 'recommend'
}

// 地址分类标签配置 - 现代化设计（移除家/公司/收藏）
const ADDRESS_CATEGORIES: { id: string; label: string; icon: string; color: string }[] = []

export default function ModernAddressDetail() {
  // ========== 状态管理 ==========
  const [searchValue, setSearchValue] = useState('') // 搜索输入值
  const [activeCategory, setActiveCategory] = useState<string>('') // 当前选中的地址分类
  const [isSearching, setIsSearching] = useState(false) // 是否正在搜索
  const [searchResults, setSearchResults] = useState<AddressItem[]>([]) // 搜索结果
  const [isLoading, setIsLoading] = useState(false) // 加载状态
  const [showAnimation, setShowAnimation] = useState(false) // 动画状态

  // 历史地点数据（模拟数据）
  const [historyLocations] = useState<AddressItem[]>([
    {
      id: 'history_1',
      name: '国家会展中心(17号线)地铁站16号口',
      address: '17号线',
      distance: '11.28km',
      latitude: 31.1573,
      longitude: 121.3070,
      type: 'history'
    },
    {
      id: 'history_2',
      name: '上海虹桥国际机场T2航站楼',
      address: '虹桥路2550号',
      distance: '8.95km',
      latitude: 31.1979,
      longitude: 121.3365,
      type: 'history'
    }
  ])

  // 推荐地点数据（模拟数据）
  const [recommendLocations] = useState<AddressItem[]>([
    {
      id: 'recommend_1',
      name: '太平洋·中环广场',
      address: '南京东路南京东路交口',
      distance: '19.00km',
      latitude: 31.2359,
      longitude: 121.4881,
      type: 'recommend'
    },
    {
      id: 'recommend_2',
      name: '鹊巢嘉定海洋世界',
      address: '阿克苏路63-66弄',
      distance: '16.44km',
      latitude: 31.3728,
      longitude: 121.2644,
      type: 'recommend'
    },
    {
      id: 'recommend_3',
      name: '上海大学附属仁和医院',
      address: '长江西路1999号1座20楼总裁办968号2号门口行',
      distance: '12.07km',
      latitude: 31.3097,
      longitude: 121.3931,
      type: 'recommend'
    },
    {
      id: 'recommend_4',
      name: '瑞明大厦',
      address: '福脸路11号',
      distance: '10.44km',
      latitude: 31.2891,
      longitude: 121.4658,
      type: 'recommend'
    },
    {
      id: 'recommend_5',
      name: '东亚银行金融大厦',
      address: '花园石桥路66号',
      distance: '9.56km',
      latitude: 31.2455,
      longitude: 121.5015,
      type: 'recommend'
    }
  ])

  // ========== 生命周期 ==========
  useLoad(() => {
    console.log('现代化地址详情页面已加载')
    // 页面加载动画
    setTimeout(() => {
      setShowAnimation(true)
    }, 100)
  })

  // ========== 事件处理函数 ==========
  
  /**
   * 处理返回按钮点击
   */
  const handleBack = () => {
    navigateBack()
  }

  /**
   * 处理搜索输入变化
   * @param e - 输入事件对象
   */
  const handleSearchInput = (e: any) => {
    const value = e.detail.value
    setSearchValue(value)
    
    // 实时搜索逻辑
    if (value.trim()) {
      performSearch(value.trim())
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }

  /**
   * 执行搜索功能
   * @param query - 搜索关键词
   */
      const performSearch = async (query: string) => {
      setIsSearching(true)
      setIsLoading(true)

      try {
        const key = '你自己的高德Web服务key'
        const city = '上海' // 可选，根据定位或默认城市
        const url = `https://restapi.amap.com/v3/assistant/inputtips?key=${key}&keywords=${encodeURIComponent(query)}&city=${city}&citylimit=true`

        const res = await fetch(url)
        const data = await res.json()

        if (data.status === '1' && data.tips) {
          const results: AddressItem[] = data.tips
            .filter((item: any) => item.location) // 过滤掉无坐标的项
            .map((item: any, index: number) => ({
              id: `amap_${index}`,
              name: item.name || '',
              address: item.address || item.district || '',
              distance: '', // 高德未直接提供距离，这里可后续通过定位计算
              latitude: Number(item.location.split(',')[1]),
              longitude: Number(item.location.split(',')[0]),
            }))
          setSearchResults(results)
        } else {
          setSearchResults([])
        }
      } catch (error) {
        console.error('高德搜索失败:', error)
        showToast({
          title: '地址搜索失败，请重试',
          icon: 'none',
          duration: 2000
        })
      } finally {
        setIsLoading(false)
      }
    }


  /**
   * 处理地址分类选择
   * @param categoryId - 分类ID
   */
  const handleCategorySelect = (categoryId: string) => {
    if (activeCategory === categoryId) {
      setActiveCategory('') // 取消选中
    } else {
      setActiveCategory(categoryId) // 选中新分类
      
      // 添加触觉反馈
      const category = ADDRESS_CATEGORIES.find(cat => cat.id === categoryId)
      if (category) {
        showToast({ 
          title: `已选择${category.label}`, 
          icon: 'none',
          duration: 1000
        })
      }
    }
  }

  /**
   * 处理地址项选择
   * @param address - 选择的地址对象
   */
  const handleAddressSelect = (address: AddressItem) => {
    console.log('选中地址:', address)
    
    showToast({
      title: `已选择: ${address.name}`,
      icon: 'success',
      duration: 1500
    })

    // 延迟返回上一页
    setTimeout(() => {
      navigateBack({
        delta: 1
      })
    }, 1500)
  }

  /**
   * 清空搜索内容
   */
  const handleClearSearch = () => {
    setSearchValue('')
    setSearchResults([])
    setIsSearching(false)
  }

  /**
   * 处理定位按钮点击
   */
  const handleLocate = () => {
    showToast({
      title: '正在定位...',
      icon: 'loading',
      duration: 2000
    })
    
    // 模拟定位过程
    setTimeout(() => {
      showToast({
        title: '定位成功',
        icon: 'success',
        duration: 1500
      })
    }, 2000)
  }

  // ========== 渲染函数 ==========
  
  /**
   * 渲染地址列表项
   * @param address - 地址对象
   * @param showDistance - 是否显示距离
   */
  const renderAddressItem = (address: AddressItem, showDistance: boolean = true) => (
    <View
      key={address.id}
      className="modern-address-item"
      onClick={() => handleAddressSelect(address)}
    >
      <View className="address-item-content">
        <View className="address-icon-wrapper">
          <View className="address-icon-bg">
            <AtIcon value="map-pin" size="14" color="#fff" />
          </View>
        </View>
        
        <View className="address-info">
          <Text className="address-name">{address.name}</Text>
          <Text className="address-detail">{address.address}</Text>
        </View>
        
        {showDistance && (
          <View className="address-meta">
            <View className="distance-badge">
              <Text className="distance-text">{address.distance}</Text>
            </View>
            <View className="share-btn">
              <AtIcon value="share" size="12" color="#999" />
            </View>
          </View>
        )}
      </View>
      
      <View className="address-item-divider" />
    </View>
  )

  // ========== 主渲染 ==========
  return (
    <View className={classnames('modern-address-page', { 'show-animation': showAnimation })}>
      {/* 现代化头部导航栏 */}
      <View className="modern-header">
        <View className="header-content">
          <View className="header-left" onClick={handleBack}>
            <AtIcon value="chevron-left" size="20" color="#1F2937" />
          </View>
          
          <Text className="header-title">选择地址</Text>
          
          <View className="header-right">
            <View className="header-action" onClick={handleLocate}>
              <AtIcon value="navigation" size="16" color="#1F2937" />
            </View>
            <View className="header-action">
              <AtIcon value="more" size="16" color="#1F2937" />
            </View>
          </View>
        </View>
      </View>

      {/* 顶部城市定位模块移除，保持导航与内容一体化 */}

      {/* 现代化搜索卡片 */}
      <View className="modern-search-card">
        {/* 搜索输入区域 */}
        <View className="search-section">
          <View className="search-input-container">
            <AtIcon value="search" size="16" color="#9CA3AF" className="search-icon" />
            <Input
              className="search-input"
              placeholder="你要到哪里"
              value={searchValue}
              onInput={handleSearchInput}
              placeholderClass="search-placeholder"
            />
            {searchValue && (
              <View className="clear-btn" onClick={handleClearSearch}>
                <AtIcon value="close-circle" size="16" color="#D1D5DB" />
              </View>
            )}
            <View className="locate-btn-container" onClick={handleLocate}>
              <AtIcon value="navigation" size="16" color="#1F2937" />
            </View>
          </View>
        </View>

        {/* 现代化分类标签：当分类存在时才渲染 */}
        {ADDRESS_CATEGORIES.length > 0 && (
          <View className="category-section">
            <View className="category-tabs">
              {ADDRESS_CATEGORIES.map((category) => (
                <View
                  key={category.id}
                  className={classnames('category-tab', {
                    'active': activeCategory === category.id
                  })}
                  onClick={() => handleCategorySelect(category.id)}
                  style={{
                    '--category-color': category.color
                  } as any}
                >
                  <AtIcon value={category.icon} size="14" />
                  <Text className="category-label">{category.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 主要内容区域 */}
      <View className="modern-content">
        {/* 搜索结果 */}
        {isSearching && (
          <View className="content-card search-results">
            <View className="card-header">
              <AtIcon value="search" size="16" color="#1677FF" />
              <Text className="card-title">搜索结果</Text>
            </View>
            
            {isLoading ? (
              <View className="loading-container">
                <View className="loading-spinner" />
                <Text className="loading-text">搜索中...</Text>
              </View>
            ) : (
              <View className="card-body">
                {searchResults.length > 0 ? (
                  searchResults.map((address) => renderAddressItem(address))
                ) : (
                  <View className="empty-state">
                    <AtIcon value="search" size="32" color="#D1D5DB" />
                    <Text className="empty-text">没有找到相关地址</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* 非搜索状态下的内容 */}
        {!isSearching && (
          <View className="default-content">
            {/* 历史地点卡片 */}
            {historyLocations.length > 0 && (
              <View className="content-card history-card">
                <View className="card-header">
                  <AtIcon value="clock" size="16" color="#FF6B35" />
                  <Text className="card-title">历史地点</Text>
                </View>
                <View className="card-body">
                  {historyLocations.map((address) => renderAddressItem(address))}
                </View>
              </View>
            )}

            {/* 推荐地点卡片 */}
            <View className="content-card recommend-card">
              <View className="card-header">
                <AtIcon value="bookmark" size="16" color="#1677FF" />
                <Text className="card-title">推荐地点</Text>
              </View>
              <View className="card-body">
                {recommendLocations.map((address) => renderAddressItem(address))}
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

import { View, Text, Image, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { useLoad } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import classnames from 'classnames'
import './index.scss'

// 导入组件
import Fab from '../../components/Fab'

// 模拟用户数据
const mockUserData = {
  userId: 1,
  username: '张先生',
  phone: '138****5678',
  balance: 268.50,
  creditScore: 98,
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  memberLevel: 'VIP',
  totalTrips: 156,
  totalDistance: 2840,
  carbonSaved: 142.5,
  citiesLit: 18,
  joinDate: '2023-06-15'
}

// 快捷功能数据
const quickActions = [
  { id: 'orders', name: '我的订单', icon: 'list', color: '#1677FF' },
  { id: 'trips', name: '行程记录', icon: 'clock', color: '#52c41a' },
  { id: 'coupons', name: '优惠券', icon: 'tags', color: '#ff4d4f' },
  { id: 'settings', name: '设置', icon: 'settings', color: '#722ed1' }
]

// 安全设置选项
const securityOptions = [
  { id: 'security', name: '安全设置', icon: 'lock', desc: '密码、手机号等' },
  { id: 'privacy', name: '隐私设置', icon: 'eye', desc: '个人信息保护' },
  { id: 'help', name: '帮助中心', icon: 'help', desc: '常见问题解答' },
  { id: 'about', name: '关于我们', icon: 'heart', desc: '了解更多信息' }
]

export default function Home() {
  const [pageLoaded, setPageLoaded] = useState(false)
  const [userData, setUserData] = useState(mockUserData)

  useLoad(() => {
    console.log('Home page loaded.')
    setTimeout(() => setPageLoaded(true), 300)
  })

  // 获取信用分颜色
  const getCreditScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a'
    if (score >= 70) return '#faad14'
    return '#ff4d4f'
  }

  // 获取会员等级颜色
  const getMemberLevelColor = (level: string) => {
    switch (level) {
      case 'VIP': return '#722ed1'
      case 'GOLD': return '#faad14'
      case 'SILVER': return '#8c8c8c'
      default: return '#1677FF'
    }
  }

  // 处理快捷功能点击
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'orders':
        Taro.navigateTo({ url: '/pages/order/index' })
        break
      case 'trips':
        console.log('查看行程记录')
        break
      case 'coupons':
        console.log('查看优惠券')
        break
      case 'settings':
        console.log('打开设置')
        break
    }
  }

 // 处理安全设置点击
 const handleSecurityOption = (optionId: string) => {
   console.log('点击安全选项:', optionId)
 }

  // 处理余额详情
  const handleBalanceDetail = () => {
    console.log('查看余额详情')
  }

  // 返回到 Ride 页面（保持 Ride 页面唯一实例）：优先后退到历史中的 Ride，否则重启到 Ride
  const handleBack = () => {
    try {
      const pages: any[] = (Taro.getCurrentPages?.() || []) as any[]
      let rideIndex = -1
      for (let i = pages.length - 1; i >= 0; i--) {
        const route = pages[i]?.route || ''
        if (route.includes('ride/index')) {
          rideIndex = i
          break
        }
      }
      if (rideIndex !== -1) {
        const delta = (pages.length - 1) - rideIndex
        if (delta > 0) {
          Taro.navigateBack({ delta })
          return
        }
      }
      // 栈中没有 Ride 或无法后退，使用 reLaunch 保证唯一实例
      Taro.reLaunch({ url: '/pages/ride/index' })
    } catch (err) {
      console.warn('返回 Ride 页面失败，尝试重启', err)
     Taro.reLaunch({ url: '/pages/ride/index' })
   }
  }

  return (
    <View className={classnames('home-page', { 'page-loaded': pageLoaded })}>
      {/* 顶部标题与返回箭头 */}
      <View className='home-header'>
        <View className='header-content'>
          <View className='header-left' onClick={handleBack}>
            <AtIcon value='chevron-left' size='20' color='#1F2937' />
          </View>
          <Text className='header-title'>个人主页</Text>
        </View>
      </View>

      <View className='card user-info-card'>
        {/* 顶部：头像 + 用户名/手机号 与右侧信用分 */}
        <View className='user-top-row'>
          <View className='user-info-left'>
            <View className='avatar-container'>
              <View className='avatar-circle'>
                <AtIcon value='user' size='24' className='avatar-icon' />
              </View>
            </View>
            <View className='user-details'>
              <Text className='user-name'>{userData.username}</Text>
              <Text className='user-phone'>{userData.phone}</Text>
            </View>
          </View>
          <View className='user-info-right'>
            <View className='credit-score-badge'>
              <AtIcon value='check-circle' size='14' color={getCreditScoreColor(userData.creditScore)} />
              <Text className='credit-score-text' style={{ color: getCreditScoreColor(userData.creditScore) }}>信用分 {userData.creditScore}</Text>
            </View>
          </View>
        </View>

        {/* 底部：三项统计一排显示 */}
        <View className='user-stats-row'>
          <View className='stat-item'>
            <Text className='stat-value'>{userData.totalTrips}</Text>
            <Text className='stat-label'>总行程</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{userData.totalDistance}</Text>
            <Text className='stat-label'>总里程 (km)</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{userData.carbonSaved}</Text>
            <Text className='stat-label'>减碳量 (kg)</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{userData.citiesLit}</Text>
            <Text className='stat-label'>点亮城市</Text>
          </View>
        </View>
      </View>

      {/* 快捷功能区 */}
      <View className='card quick-actions-card'>
        <View className='quick-actions-grid'>
          {quickActions.map(action => (
            <View 
              key={action.id}
              className='quick-action-item'
              onClick={() => handleQuickAction(action.id)}
            >
              <View 
                className='action-icon'
                style={{ backgroundColor: action.color }}
              >
                <AtIcon value={action.icon} size='22' color={action.color} />
              </View>
              <Text className='action-name'>{action.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 安全与设置 */}
      <View className='card security-card'>
        <View className='security-options'>
          {securityOptions.map(option => (
            <View 
              key={option.id}
              className='security-option-item'
              onClick={() => handleSecurityOption(option.id)}
            >
              <View className='option-left'>
                <View className='option-icon-wrapper'>
                  <AtIcon value={option.icon} size='20' className='option-icon' />
                </View>
                <View className='option-content'>
                  <Text className='option-name'>{option.name}</Text>
                  <Text className='option-desc'>{option.desc}</Text>
                </View>
              </View>
              <AtIcon value='chevron-right' size='18' className='option-arrow' />
            </View>
          ))}
        </View>
      </View>

      {/* 悬浮按钮 */}
      <Fab />
    </View>
  )
}
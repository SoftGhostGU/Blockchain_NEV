import { View, Text, Image, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { useLoad } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import classnames from 'classnames'
import UserAvatar from './components/UserAvatar'
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
  { id: 'privacy', name: '隐私设置', icon: 'eye-close', desc: '个人信息保护' },
  { id: 'help', name: '帮助中心', icon: 'help', desc: '常见问题解答' },
  { id: 'about', name: '关于我们', icon: 'heart', desc: '了解更多信息' }
]

export default function Home() {
  const [pageLoaded, setPageLoaded] = useState(false)
  const [userData, setUserData] = useState(mockUserData)

  useLoad(() => {
    console.log('Home page loaded.')
    setTimeout(() => setPageLoaded(true), 300)
    // 这里可以调用API获取真实用户数据
    // fetchUserProfile()
  })

  // 获取信用分颜色
  const getCreditScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a' // 绿色
    if (score >= 70) return '#faad14' // 黄色
    return '#ff4d4f' // 红色
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

  // 处理充值
  const handleRecharge = () => {
    console.log('充值')
  }

  // 处理余额详情
  const handleBalanceDetail = () => {
    console.log('查看余额详情')
  }

  return (
    <View className={classnames('home-page', { 'page-loaded': pageLoaded })}>
      {/* 页面标题 */}
      <View className='page-header'>
        <Text className='page-title'>个人中心</Text>
      </View>

      {/* 用户信息卡片 */}
      <View className='card user-info-card'>
        <View className='user-info-container'>
          {/* 左侧：头像 + 用户基础信息 */}
          <View className='user-left-section'>
            <UserAvatar 
              src={userData.avatar} 
              size='large'
              onClick={() => handleQuickAction('profile')}
            />
            <View className='user-basic-info'>
              {/* 用户名 */}
              <Text className='username'>{userData.username}</Text>
              {/* 手机号和会员信息并排 */}
              <View className='user-details-row'>
                <Text className='phone'>{userData.phone}</Text>
                <View 
                  className='member-badge'
                  style={{ backgroundColor: getMemberLevelColor(userData.memberLevel) }}
                >
                  <Text className='member-text'>{userData.memberLevel}</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* 右侧：信用分独立区域 */}
          <View className='user-right-section'>
            <View className='credit-score-container'>
              <AtIcon 
                value='check-circle' 
                size='18' 
                color={getCreditScoreColor(userData.creditScore)}
              />
              <Text 
                className='credit-score-text'
                style={{ color: getCreditScoreColor(userData.creditScore) }}
              >
                信用分 {userData.creditScore}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 账户余额卡片 */}
      <View className='card balance-card'>
        <View className='card-header'>
          <View className='header-left'>
            <AtIcon value='credit-card' size='20' className='header-icon' />
            <Text className='header-title'>账户余额</Text>
          </View>
          <Button 
            className='recharge-btn'
            size='mini'
            type='primary'
            onClick={handleRecharge}
          >
            充值
          </Button>
        </View>
        
        <View className='balance-content'>
          <Text className='balance-amount'>¥{userData.balance.toFixed(2)}</Text>
          <Button 
            className='balance-detail-btn'
            size='mini'
            plain
            onClick={handleBalanceDetail}
          >
            查看明细
          </Button>
        </View>
      </View>

      {/* 快捷功能区 */}
      <View className='card quick-actions-card'>
        <View className='card-header'>
          <View className='header-left'>
            <AtIcon value='lightning' size='20' className='header-icon' />
            <Text className='header-title'>快捷功能</Text>
          </View>
        </View>
        
        <View className='quick-actions-grid'>
          {quickActions.map(action => (
            <View 
              key={action.id}
              className='quick-action-item'
              onClick={() => handleQuickAction(action.id)}
            >
              <View 
                className='action-icon'
                style={{ backgroundColor: `${action.color}15`, color: action.color }}
              >
                <AtIcon value={action.icon} size='24' />
              </View>
              <Text className='action-name'>{action.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 统计数据卡片 */}
      <View className='card stats-card'>
        <View className='card-header'>
          <View className='header-left'>
            <AtIcon value='analytics' size='20' className='header-icon' />
            <Text className='header-title'>我的数据</Text>
          </View>
        </View>
        
        <View className='stats-grid'>
          <View className='stat-item'>
            <Text className='stat-value'>{userData.totalTrips}</Text>
            <Text className='stat-label'>总行程</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{userData.totalDistance}km</Text>
            <Text className='stat-label'>总里程</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{userData.carbonSaved}kg</Text>
            <Text className='stat-label'>减碳量</Text>
          </View>
        </View>
      </View>

      {/* 安全与设置 */}
      <View className='card security-card'>
        <View className='card-header'>
          <View className='header-left'>
            <AtIcon value='shield-check' size='20' className='header-icon' />
            <Text className='header-title'>安全与设置</Text>
          </View>
        </View>
        
        <View className='security-options'>
          {securityOptions.map(option => (
            <View 
              key={option.id}
              className='security-option-item'
              onClick={() => handleSecurityOption(option.id)}
            >
              <View className='option-left'>
                <AtIcon value={option.icon} size='20' className='option-icon' />
                <View className='option-content'>
                  <Text className='option-name'>{option.name}</Text>
                  <Text className='option-desc'>{option.desc}</Text>
                </View>
              </View>
              <AtIcon value='chevron-right' size='16' className='option-arrow' />
            </View>
          ))}
        </View>
      </View>

      {/* 悬浮按钮 */}
      <Fab />
    </View>
  )
}
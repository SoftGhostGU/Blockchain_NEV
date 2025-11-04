// src/pages/order/index.tsx
import { View, Text, Image, Button, Textarea } from '@tarojs/components'
import { useRouter, showToast, navigateBack, reLaunch, getCurrentPages } from '@tarojs/taro'
import { useState, useMemo, useEffect } from 'react'
import { AtIcon, AtRate } from 'taro-ui'
import classnames from 'classnames'
// 悬浮球仅在打车页面显示，订单页不渲染
import VehicleDetailModal from '../../components/VehicleDetailModal'
import { useRideStore } from '../../store/ride'
import './index.scss'
import OrderMap from './components/OrderMap'

export default function OrderStatus() {
  const router = useRouter()
  const { orderId } = router.params || {}

  // ---------- 从 store 获取订单 ----------
  const order = useRideStore((s) =>
    orderId ? s.getOrderById(orderId) : s.getActiveOrder()
  )
  const updateOrder = useRideStore((s) => s.updateOrder)
  const cancelOrder = useRideStore((s) => s.cancelOrder)
  const markOrderCompleted = useRideStore((s) => s.markOrderCompleted)

  // 本地 UI 状态
  const [rating, setRating] = useState(order?.rating ?? 0)
  const [commentText, setCommentText] = useState(order?.reviewText ?? '')
  const hasReviewed = !!order?.reviewSubmittedAt
  const [isEditing, setIsEditing] = useState(!hasReviewed)

  useEffect(() => {
    setRating(order?.rating ?? 0)
    setCommentText(order?.reviewText ?? '')
    // 如果已提交过，则默认不在编辑态
    setIsEditing(!order?.reviewSubmittedAt)
  }, [order?.orderId])
  const [showVehicleDetail, setShowVehicleDetail] = useState(false)

  // 状态步骤
  const statusSteps = [
    { id: 'accepted', text: '已接单' },
    { id: 'going_to_destination', text: '前往接车点' },
    { id: 'in_progress', text: '行程中' },
    { id: 'arriving', text: '到达目的地' },
    { id: 'completed', text: '已完成' },
  ]
  // 展示用步骤（移除“已完成”标签）
  const displaySteps = statusSteps.filter((s) => s.id !== 'completed')
  const currentStatusIndex = useMemo(() => {
    const idx = statusSteps.findIndex((s) => s.id === order?.status)
    return idx >= 0 ? idx : 0
  }, [order?.status])
  const activeIndexForDisplay = Math.min(currentStatusIndex, displaySteps.length - 1)

  // 订单状态文案：进行中/已完成
  const statusText = order.status === 'completed' ? '已完成' : '进行中'

  // ---------- 事件 ----------
  const handleRatingChange = (value: number) => {
    setRating(value)
    if (order) {
      updateOrder(order.orderId, { rating: value })
    }
  }

  const handleContactDriver = () => {
    if (!order?.driver) return
    console.log('联系司机', order.driver.phone)
  }

  const handleShareTrip = () => {
    if (!order) return
    console.log('分享行程', order.orderId)
  }

  const handleEmergency = () => {
    console.log('紧急求助')
  }

  const handleVehicleDetailClick = () => setShowVehicleDetail(true)
  const handleCloseVehicleDetail = () => setShowVehicleDetail(false)

  // 评分提示文案
  const ratingHint = useMemo(() => {
    switch (rating) {
      case 1: return '很差'
      case 2: return '较差'
      case 3: return '一般'
      case 4: return '良好'
      case 5: return '非常好'
      default: return '点击星星进行评分'
    }
  }, [rating])

  const handleEditToggle = () => setIsEditing((v) => !v)

  const handleSubmitReview = async () => {
    if (!order) return
    if (!rating) {
      showToast({ title: '请先选择评分', icon: 'none' })
      return
    }
    // H5 环境使用 showToast 模拟加载态，避免 showLoading 兼容问题
    showToast({ title: '提交中...', icon: 'loading' })
    // 模拟后端提交
    setTimeout(() => {
      const ts = new Date().toISOString()
      updateOrder(order.orderId, {
        rating,
        reviewText: commentText?.trim() || '',
        reviewSubmittedAt: ts,
      })
      showToast({ title: '评价已提交', icon: 'success', duration: 1200 })
      setIsEditing(false)
    }, 800)
  }

  // 返回到 Ride 页面（更稳健：优先后退到栈中的 Ride，否则重启到 Ride）
  const handleBack = () => {
    try {
      const pages: any[] = (getCurrentPages?.() || []) as any[]
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
          navigateBack({ delta })
          return
        }
      }
      // 栈中没有 Ride 或无法后退，使用 reLaunch 保证唯一实例
      reLaunch({ url: '/pages/ride/index' })
    } catch (err) {
      console.warn('返回 Ride 页面失败，尝试重启', err)
      reLaunch({ url: '/pages/ride/index' })
    }
  }

  if (!order) {
    return (
      <View className="order-status-page">
        <Text>订单不存在或已被移除</Text>
      </View>
    )
  }

  // ---------- 渲染 ----------
  return (
    <View className="order-status-page">
      {/* 顶部标题与返回箭头（仿照个人主页） */}
      <View className='order-header'>
        <View className='header-content'>
          <View className='header-left' onClick={handleBack}>
            <AtIcon value='chevron-left' size='20' color='#1F2937' />
          </View>
          <Text className='header-title'>订单详情</Text>
        </View>
      </View>
      {/* 1. 地图 */}
      <View className="card map-card">
        <OrderMap startLocation={order.startLocation} endLocation={order.endLocation} />
      </View>

      {/* 2. 车辆/司机 */}
      <View className="card driver-info-card" onClick={handleVehicleDetailClick}>
        <Image
          className="car-image"
          src={order.vehicle?.imageUrl || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'}
          mode="aspectFill"
        />
        <View className="driver-details">
          <Text className="license-plate">{order.vehicle?.plateNumber || '未知车牌'}</Text>
          <View className="info-row">
            <AtIcon value="car" size="14" className="row-icon" />
            <Text className="row-text">{order.vehicle?.type || '未知车型'}</Text>
          </View>
          <View className="info-row">
            <AtIcon value="user" size="16" className="row-icon" />
            <Text className="row-text">车主：{order.driver?.name || '未知'}</Text>
          </View>
          <View className="info-row">
            <AtIcon value="phone" size="16" className="row-icon" />
            <Text className="row-text">{order.driver?.phone || '未提供'}</Text>
          </View>
        </View>
        <View className="credit-score">
          <AtIcon value="check-circle" size="14" className="credit-icon" />
          <Text>信用分 {order.driver?.creditScore ?? '—'}</Text>
        </View>
      </View>

      {/* 3. 订单状态 */}
      <View className="card order-status-card">
        <View className="order-info-header">
          <View className="order-meta">
            <Text className="order-number">订单编号：{order.orderNumber}</Text>
            <Text className="order-time">发起时间：{order.createdAt}</Text>
            <Text className="order-end-time">
              结束时间：{order.completedAt || '未到达终点'}
            </Text>
          </View>
        </View>
        <View className="card-header">
          <AtIcon value="reload" size="20" className="header-icon" />
          <Text className="header-title">订单状态</Text>
          <Text className="status-text">{statusText}</Text>
        </View>
        <View className="status-progress-bar">
          <View className="progress-track">
            <View
              className="progress-fill"
              style={{
                width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
              }}
            />
          </View>
          <View className="status-steps">
            {displaySteps.map((step, index) => (
              <View
                key={step.id}
                className={classnames('step', {
                  active: index <= activeIndexForDisplay,
                })}
              >
                <Text>{step.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 4. 行程信息 */}
      <View className="card trip-info-card">
        <View className="card-header">
          <AtIcon value="file-generic" size="20" className="header-icon" />
          <Text className="header-title">行程信息</Text>
        </View>
        <View className="trip-details">
          <View className="trip-row">
            <View className="dot start" />
            <Text>起点：{order.startLocation?.landmark || '未知'}</Text>
          </View>
          <View className="trip-row">
            <View className="dot end" />
            <Text>终点：{order.endLocation?.landmark || '未知'}</Text>
          </View>
          <View className="trip-row eth-info">
            <AtIcon value="money" size="18" className="eth-icon" />
            <Text className="eth-value">￥{order.price?.estimatedPrice || '--'}</Text>
            <Text className="eta-text">
              预计行程时间：{order.price?.estimatedDuration || '--'} 分钟
            </Text>
          </View>
        </View>
      </View>

      {/* 5. 按钮 */}
      <View className="action-buttons">
        <Button className="action-btn" onClick={handleContactDriver}>
          <AtIcon value="phone" size="20" />
          <Text>联系车主</Text>
        </Button>
        <Button className="action-btn" onClick={handleShareTrip}>
          <AtIcon value="share" size="20" />
          <Text>分享行程</Text>
        </Button>
        <Button
          className="action-btn emergency"
          onClick={handleEmergency}
        >
          <AtIcon value="alert-circle" size="20" />
          <Text>紧急求助</Text>
        </Button>
      </View>

      {/* 6. 行程评价 */}
      <View
        className={classnames('card', 'rating-card', {
          warm: (order?.rating ?? rating) === 5,
          cool: (order?.rating ?? rating) <= 2,
        })}
      >
        <View className="card-header">
          <Text className="header-title">行程评价</Text>
          {(order?.rating ?? rating) <= 2 && (
            <Text className="complaint-tag">投诉</Text>
          )}
        </View>

        <View className="rating-row">
          <AtRate value={rating} max={5} onChange={handleRatingChange} />
          <Text className="rating-hint">{ratingHint}</Text>
        </View>

        {isEditing ? (
          <View className="review-editor">
            <Textarea
              className="review-textarea"
              value={commentText}
              onInput={(e) => setCommentText((e?.detail as any)?.value ?? '')}
              placeholder="写下本次行程的感受（服务态度、车辆环境等）"
              maxlength={300}
              autoHeight={true}
              style={{ maxHeight: '80px' }}
            />
            {!!order?.reviewSubmittedAt && (
              <Text className="submit-time">
                已于 {new Date(order.reviewSubmittedAt!).toLocaleString()} 提交
              </Text>
            )}
            <Button className="submit-btn" onClick={handleSubmitReview}>提交评价</Button>
          </View>
        ) : (
          <View className="review-display">
            <Text className="review-content">{order?.reviewText || '（无文字评价）'}</Text>
            <Text className="submit-time">
              已于 {order?.reviewSubmittedAt ? new Date(order.reviewSubmittedAt).toLocaleString() : '--'} 提交
            </Text>
            <Button className="edit-btn" onClick={handleEditToggle}>编辑评价</Button>
          </View>
        )}
      </View>

      {/* 悬浮球仅在打车页面显示 */}

      {/* 车辆详情弹窗 */}
      <VehicleDetailModal visible={showVehicleDetail} onClose={handleCloseVehicleDetail} />
    </View>
  )
}

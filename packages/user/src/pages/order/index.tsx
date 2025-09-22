
// import { View, Text, Image, Button } from '@tarojs/components'
// import { useState } from 'react'
// import { AtIcon, AtRate } from 'taro-ui'
// import classnames from 'classnames'
// import './index.scss'
// import Fab from '../../components/Fab'
// import VehicleDetailModal from '../../components/VehicleDetailModal'

// export default function OrderStatus() {
//   // 模拟订单状态，您可以从后端获取并更新
//   const [status, setStatus] = useState('in_progress') // 'accepted', 'going_to_destination', 'in_progress', 'arriving'
//   const [rating, setRating] = useState(0)
//   const [showVehicleDetail, setShowVehicleDetail] = useState(false)

//   const statusSteps = [
//     { id: 'accepted', text: '已接单' },
//     { id: 'going_to_destination', text: '前往接车点' },
//     { id: 'in_progress', text: '行程中' },
//     { id: 'arriving', text: '到达目的地' },
//   ]

//   const currentStatusIndex = statusSteps.findIndex(step => step.id === status)

//   const handleRatingChange = (value: number) => {
//     setRating(value)
//   }

//   const handleContactDriver = () => {
//     // 联系司机逻辑
//     console.log('联系司机')
//   }

//   const handleShareTrip = () => {
//     // 分享行程逻辑
//     console.log('分享行程')
//   }

//   const handleEmergency = () => {
//     // 紧急求助逻辑
//     console.log('紧急求助')
//   }

//   const handleVehicleDetailClick = () => {
//     setShowVehicleDetail(true)
//   }

//   const handleCloseVehicleDetail = () => {
//     setShowVehicleDetail(false)
//   }

//   return (
//     <View className='order-status-page'>
//       {/* 1. 地图图片 - 放在最上面 */}
//       <View className='card map-card'>
//         <Image
//           className='map-image'
//           src='https://developers.google.com/static/codelabs/maps-platform/maps-platform-101-js/img/e52623cb8578d625.png?hl=zh-cn'
//           mode='aspectFill'
//         />
//       </View>

//       {/* 2. 车型信息 - 放在图片下方 */}
//       <View className='card driver-info-card' onClick={handleVehicleDetailClick}>
//         <Image
//           className='car-image'
//           src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'
//           mode='aspectFill'
//         />
//         <View className='driver-details'>
//           <Text className='license-plate'>沪A 12345</Text>
          
//           <View className='info-row'>
//           <View className='row-icon car-icon'>
//             <svg viewBox="0 0 1024 1024" width="16" height="16">
//           <path d="M912.832 467.104h-22.272l-6.624-22.464h60.928a32 32 0 1 0 0-64h-79.808l-35.584-120.544C815.168 221.28 771.52 192 728 192H302.592c-43.52 0-87.136 29.28-102.112 70.112l-34.944 118.528H96a32 32 0 0 0 0 64h50.624l-6.624 22.464H128c-35.296 0-64 28.704-64 64v282.944h51.104v34.816a32 32 0 1 0 64 0v-34.816h690.528v34.816a32 32 0 1 0 64 0v-34.816h43.232v-282.944a64.128 64.128 0 0 0-64.032-64zM128 750.016v-104.96h73.792c26.464 0 50.528-16.672 59.872-41.408l24.064-63.712c1.088-2.912 1.216-5.888 1.44-8.832h450.528c0.224 2.944 0.352 5.92 1.44 8.832l24.064 63.648a64.256 64.256 0 0 0 59.872 41.472h89.76v104.96H128z m784.832-168.96l-89.76-0.032-18.848-49.952h108.608v49.984zM218.528 426.944a30.944 30.944 0 0 0 2.816-9.568L261.184 282.24c4.48-12.16 23.52-26.24 41.408-26.24H728c17.888 0 36.928 14.08 40.736 24.192l55.104 186.88H206.72l11.808-40.128z m2.144 104.16l-18.88 49.984H128v-49.984h92.672z" fill="currentColor"/>
//           <path d="M614.752 626.24h-188.64a32 32 0 1 0 0 64h188.64a32 32 0 1 0 0-64z" fill="currentColor"/>
//           </svg>
//           </View>
//             <Text className='row-text'>特斯拉 Model 3</Text>
//           </View>
          
//           <View className='info-row'>
//             <AtIcon value='user' size='16' className='row-icon' />
//             <Text className='row-text'>车主：张先生</Text>
//           </View>
          
//           <View className='info-row'>
//             <AtIcon value='phone' size='16' className='row-icon' />
//             <Text className='row-text'>138 1234 5678</Text>
//           </View>
//         </View>
        
//         <View className='credit-score'>
//           <AtIcon value='check-circle' size='14' className='credit-icon' />
//           <Text>信用分 98</Text>
//         </View>
//       </View>

//       {/* 3. 订单状态 - 放在车型信息下方 */}
//       <View className='card order-status-card'>
//         <View className='order-info-header'>
//           <View className='order-meta'>
//             <Text className='order-number'>订单编号：NEV202401150001</Text>
//             <Text className='order-time'>发起时间：2024-01-15 10:30</Text>
//             <Text className='order-end-time'>结束时间：未到达终点</Text>
//           </View>
//         </View>
//         <View className='card-header'>
//           <AtIcon value='reload' size='20' className='header-icon' />
//           <Text className='header-title'>订单状态</Text>
//           <Text className='status-text'>进行中</Text>
//         </View>
//         <View className='status-progress-bar'>
//           <View className='progress-track'>
//             <View
//               className='progress-fill'
//               style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
//             />
//           </View>
//           <View className='status-steps'>
//             {statusSteps.map((step, index) => (
//               <View
//                 key={step.id}
//                 className={classnames('step', { 'active': index <= currentStatusIndex })}
//               >
//                 <Text>{step.text}</Text>
//               </View>
//             ))}
//           </View>
//         </View>
//         <View className='arrival-time'>
//           <AtIcon value='clock' size='18' className='time-icon' />
//           <Text className='time-label'>预计到达时间</Text>
//           <Text className='time-value'>12:45</Text>
//         </View>
//       </View>

//       {/* 4. 行程信息 - 放在订单状态下方 */}
//       <View className='card trip-info-card'>
//         <View className='card-header'>
//           <AtIcon value='file-generic' size='20' className='header-icon' />
//           <Text className='header-title'>行程信息</Text>
//         </View>
//         <View className='trip-details'>
//           <View className='trip-row'>
//             <View className='dot start' />
//             <Text>起点：浦东新区陆家嘴</Text>
//           </View>
//           <View className='trip-row'>
//             <View className='dot end' />
//             <Text>终点：静安区南京西路</Text>
//           </View>
//           <View className='trip-row eth-info'>
//             <AtIcon value='money' size='18' className='eth-icon' />
//             <Text className='eth-value'>￥35</Text>
//             <Text className='eta-text'>预计行程时间：35分钟</Text>
//           </View>
//         </View>
//       </View>

//       <View className='action-buttons'>
//         <Button className='action-btn' onClick={handleContactDriver}>
//           <AtIcon value='phone' size='20' />
//           <Text>联系车主</Text>
//         </Button>
//         <Button className='action-btn' onClick={handleShareTrip}>
//           <AtIcon value='share' size='20' />
//           <Text>分享行程</Text>
//         </Button>
//         <Button className='action-btn emergency' onClick={handleEmergency}>
//           <AtIcon value='alert-circle' size='20' />
//           <Text>紧急求助</Text>
//         </Button>
//       </View>

//       <View className='card rating-card'>
//         <View className='card-header'>
//           <Text className='header-title'>行程评价</Text>
//           <Text className='complaint-link'>投诉</Text>
//         </View>
//         <AtRate 
//           value={rating} 
//           max={5} 
//           onChange={handleRatingChange}
//         />
//       </View>
//       <Fab />
      
//       {/* 车辆详细信息弹窗 */}
//       <VehicleDetailModal 
//         visible={showVehicleDetail} 
//         onClose={handleCloseVehicleDetail} 
//       />
//     </View>
//   )
// }
// src/pages/order/index.tsx
import { View, Text, Image, Button } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import { useState, useMemo } from 'react'
import { AtIcon, AtRate } from 'taro-ui'
import classnames from 'classnames'
import Fab from '../../components/Fab'
import VehicleDetailModal from '../../components/VehicleDetailModal'
import { useRideStore } from '../../store/ride'
import './index.scss'

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
  const [rating, setRating] = useState(0)
  const [showVehicleDetail, setShowVehicleDetail] = useState(false)

  // 状态步骤
  const statusSteps = [
    { id: 'accepted', text: '已接单' },
    { id: 'going_to_destination', text: '前往接车点' },
    { id: 'in_progress', text: '行程中' },
    { id: 'arriving', text: '到达目的地' },
    { id: 'completed', text: '已完成' },
  ]
  const currentStatusIndex = useMemo(() => {
    const idx = statusSteps.findIndex((s) => s.id === order?.status)
    return idx >= 0 ? idx : 0
  }, [order?.status])

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
      {/* 1. 地图 */}
      <View className="card map-card">
        <Image
          className="map-image"
          src="https://developers.google.com/static/codelabs/maps-platform/maps-platform-101-js/img/e52623cb8578d625.png?hl=zh-cn"
          mode="aspectFill"
        />
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
          <Text className="status-text">
            {statusSteps.find((s) => s.id === order.status)?.text || '未知'}
          </Text>
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
            {statusSteps.map((step, index) => (
              <View
                key={step.id}
                className={classnames('step', {
                  active: index <= currentStatusIndex,
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

      {/* 6. 评价 */}
      <View className="card rating-card">
        <View className="card-header">
          <Text className="header-title">行程评价</Text>
          <Text className="complaint-link">投诉</Text>
        </View>
        <AtRate value={rating} max={5} onChange={handleRatingChange} />
      </View>

      <Fab />

      {/* 车辆详情弹窗 */}
      <VehicleDetailModal visible={showVehicleDetail} onClose={handleCloseVehicleDetail} />
    </View>
  )
}

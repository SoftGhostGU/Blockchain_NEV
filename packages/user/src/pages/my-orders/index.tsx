import { View, Text } from '@tarojs/components'
import Taro, { navigateBack } from '@tarojs/taro'
import { useMemo } from 'react'
import { AtIcon } from 'taro-ui'
import classnames from 'classnames'
import { useRideStore } from '@/store/ride'
import './index.scss'

/**
 * 我的订单页面
 * 功能说明：
 * - 顶部采用与个人主页一致的标题与返回箭头样式；
 * - 展示历史订单（默认筛选“已完成”），每一条订单以卡片形式展示：起点、终点、下单时间；
 * - 卡片右上角显示“已完成”状态以及最终价格；
 * - 点击卡片进入订单详情页（pages/order/index），通过 URL 传递 orderId；
 * - 若暂无订单，显示空状态文案。
 */
export default function MyOrders() {
  // 中文注释：从全局 store 中获取订单列表与筛选能力
  const listOrders = useRideStore((s) => s.listOrders)
  const findOrdersByStatus = useRideStore((s) => s.findOrdersByStatus)

  // 中文注释：仅展示历史已完成订单；如果没有已完成则退化为所有订单
  const completedOrders = findOrdersByStatus('completed')
  const orders = useMemo(() => {
    const base = completedOrders.length > 0 ? completedOrders : listOrders()
    // 中文注释：按下单时间倒序展示，最近的在前
    return base.slice().sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime()
      const tb = new Date(b.createdAt || 0).getTime()
      return tb - ta
    })
  }, [completedOrders, listOrders])

  // 中文注释：将 carTypeId 转换为更友好的中文展示名
  const carTypeName = (id?: string | null) => {
    const map: Record<string, string> = {
      economy: '快车', // 贴近示例截图文案
      comfort: '舒适型',
      luxury: '豪华型',
    }
    if (!id) return '快车'
    return map[id] || '快车'
  }

  // 中文注释：格式化时间为“YYYY年MM月DD日 HH:mm”
  const formatTime = (iso?: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
    return `${d.getFullYear()}年${pad(d.getMonth() + 1)}月${pad(d.getDate())}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  // 中文注释：点击卡片进入订单详情页，传递 orderId
  const goDetail = (orderId: string) => {
    Taro.navigateTo({ url: `/pages/order/index?orderId=${orderId}` })
  }

  // 中文注释：返回上一页（通常是个人主页）；若无历史，降级返回首页
  const handleBack = () => {
    try {
      navigateBack()
    } catch (err) {
      Taro.reLaunch({ url: '/pages/home/index' })
    }
  }

  return (
    <View className={classnames('orders-page')}> 
      {/* 顶部标题与返回箭头，样式与个人主页保持一致 */}
      <View className='orders-header'>
        <View className='header-content'>
          <View className='header-left' onClick={handleBack}>
            <AtIcon value='chevron-left' size='20' color='#1F2937' />
          </View>
          <Text className='header-title'>我的订单</Text>
        </View>
      </View>

      {/* 列表区域 */}
      {orders.length === 0 ? (
        <View className='empty-card'>
          <AtIcon value='list' size='28' color='#D1D5DB' />
          <Text className='empty-text'>暂无历史订单</Text>
        </View>
      ) : (
        <View className='orders-list'>
          {orders.map((o) => (
            <View key={o.orderId} className='order-card' onClick={() => goDetail(o.orderId)}>
              {/* 卡片头部：车型与状态/价格 */}
              <View className='card-header'>
                <View className='left-title'>
                  <AtIcon value='car' size='18' color='#FF6B35' />
                  <Text className='title-text'>{carTypeName(o.carTypeId || undefined)}</Text>
                </View>
                <View className='right-status'>
                  <Text className='status-tag'>{o.status === 'completed' ? '已完成' : '进行中'}</Text>
                  <Text className='price-text'>¥{typeof o.price?.estimatedPrice === 'number' ? o.price!.estimatedPrice.toFixed(2) : '--'}</Text>
                </View>
              </View>

              {/* 卡片主体：起点、终点、时间 */}
              <View className='card-body'>
                <View className='row'>
                  <Text className='label'>起点：</Text>
                  <Text className='value'>{o.startLocation?.landmark || o.startLocation?.address || '未知起点'}</Text>
                </View>
                <View className='row'>
                  <Text className='label'>终点：</Text>
                  <Text className='value'>{o.endLocation?.landmark || o.endLocation?.address || '未知终点'}</Text>
                </View>
                <View className='row'>
                  <Text className='label'>下单时间：</Text>
                  <Text className='value'>{formatTime(o.createdAt)}</Text>
                </View>
              </View>

              {/* 卡片底部：轻提示文案 */}
              <View className='card-footer'>
                <Text className='hint-text'>点击查看订单详情</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
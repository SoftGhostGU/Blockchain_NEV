import React, { useRef } from 'react';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './Fab.scss';
import { useFabStore } from '../store/fab';
import { useRideStore } from '../store/ride';

const FAB_SIZE = 84; // 与样式中保持一致（稍微放大）
const sysInfo = Taro.getSystemInfoSync?.() || { windowWidth: 375, windowHeight: 667 };

const Fab = () => {
  const { position, dragging, setPosition, setDragging } = useFabStore();
  const fabRef = useRef(null);
  const getActiveOrder = useRideStore((s) => s.getActiveOrder);
  const activeOrder = useRideStore((s) => s.orders.find((o) => o.orderId === s.activeOrderId) || null);
  const isOngoing = !!activeOrder && activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled';
  const labelText = isOngoing ? '进行中' : '暂无订单';

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

  // 统一获取视口尺寸：H5 使用 window.innerWidth/innerHeight，其他端回退到 systemInfo
  const getViewport = () => {
    try {
      if (process.env.TARO_ENV === 'h5') {
        // 在 H5 环境，window.innerWidth/innerHeight 是最可靠的视口尺寸
        const width = window.innerWidth;
        const height = window.innerHeight;
        return { width, height };
      }
    } catch (e) {
      // 非 H5 环境或异常时回退
    }
    return { width: sysInfo.windowWidth as number, height: sysInfo.windowHeight as number };
  };

  const handleTouchStart = (_e: any) => {
    setDragging(true);
  };

  const handleTouchMove = (e: any) => {
    if (dragging && e.touches && e.touches[0]) {
      const { clientX, clientY } = e.touches[0];
      const { width, height } = getViewport();
      // 以左上角为定位点，限制不超过页面可视区域
      const newX = clamp(clientX, 0, width - FAB_SIZE);
      const newY = clamp(clientY, 0, height - FAB_SIZE);
      setPosition({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = () => {
    setDragging(false);
    const { width, height } = getViewport();
    // 释放时自动贴边：以 FAB 中心相对屏幕中线判断靠左或靠右
    const screenMid = width / 2;
    const fabCenterX = position.x + FAB_SIZE / 2;
    const targetX = fabCenterX <= screenMid ? 0 : (width - FAB_SIZE);
    // Y 轴保持不变并做一次兜底 clamp
    const clampedY = clamp(position.y, 0, height - FAB_SIZE);
    // 更新全局状态中的位置（会自动持久化）
    setPosition({ x: targetX, y: clampedY });
  };

  const handleClick = () => {
    // 悬浮球仅在打车页出现，这里统一跳转当前进行的订单
    try {
      const activeOrder = getActiveOrder();
      if (!activeOrder) {
        Taro.showToast({ title: '暂无进行中的订单', icon: 'none' });
        return;
      }
      Taro.navigateTo({ url: `/pages/order/index?orderId=${activeOrder.orderId}` });
    } catch (err) {
      Taro.showToast({ title: '跳转失败，请稍后重试', icon: 'none' });
    }
  };

  return (
    <View
      ref={fabRef}
      className={`fab ${dragging ? 'dragging' : ''}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      <View className={`fab-label ${isOngoing ? 'ongoing' : ''}`}>{labelText}</View>
    </View>
  );
};

export default Fab;
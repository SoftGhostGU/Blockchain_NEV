// packages/user/src/pages/ride/components/CarSelectionPopup.tsx
import { View, Text, Button, Image } from '@tarojs/components';
import { useState } from 'react';
import classnames from 'classnames';
import './CarSelectionPopup.scss';

interface Car {
  id: number;
  name: string; // 车型展示名（经济型/舒适型/豪华型）
  price: number;
  time: string;
  plate: string;
  driver: string;
  phone?: string; // 司机手机号（不在弹窗展示，仅用于订单）
  avatar: string;
  model: string; // 车辆型号
  battery: number; // 剩余电量（百分比）
  distance: string; // 距离乘客距离
}

interface CarSelectionPopupProps {
  cars: Car[];
  loading?: boolean; // 异步加载状态
  onClose: () => void;
  onConfirm: (car: any) => void;
}

const CarSelectionPopup = ({ cars, loading = false, onClose, onConfirm }: CarSelectionPopupProps) => {
  const [selectedCar, setSelectedCar] = useState<any>(null);

  const handleSelectCar = (car: any) => {
    setSelectedCar(car);
  };

  const handleConfirm = () => {
    if (selectedCar) {
      onConfirm(selectedCar);
    }
  };

  return (
    <View className='car-selection-popup-overlay'>
      <View className='car-selection-popup-container'>
        {/* Header */}
        <View className='car-selection-popup-header'>
          <Text className='car-selection-popup-title'>选择车辆</Text>
          <View className='car-selection-popup-close' onClick={onClose}>
            ✕
          </View>
        </View>

        {/* Body */}
        <View className='car-selection-popup-body'>
          {loading && (
            <>
              <View className='loading-hint'>正在为您匹配附近车辆…</View>
              {[1,2,3,4].map(i => (
                <View key={i} className='skeleton-card'>
                  <View className='skeleton-avatar skeleton-shimmer'></View>
                  <View className='skeleton-content'>
                    <View className='skeleton-line skeleton-shimmer long'></View>
                    <View className='skeleton-line skeleton-shimmer medium'></View>
                    <View className='skeleton-line skeleton-shimmer medium'></View>
                    <View className='skeleton-line skeleton-shimmer short'></View>
                  </View>
                  <View className='skeleton-right'>
                    <View className='skeleton-line skeleton-shimmer short'></View>
                    <View className='skeleton-line skeleton-shimmer short'></View>
                  </View>
                </View>
              ))}
            </>
          )}

          {!loading && cars.length === 0 && (
            <View className='empty-state'>
              <Text className='empty-title'>暂未获取到车辆</Text>
              <Text className='empty-subtitle'>正在为您协调附近司机，请稍候或更换车型</Text>
            </View>
          )}

          {!loading && cars.length > 0 && cars.map((car) => (
            <View
              key={car.id}
              className={classnames('car-card', { selected: selectedCar?.id === car.id })}
              onClick={() => handleSelectCar(car)}
            >
              <Image src={car.avatar} className='car-avatar' />
              <View className='car-info'>
                <Text className='car-name'>{car.name}</Text>
                <Text className='car-model'>型号: {car.model}</Text>
                <Text className='car-plate'>车牌: {car.plate}</Text>
                <Text className='car-driver'>司机: {car.driver}</Text>
                <View className='metrics-row'>
                  <View className='battery-capsule'>
                    <View className='battery-fill' style={{ width: `${car.battery}%` }}></View>
                    <Text className='battery-text'>{car.battery}%</Text>
                  </View>
                </View>
              </View>
              <View className='car-price-time'>
                <Text className='car-price'>¥{car.price}</Text>
                <Text className='car-time'>{car.time}</Text>
                <Text className='car-distance-info'>距乘客: {car.distance}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View className='car-selection-popup-footer'>
          <Button
            className={classnames('confirm-button', { disabled: !selectedCar || loading || cars.length === 0 })}
            onClick={handleConfirm}
            disabled={!selectedCar || loading || cars.length === 0}
          >
            确认选择
          </Button>
        </View>
      </View>
    </View>
  );
};

export default CarSelectionPopup;

import React, { useEffect, useRef } from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'
import type { Location } from '../../../api/type'

type OrderMapProps = {
  startLocation?: Location | null
  endLocation?: Location | null
  driverLocation?: Location | null
}

const OrderMap: React.FC<OrderMapProps> = ({ startLocation, endLocation, driverLocation }) => {
  const mapRef = useRef<any>(null)
  const startMarkerRef = useRef<any>(null)
  const endMarkerRef = useRef<any>(null)
  const driverMarkerRef = useRef<any>(null)
  const drivingRef = useRef<any>(null)

  useEffect(() => {
    ;(window as any)._AMapSecurityConfig = {
      securityJsCode: '847370c4fd8230a39278ac95e450d9c6',
    }

    AMapLoader.load({
      key: '2cbfc31f5eae1f3dd09f26255f115449',
      version: '2.0',
      plugins: ['AMap.Driving'], // 展示型地图：仅加载驾车路线
    })
      .then((AMap) => {
        const center = startLocation && typeof startLocation.longitude === 'number' && typeof startLocation.latitude === 'number'
          ? [startLocation.longitude, startLocation.latitude]
          : [121.40942550051864, 31.228483165793406]

        const map = new AMap.Map('orderMapContainer', {
          zoom: 15,
          center,
          pitch: 0,
          viewMode: '2D',
          rotateEnable: false,
          pitchEnable: false,
          zooms: [2, 20],
          logoPosition: 'RT',
          copyrightPosition: 'RT',
        })
        mapRef.current = map

        drivingRef.current = new AMap.Driving({
          map,
          policy: AMap.DrivingPolicy.LEAST_TIME,
        })

        // 初始化已有的起终点/司机标记
        if (startLocation && isValidLoc(startLocation)) {
          const lnglat = new AMap.LngLat(startLocation.longitude, startLocation.latitude)
          startMarkerRef.current = new AMap.Marker({
            position: lnglat,
            icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
            offset: new AMap.Pixel(-13, -26),
            clickable: false,
            draggable: false,
          })
          map.add(startMarkerRef.current)
        }

        if (endLocation && isValidLoc(endLocation)) {
          const lnglat = new AMap.LngLat(endLocation.longitude, endLocation.latitude)
          endMarkerRef.current = new AMap.Marker({
            position: lnglat,
            icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
            offset: new AMap.Pixel(-13, -26),
            clickable: false,
            draggable: false,
          })
          map.add(endMarkerRef.current)
          map.setCenter(lnglat)
        }

        if (driverLocation && isValidLoc(driverLocation)) {
          const lnglat = new AMap.LngLat(driverLocation.longitude, driverLocation.latitude)
          driverMarkerRef.current = new AMap.Marker({
            position: lnglat,
            icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
            offset: new AMap.Pixel(-13, -26),
            label: {
              content: '司机',
              direction: 'right',
              offset: new AMap.Pixel(10, -20),
            },
            clickable: false,
            draggable: false,
          })
          map.add(driverMarkerRef.current)
        }

        // 初次加载时如起终点齐全则绘制路线
        if (startLocation && endLocation && isValidLoc(startLocation) && isValidLoc(endLocation)) {
          const startLngLat = new AMap.LngLat(startLocation.longitude, startLocation.latitude)
          const endLngLat = new AMap.LngLat(endLocation.longitude, endLocation.latitude)
          drivingRef.current?.search(startLngLat, endLngLat, () => {})
        }
      })
      .catch((e) => {
        console.error('OrderMap init error:', e)
      })

    return () => {
      // 清理地图实例
      try {
        drivingRef.current?.clear()
        mapRef.current?.destroy()
      } catch {}
      mapRef.current = null
      startMarkerRef.current = null
      endMarkerRef.current = null
      driverMarkerRef.current = null
      drivingRef.current = null
    }
  }, [])

  // 响应起终点更新绘制路线与标记
  useEffect(() => {
    const AMap = (window as any).AMap
    if (!AMap || !mapRef.current) return

    // 更新/创建起点标记
    if (startLocation && isValidLoc(startLocation)) {
      const lnglat = new AMap.LngLat(startLocation.longitude, startLocation.latitude)
      if (!startMarkerRef.current) {
        startMarkerRef.current = new AMap.Marker({
          position: lnglat,
          icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
          offset: new AMap.Pixel(-13, -26),
          clickable: false,
          draggable: false,
        })
        mapRef.current.add(startMarkerRef.current)
      } else {
        startMarkerRef.current.setPosition(lnglat)
      }
    }

    // 更新/创建终点标记
    if (endLocation && isValidLoc(endLocation)) {
      const lnglat = new AMap.LngLat(endLocation.longitude, endLocation.latitude)
      if (!endMarkerRef.current) {
        endMarkerRef.current = new AMap.Marker({
          position: lnglat,
          icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
          offset: new AMap.Pixel(-13, -26),
          clickable: false,
          draggable: false,
        })
        mapRef.current.add(endMarkerRef.current)
      } else {
        endMarkerRef.current.setPosition(lnglat)
      }
      mapRef.current.setCenter(lnglat)
    }

    // 路径规划
    if (drivingRef.current && startLocation && endLocation && isValidLoc(startLocation) && isValidLoc(endLocation)) {
      const startLngLat = new AMap.LngLat(startLocation.longitude, startLocation.latitude)
      const endLngLat = new AMap.LngLat(endLocation.longitude, endLocation.latitude)
      drivingRef.current.clear()
      drivingRef.current.search(startLngLat, endLngLat, () => {})
    } else {
      drivingRef.current?.clear()
    }
  }, [startLocation, endLocation])

  // 响应司机位置更新
  useEffect(() => {
    const AMap = (window as any).AMap
    if (!AMap || !mapRef.current) return
    if (!driverLocation || !isValidLoc(driverLocation)) return

    const lnglat = new AMap.LngLat(driverLocation.longitude, driverLocation.latitude)
    if (!driverMarkerRef.current) {
      driverMarkerRef.current = new AMap.Marker({
        position: lnglat,
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
        offset: new AMap.Pixel(-13, -26),
        label: { content: '司机', direction: 'right', offset: new AMap.Pixel(10, -20) },
        clickable: false,
        draggable: false,
      })
      mapRef.current.add(driverMarkerRef.current)
    } else {
      driverMarkerRef.current.setPosition(lnglat)
    }
  }, [driverLocation])

  const isValidLoc = (loc?: Location | null) => {
    return !!loc && typeof loc.longitude === 'number' && typeof loc.latitude === 'number'
  }

  return (
    <div id="orderMapContainer" style={{ width: '100%', height: '240px' }} />
  )
}

export default OrderMap
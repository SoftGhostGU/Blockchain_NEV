import "./index.scss";
import React, { useEffect, useState, useRef } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import type { Location } from "../../api/type";

type MapProps = {
  destinationLocation?: Location;
  startLocation?: Location;
  onStartLocationChange?: (loc: Location) => void;
  // 新增：路线里程/时长上报回调（单位：米/秒）
  onRouteInfo?: (info: { distanceMeters: number; durationSeconds: number }) => void;
  // 页面显示时触发的轻量刷新令牌（不重建地图实例）
  refreshToken?: number;
};

const Map = ({ destinationLocation, startLocation, onStartLocationChange, onRouteInfo, refreshToken }: MapProps) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const drivingRef = useRef<any>(null); // 存储驾车路线规划实例

  useEffect(() => {
    (window as any)._AMapSecurityConfig = {
      securityJsCode: "847370c4fd8230a39278ac95e450d9c6",
    };

    AMapLoader.load({
      key: "2cbfc31f5eae1f3dd09f26255f115449", // Web端Key
      version: "2.0",
      plugins: ["AMap.Geolocation", "AMap.Geocoder", "AMap.Driving"], // 加载驾车路线规划插件
    })
      .then((AMap) => {
        const container = document.getElementById("mapContainer");
        // 容器未就绪时跳过初始化，避免内部像素计算得到 NaN
        if (!container || container.clientWidth === 0 || container.clientHeight === 0) {
          console.warn("Map container not ready, skip init");
          return;
        }
        const amap = new AMap.Map("mapContainer", {
          zoom: 15,
          center: [121.404184, 31.230093],
          pitch: 50,
          viewMode: "3D",
          rotateEnable: true,
          pitchEnable: true,
          zooms: [2, 20],
          logoPosition: "RT", // 将logo放到右上角 (Right Top)
          copyrightPosition: "RT", // 将版权信息放到右上角 (Right Top)
        });
        mapRef.current = amap;

        // 初始化 Geocoder
        geocoderRef.current = new (AMap as any).Geocoder({
          extensions: "all",
        });

        // 初始化驾车路线规划
        drivingRef.current = new AMap.Driving({
          map: amap,
          policy: AMap.DrivingPolicy.LEAST_TIME, // 驾车策略：最少时间
        });

        // 定位插件：默认起点 = 定位点
        AMap.plugin("AMap.Geolocation", () => {
          const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            offset: [15, 30],
            zoomToAccuracy: true,
            position: "RB",
          });

          amap.addControl(geolocation);

          geolocation.getCurrentPosition((status: string, result: any) => {
            if (status === "complete") {
              const { lng, lat } = result.position;
              setPosition({ lat, lng });

              // 创建或更新起点 Marker（可拖拽）
              if (!startMarkerRef.current) {
                startMarkerRef.current = new AMap.Marker({
                  position: [lng, lat],
                  draggable: true,
                  icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                  offset: new AMap.Pixel(-13, -26),
                });
                amap.add(startMarkerRef.current);

                // 拖拽结束更新起点并逆地理编码
                startMarkerRef.current.on("dragend", (e: any) => {
                  const lnglat = e.lnglat;
                  reverseGeocodeAndUpdate(lnglat.lng, lnglat.lat);
                });
              } else {
                startMarkerRef.current.setPosition([lng, lat]);
              }

              amap.setCenter([lng, lat]);

              // 逆地理编码并回写起点
              reverseGeocodeAndUpdate(lng, lat);
            } else {
              console.error("定位失败：", result);
            }
          });
        });
      })
      .catch((e) => {
        console.error(e);
      });

    // 组件卸载时销毁地图实例并清理引用，确保返回页面后能重新初始化
    return () => {
      try {
        if (mapRef.current) {
          mapRef.current.destroy();
        }
      } catch (err) {
        console.warn("AMap destroy failed:", err);
      }
      mapRef.current = null;
      destMarkerRef.current = null;
      startMarkerRef.current = null;
      geocoderRef.current = null;
      drivingRef.current = null;
    };
  }, []);

  // 目的地联动：居中并落点
  useEffect(() => {
    const AMap = (window as any).AMap;
    if (!AMap || !mapRef.current || !destinationLocation) return;

    // 增加经纬度有效性判断，防止传入NaN导致高德地图SDK报错
    if (
      typeof destinationLocation.longitude !== "number" ||
      typeof destinationLocation.latitude !== "number"
    ) {
      return;
    }

    const lnglat = new AMap.LngLat(
      destinationLocation.longitude,
      destinationLocation.latitude
    );
    if (!destMarkerRef.current) {
      destMarkerRef.current = new AMap.Marker({
        position: lnglat,
        icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
        offset: new AMap.Pixel(-13, -26),
      });
      mapRef.current.add(destMarkerRef.current);
    } else {
      destMarkerRef.current.setPosition(lnglat);
    }
    mapRef.current.setZoom(16);
    mapRef.current.setCenter(lnglat);
  }, [destinationLocation]);

  // 路径规划效果
  useEffect(() => {
    const AMap = (window as any).AMap;
    // 确保 AMap SDK、路径规划实例以及起终点都已就绪
    if (!AMap || !drivingRef.current || !startLocation || !destinationLocation) {
      // 如果条件不满足，清除地图上可能存在的旧路径并退出
      drivingRef.current?.clear();
      // 同步告知无有效路线
      onRouteInfo && onRouteInfo({ distanceMeters: 0, durationSeconds: 0 });
      return;
    }

    // 再次校验经纬度，确保是有效的数字
    if (
      typeof startLocation.longitude !== "number" ||
      typeof startLocation.latitude !== "number" ||
      typeof destinationLocation.longitude !== "number" ||
      typeof destinationLocation.latitude !== "number"
    ) {
      // 如果经纬度无效，也清除旧路径
      drivingRef.current.clear();
      return;
    }

    // 创建高德地图的 LngLat 对象
    const startLngLat = new AMap.LngLat(startLocation.longitude, startLocation.latitude);
    const destLngLat = new AMap.LngLat(destinationLocation.longitude, destinationLocation.latitude);

    // 调用 search 方法执行路径规划
    drivingRef.current.search(startLngLat, destLngLat, (status: string, result: any) => {
      if (status === "complete") {
        // 路径规划成功，SDK会自动在地图上绘制路径
        console.log("路径规划成功", result);
        try {
          const route = result?.routes?.[0];
          const distanceMeters = Number(route?.distance) || 0; // 单位：米
          const durationSeconds = Number(route?.time) || 0; // 单位：秒
          onRouteInfo && onRouteInfo({ distanceMeters, durationSeconds });
        } catch (e) {
          console.warn("提取路线里程/时长失败", e);
        }
      } else {
        // 路径规划失败，打印错误信息
        console.error("路径规划失败：", result);
        onRouteInfo && onRouteInfo({ distanceMeters: 0, durationSeconds: 0 });
      }
    });

    // 在组件卸载或依赖项（起终点）更新时，执行清理操作
    return () => {
      // 清除地图上的路径
      drivingRef.current?.clear();
      // 卸载时置空路线信息
      onRouteInfo && onRouteInfo({ distanceMeters: 0, durationSeconds: 0 });
    };
  }, [startLocation, destinationLocation]); // 依赖项：起点和终点

  // 外部传入起点联动：更新 marker 位置
  useEffect(() => {
    const AMap = (window as any).AMap;
    if (!AMap || !mapRef.current || !startLocation) return;

    // 增加经纬度有效性判断，防止传入NaN导致高德地图SDK报错
    if (
      typeof startLocation.longitude !== "number" ||
      typeof startLocation.latitude !== "number"
    ) {
      return;
    }

    const lnglat = new AMap.LngLat(startLocation.longitude, startLocation.latitude);
    if (!startMarkerRef.current) {
      startMarkerRef.current = new AMap.Marker({
        position: lnglat,
        draggable: true,
        icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png",
        offset: new AMap.Pixel(-13, -26),
      });
      mapRef.current.add(startMarkerRef.current);
      startMarkerRef.current.on("dragend", (e: any) => {
        const p = e.lnglat;
        reverseGeocodeAndUpdate(p.lng, p.lat);
      });
    } else {
      startMarkerRef.current.setPosition(lnglat);
    }
  }, [startLocation]);

  // 轻量刷新：页面返回时仅刷新尺寸/居中与路线，不重建实例
  useEffect(() => {
    const AMap = (window as any).AMap;
    const map = mapRef.current;
    if (!AMap || !map) return;

    try {
      if (typeof map.resize === 'function') {
        map.resize();
      }
    } catch {}

    const isValid = (loc?: Location | null) =>
      !!loc && typeof loc.longitude === 'number' && typeof loc.latitude === 'number';

    if (isValid(destinationLocation)) {
      const lnglat = new AMap.LngLat(destinationLocation!.longitude, destinationLocation!.latitude);
      map.setCenter(lnglat);
      map.setZoom(16);
    } else if (isValid(startLocation)) {
      const lnglat = new AMap.LngLat(startLocation!.longitude, startLocation!.latitude);
      map.setCenter(lnglat);
    }

    if (
      drivingRef.current &&
      isValid(startLocation) &&
      isValid(destinationLocation)
    ) {
      const startLngLat = new AMap.LngLat(startLocation!.longitude, startLocation!.latitude);
      const destLngLat = new AMap.LngLat(destinationLocation!.longitude, destinationLocation!.latitude);
      try {
        drivingRef.current.clear();
      } catch {}
      drivingRef.current.search(startLngLat, destLngLat, (status: string, result: any) => {
        if (status === 'complete') {
          try {
            const route = result?.routes?.[0];
            const distanceMeters = Number(route?.distance) || 0;
            const durationSeconds = Number(route?.time) || 0;
            onRouteInfo && onRouteInfo({ distanceMeters, durationSeconds });
          } catch {}
        } else {
          onRouteInfo && onRouteInfo({ distanceMeters: 0, durationSeconds: 0 });
        }
      });
    } else {
      try {
        drivingRef.current?.clear();
      } catch {}
      onRouteInfo && onRouteInfo({ distanceMeters: 0, durationSeconds: 0 });
    }
  }, [refreshToken]);

  // 逆地理编码并更新起点回调
  const reverseGeocodeAndUpdate = (lng: number, lat: number) => {
    const AMap = (window as any).AMap;
    if (!AMap || !geocoderRef.current) return;
    geocoderRef.current.getAddress([lng, lat], (status: string, result: any) => {
      let address = "";
      let landmark = "";
      if (status === "complete" && result?.regeocode) {
        const comp = result.regeocode.addressComponent;
        address = result.regeocode.formattedAddress || "";
        landmark = result.regeocode?.pois?.[0]?.name || comp.neighborhood || comp.building || "";
      }

      const updated: Location = {
        latitude: lat,
        longitude: lng,
        address: address || "当前位置",
        landmark: landmark || "当前位置",
      };
      onStartLocationChange && onStartLocationChange(updated);
    });
  };

  return (
    <div
      id="mapContainer"
      style={{ width: "100%", height: "100%" }}
    ></div>
  );
};

export default Map;

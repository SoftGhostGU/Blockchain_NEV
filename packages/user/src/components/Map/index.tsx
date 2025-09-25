import "./index.scss";
import React, { useEffect, useState } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";

const Map = () => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    (window as any)._AMapSecurityConfig = {
      securityJsCode: "847370c4fd8230a39278ac95e450d9c6",
    };

    AMapLoader.load({
      key: "2cbfc31f5eae1f3dd09f26255f115449", // Web端Key
      version: "2.0",
      plugins: ["AMap.Geolocation"],
    })
      .then((AMap) => {
        const amap = new AMap.Map("mapContainer", {
          zoom: 15,
          center: [121.40942550051864, 31.228483165793406],
          pitch: 50,
          viewMode: "3D",
          rotateEnable: true,
          pitchEnable: true,
          zooms: [2, 20],
          logoPosition: "RT", // 将logo放到右上角 (Right Top)
          copyrightPosition: "RT", // 将版权信息放到右上角 (Right Top)
        });

        // 示例轨迹点（替换成后端返回的轨迹也行）
        const path = [
          [121.40602675867785, 31.22702259340934],
          [121.41028997136584, 31.228078930477555],
          [121.41057907949312, 31.23114907989322],
          [121.41461834333484, 31.23164722695371],
        ];

        // 创建轨迹折线
        const polyline = new AMap.Polyline({
          path,
          strokeColor: "#3366FF",
          strokeWeight: 5,
          strokeOpacity: 0.9,
        });
        amap.add(polyline);

        // 添加小车（Marker）
        const carMarker = new AMap.Marker({
          position: path[0], // 初始点
          icon: "https://webapi.amap.com/images/car.png", // 小车图标
          offset: new AMap.Pixel(-13, -26), // 图标中心点偏移
        });
        amap.add(carMarker);

        // 🚗 让小车沿着轨迹移动
        carMarker.moveAlong(path, {
          duration: 8000, // 动画时长（毫秒）
          autoRotation: true, // 自动调整角度
        });

        // 🏁 结束点标记
        const endMarker = new AMap.Marker({
          position: path[path.length - 1],
          content: "🏁", // 用 emoji 表示终点
          offset: new AMap.Pixel(-10, -10),
        });
        amap.add(endMarker);

        // 自动缩放视野到能看到全轨迹
        amap.setFitView([polyline, carMarker, endMarker]);

        // 定位插件
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
              onComplete(result);
            } else {
              onError(result);
            }
          });

          function onComplete(data: any) {
            console.log("定位成功：", data);
            setPosition({
              lat: data.position.lat,
              lng: data.position.lng,
            });
            const marker = new AMap.Marker({
              position: [data.position.lng, data.position.lat],
            });
            amap.add(marker);
          }

          function onError(err: any) {
            console.error("定位失败：", err);
          }
        });
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  return (
    <div
      id="mapContainer"
      style={{ width: "100%", height: "100%" }}
    ></div>
  );
};

export default Map;

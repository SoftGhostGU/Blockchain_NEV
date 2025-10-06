import "./index.scss"

import mapTest from '../../assets/map_test.jpg'
import Map from '../../components/Map'

import { Button, ConfigProvider, notification, Progress, Space, theme, Timeline } from 'antd';
import type { ProgressProps } from 'antd';
import {
  createFromIconfontCN,
  BulbTwoTone,
  ClockCircleTwoTone,
  DashboardTwoTone,
  StarTwoTone,
  CheckCircleTwoTone,
  WarningTwoTone,
  CloseCircleTwoTone,
  BarsOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
  EllipsisOutlined
} from '@ant-design/icons';
import { useColorModeStore } from "../../store/store";
import { useEffect, useState } from "react";
import request from '../../api';

import type { NotificationArgsProps } from 'antd';

type NotificationPlacement = NotificationArgsProps['placement'];

const twoColors: ProgressProps['strokeColor'] = {
  '0%': '#108ee9',
  '100%': '#87d068',
};

const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/c/font_4974777_oysj7n9gp4.js',
});

// const customDot: StepsProps['progressDot'] = (dot, { status, index }) => (
//   <Popover
//     content={
//       <span>
//         step {index} status: {status}
//       </span>
//     }
//   >
//     {dot}
//   </Popover>
// );
const CarAuditStatus = {
  Pending: "待审核",
  Approved: "已通过"
};

const state = ["正常", "注意", "危险"];

export default function CarInfo() {
  const [carLicense, setCarLicense] = useState("京8 8888");
  const [carType, setCarType] = useState("特斯拉 Model 3");
  const carImage = "https://tandianji.com/uploads/2023/06/Tesla-Models-3-01.jpg";
  const [carAuditStatus, setCarAuditStatus] = useState(CarAuditStatus.Approved);
  const [isRunning, setIsRunning] = useState(true);

  const [batteryPercent, setBatteryPercent] = useState(85);
  const [milesToGo, setMilesToGo] = useState("350km");

  const [bodyState, setBodyState] = useState(state[0]);
  const [tirePressure, setTirePressure] = useState(state[0]);
  const [brakeState, setBrakeState] = useState(state[0]);
  const [powerState, setPowerState] = useState(state[0]);

  const [time, setTime] = useState("14:30");
  const [money, setMoney] = useState("128.00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(4.9); // 默认评分
  const [onlineDays, setOnlineDays] = useState(180); // 默认上线天数

  // 获取评分分布数据并计算加权平均评分
  const fetchRatingData = async () => {
    try {
      const response = await request.getStarDistribution({});
      console.log('API响应 - 评分分布数据:', response);
      
      if (response && response.data) {
        const starData = response.data.data || response.data;
        if (Array.isArray(starData)) {
          // 计算加权平均评分
          const totalComments = starData.reduce((acc, cur) => acc + cur.count, 0);
          if (totalComments > 0) {
            const weightedSum = starData.reduce((acc, cur) => acc + (cur.star * cur.count), 0);
            const averageRating = weightedSum / totalComments;
            setRating(Number(averageRating.toFixed(1))); // 保留一位小数
          }
        }
      }
    } catch (error) {
      console.error('获取评分数据失败:', error);
      // 保持默认评分4.9
    }
  };

  // 获取车辆信息
  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        setLoading(true);
        
        // 1. 获取车主信息，包含vehicleId
        const profileResponse = await request.getProfile({});
        console.log('车主信息响应:', profileResponse);
        
        if (profileResponse && profileResponse.data) {
          const profileData = profileResponse.data;
          const vehicleId = profileData.vehicleId;
          console.log('获取到的vehicleId:', vehicleId);
          
          // 计算上线天数
          if (profileData.createdAt) {
            const createdAt = new Date(profileData.createdAt);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - createdAt.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setOnlineDays(diffDays);
            console.log('计算上线天数:', diffDays, '天 (创建时间:', createdAt, ')');
          }
          
          if (!vehicleId) {
            throw new Error('未找到车辆ID');
          }
          
          // 2. 使用vehicleId获取车辆状况信息
          const conditionResponse = await request.getVehicleInfo({ vehicleId });
          console.log('车辆状况响应:', conditionResponse);
          
          if (conditionResponse && conditionResponse.data) {
            const conditionData = conditionResponse.data;
            
            // 更新车辆基本信息
            setCarType(conditionData.vehicleModel || "未知车型");
            setBatteryPercent(conditionData.batteryPercent || 0);
            setMilesToGo(conditionData.milesToGo || "0公里");
            
            // 更新车辆状态信息 - 数据库状态: 1=正常, 2=注意, 3=危险
            setBodyState(state[conditionData.bodyState - 1] || "未知状态");
            setTirePressure(state[conditionData.tirePressure - 1] || "未知状态");
            setBrakeState(state[conditionData.brakeState - 1] || "未知状态");
            setPowerState(state[conditionData.powerState - 1] || "未知状态");
          } else {
            console.warn('车辆状况数据为空，使用默认数据');
          }
        } else {
          console.warn('车主信息数据为空，使用默认数据');
        }
        
        // 3. 获取评分数据
        await fetchRatingData();
        
      } catch (error) {
        console.error('获取车辆数据失败:', error);
        setError('获取车辆信息失败，请稍后重试');
      } finally {
        setLoading(false);
        
        applyNightModeClasses();
      }
    };

    fetchVehicleData();

  }, []);

  // const orderNum = 8;

  const [api, contextHolder] = notification.useNotification();
  const close = () => {
    console.log(
      'Notification was closed. Either the close button was clicked or duration time elapsed.',
    );
  };
  const handleCallBackSuccessfully = () => {
    const key = `open${Date.now()}`;
    api.open({
      message: '召回车辆',
      description:
        '召回车辆成功，本单完成后即将回到指定地点',
      key,
      onClose: close,
    });
  }
  const handleCallOutSuccessfully = () => {
    const key = `open${Date.now()}`;
    api.open({
      message: '派出车辆',
      description:
        '派出车辆成功，车辆将按照合约内容持续接单',
      key,
      onClose: close,
    });
  }

  const openNotificationOfCallBackCar = () => {
    // 校验
    if (carAuditStatus !== CarAuditStatus.Approved) {
      api.error({
        message: "操作失败",
        description: "车辆未通过审核，无法召回。",
      });
      return;
    }
    if (!isRunning) {
      api.error({
        message: "操作失败",
        description: "车辆未在运行，无法召回。",
      });
      return;
    }

    // 校验通过 → 弹出确认框
    setIsRunning(false);
    const key = `open${Date.now()}`;
    const btn = (
      <Space>
        <Button type="link" size="small" onClick={() => api.destroy()}>
          取消
        </Button>
        <Button type="primary" size="small" onClick={() => {
          api.destroy(key);
          handleCallBackSuccessfully();
        }}>
          确认
        </Button>
      </Space>
    );
    api.open({
      message: '召回车辆',
      description: '确定要召回该车辆吗？',
      btn,
      key,
      onClose: close,
    });
  };

  const openNotificationOfCallOutCar = () => {
    // 校验
    if (carAuditStatus !== CarAuditStatus.Approved) {
      api.error({
        message: "操作失败",
        description: "车辆未通过审核，无法派出。",
      });
      return;
    }
    if (isRunning) {
      api.error({
        message: "操作失败",
        description: "车辆正在运行中，无法再次派出。",
      });
      return;
    }

    // 校验通过 → 弹出确认框
    setIsRunning(true);
    const key = `open${Date.now()}`;
    const btn = (
      <Space>
        <Button type="link" size="small" onClick={() => api.destroy()}>
          取消
        </Button>
        <Button type="primary" size="small" onClick={() => {
          api.destroy(key);
          handleCallOutSuccessfully();
        }}>
          确认
        </Button>
      </Space>
    );
    api.open({
      message: '派出车辆',
      description: '确定要派出该车辆吗？',
      btn,
      key,
      onClose: close,
    });
  };


  const handleCallBackCar = async () => {
    console.log("点击了召回车辆")
    try {
      // 获取vehicleId
      const profileResponse = await request.getProfile({});
      if (profileResponse && profileResponse.data) {
        const vehicleId = profileResponse.data.vehicleId;
        if (!vehicleId) {
          api.error({
            message: "操作失败",
            description: "未找到车辆ID",
          });
          return;
        }
        
        // 调用召回API
        const recallResponse = await request.recallVehicle({ vehicleId });
        console.log('召回车辆响应:', recallResponse);
        
        if (recallResponse) {
          openNotificationOfCallBackCar();
          setIsRunning(false); // 更新车辆状态为未运行
        } else {
          api.error({
            message: "召回失败",
            description: "召回车辆时发生错误",
          });
        }
      }
    } catch (error) {
      console.error('召回车辆失败:', error);
      api.error({
        message: "操作失败",
        description: "召回车辆时发生错误",
      });
    }
  }

  const handleCallOutCar = async () => {
    console.log("点击了派出车辆")
    try {
      // 获取vehicleId
      const profileResponse = await request.getProfile({});
      if (profileResponse && profileResponse.data) {
        const vehicleId = profileResponse.data.vehicleId;
        if (!vehicleId) {
          api.error({
            message: "操作失败",
            description: "未找到车辆ID",
          });
          return;
        }
        
        // 调用派出API
        const dispatchResponse = await request.dispatchVehicle({ vehicleId });
        console.log('派出车辆响应:', dispatchResponse);
        
        if (dispatchResponse) {
          openNotificationOfCallOutCar();
          setIsRunning(true); // 更新车辆状态为运行中
        } else {
          api.error({
            message: "派出失败",
            description: "派出车辆时发生错误",
          });
        }
      }
    } catch (error) {
      console.error('派出车辆失败:', error);
      api.error({
        message: "操作失败",
        description: "派出车辆时发生错误",
      });
    }
  }

  const isNightMode = useColorModeStore(state => state.isNightMode);
  
  // 昼夜模式应用函数
  const applyNightModeClasses = () => {
    const blockThree = document.querySelectorAll('.block_three');
    const listItemText = document.querySelectorAll('.list-item-text');
    const progressLabel = document.querySelectorAll('.progress-label');
    const mapContainer = document.querySelector('.map-container');
    
    if (isNightMode) {
      blockThree.forEach(item => item.classList.add('night-mode'));
      listItemText.forEach(item => item.classList.add('night-mode'));
      progressLabel.forEach(item => item.classList.add('night-mode'));
      mapContainer?.classList.add('night-mode');
    } else {
      blockThree.forEach(item => item.classList.remove('night-mode'));
      listItemText.forEach(item => item.classList.remove('night-mode'));
      progressLabel.forEach(item => item.classList.remove('night-mode'));
      mapContainer?.classList.remove('night-mode');
    }
  };

  // 主要应用逻辑 - 响应昼夜模式变化
  useEffect(() => {
    applyNightModeClasses();
  }, [isNightMode]);

  // 页面加载时强制应用昼夜模式 - 解决初始化问题
  useEffect(() => {
    // 立即应用一次
    applyNightModeClasses();
    
    // DOM完全渲染后再次应用
    const timer1 = setTimeout(applyNightModeClasses, 100);
    const timer2 = setTimeout(applyNightModeClasses, 300);
    const timer3 = setTimeout(applyNightModeClasses, 500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  if (loading) {
    return (
      <ConfigProvider
        theme={{ algorithm: isNightMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}
      >
        <div className="app-container">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <div>正在加载车辆信息...</div>
          </div>
        </div>
      </ConfigProvider>
    );
  }

  if (error) {
    return (
      <ConfigProvider
        theme={{ algorithm: isNightMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}
      >
        <div className="app-container">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: '#f5222d' }}>
            <div>{error}</div>
          </div>
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider
      theme={{ algorithm: isNightMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}
    >
      <div className="app-container">
        <div className="column">
          <div className="block_three car-info">
            {/* <p className="block_title">车辆基本信息</p> */}
            <img src={carImage} alt="" className="car_image" />
            <div className="block_content">
              <div className="basic-info">
                <div className="basic-item">
                  <div className="basic-value bold">{carType}</div>
                  <div style={carAuditStatus === "已通过" ? { color: "#87d068" } : { color: "#f5222d" }}>{carAuditStatus}</div>
                </div>
                <div className="basic-item">
                  <div className="basic-value small">车牌号：{carLicense}</div>
                </div>
                <div className="basic-item">
                  <div className="list-item">
                    <ClockCircleTwoTone className="list-item-icon" />
                    <span className="list-item-text">上线时间：{onlineDays}天</span>
                  </div>
                  {/* <div className="list-item">
                    <DashboardTwoTone className="list-item-icon" />
                    <span className="list-item-text">总里程：12800公里</span>
                  </div> */}
                  <div className="list-item">
                    <StarTwoTone className="list-item-icon" />
                    <span className="list-item-text">评分：{rating}</span>
                  </div>
                  {/* <div className="basic-label">状态</div>
                <div
                  className={`basic-value ${status === '运营中' ? 'operating' : 'suspended'
                    }`}
                >
                  {status}
                </div> */}
                </div>
              </div>
            </div>
          </div>
          <div className="block_three other-info">
            <p className="block_title">车况信息</p>
            <div className="block_content">
              <div className="progress-item first-item">
                <div>
                  <BulbTwoTone
                    style={{ marginRight: '8px', fontSize: '16px' }}
                  />
                  <span>电量</span>
                </div>
                {/* <Progress percent={batteryPercent} type="line" /> */}
                <Progress
                  percent={batteryPercent}
                  type="circle"
                  size={70}
                  style={{
                    textAlign: 'center',
                  }}
                  strokeColor={twoColors}
                />
                <div className="battery-text">
                  <div className="text-label">预计续航</div>
                  <div className="text-value">{milesToGo}</div>
                </div>
              </div>
              <div className="progress-item">
                <div className="progress-label">
                  <IconFont type="icon-qiche" style={{
                    marginRight: '5px',
                    fontSize: '16px'
                  }} />
                  车身状态
                </div>
                <div className={
                  `progress-value ${bodyState === "正常" ? "normal" :
                    bodyState === "注意" ? "warning" :
                      bodyState === "危险" ? "danger" :
                        ""}
                `}
                >{bodyState || "未知状态"}
                  {bodyState === "正常" ? (
                    <CheckCircleTwoTone
                      style={{ marginLeft: '5px' }}
                      twoToneColor="#8bd38a" // 绿色表示正常
                    />
                  ) : bodyState === "注意" ? (
                    <WarningTwoTone
                      style={{ marginLeft: '5px' }}
                      twoToneColor="#eba540" // 黄色表示注意
                    />
                  ) : (
                    <CloseCircleTwoTone
                      style={{ marginLeft: '5px' }}
                      twoToneColor="#f5222d" // 红色表示危险
                    />
                  )}
                </div>
              </div>
              <div className="progress-item">
                <div className="progress-label">
                  <IconFont type="icon-icon-luntai" style={{
                    marginRight: '5px',
                    fontSize: '16px'
                  }} />
                  轮胎气压
                </div>
                <div className={
                  `progress-value ${tirePressure === "正常" ? "normal" :
                    tirePressure === "注意" ? "warning" :
                      tirePressure === "危险" ? "danger" :
                        ""}
                `}
                >{tirePressure || "未知状态"}
                  {tirePressure === "正常" ? (
                    <CheckCircleTwoTone
                      style={{ marginLeft: '5px' }}
                      twoToneColor="#8bd38a" // 绿色表示正常
                    />
                  ) : tirePressure === "注意" ? (
                    <WarningTwoTone
                      style={{ marginLeft: '5px' }}
                      twoToneColor="#eba540" // 黄色表示注意
                    />
                  ) : (
                    <CloseCircleTwoTone
                      style={{ marginLeft: '5px' }}
                      twoToneColor="#f5222d" // 红色表示危险
                    />
                  )}
                </div>
              </div>
              <div className="progress-item">
                <div className="progress-label">
                  <IconFont type="icon-zhidongqi" style={{
                    marginRight: '5px',
                    fontSize: '16px'
                  }} />
                  制动系统
                </div>
                <div className={
                  `progress-value ${brakeState === "正常" ? "normal" :
                    brakeState === "注意" ? "warning" :
                      brakeState === "危险" ? "danger" :
                        ""}
                `}
                >{brakeState || "未知状态"}
                  {brakeState === "正常" ? (
                    <CheckCircleTwoTone
                      style={{ marginLeft: '5px' }}
                      twoToneColor="#8bd38a" // 绿色表示正常
                    />
                  ) : brakeState === "注意" ? (
                    <WarningTwoTone
                      style={{ marginLeft: '5px' }}
                      twoToneColor="#eba540" // 黄色表示注意
                    />
                  ) : (
                    <CloseCircleTwoTone
                      style={{ marginLeft: '5px' }}
                      twoToneColor="#f5222d" // 红色表示危险
                    />
                  )}
                </div>
              </div>
              <div className="progress-item">
                <div className="progress-label">
                  <IconFont type="icon-donglixitong" style={{
                    marginRight: '5px',
                    fontSize: '16px'
                  }} />
                  动力系统
                </div>
                <div className={
                  `progress-value ${powerState === "正常" ? "normal" :
                    powerState === "注意" ? "warning" :
                      powerState === "危险" ? "danger" :
                        ""}
                `}
                >{powerState || "未知状态"}
                  {powerState === "正常" ? (
                    <CheckCircleTwoTone
                      style={{ marginLeft: '5px' }}
                      twoToneColor="#8bd38a" // 绿色表示正常
                    />
                  ) : powerState === "注意" ? (
                    <WarningTwoTone
                      style={{ marginLeft: '5px' }}
                      twoToneColor="#eba540" // 黄色表示注意
                    />
                  ) : (
                    <CloseCircleTwoTone
                      style={{ marginLeft: '5px' }}
                      twoToneColor="#f5222d" // 红色表示危险
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="block_three current-order">
            <p className="block_title">当前订单进度</p>
            <p style={{ fontSize: '10px' }}>由于网站处于测试阶段，该板块暂时使用硬编码模拟</p>
            <Progress
              percent={50}
              status="active"
              showInfo={false}
              strokeColor={{
                from: '#108ee9',
                to: '#87d068'
              }}
            />
            <div className="progress-item">
              <div className="progress-label">预计完成时间</div>
              <div className="progress-value">{time}</div>
            </div>
            <div className="progress-item">
              <div className="progress-label">订单金额</div>
              <div className="progress-value">￥{money}</div>
            </div>
          </div>
        </div>
        <div className="map-container">
          <div className="button">
            <BarsOutlined className="button-icon" />
            <BarChartOutlined className="button-icon" />
            <QuestionCircleOutlined className="button-icon" />
            <EllipsisOutlined className="button-icon" />
            {contextHolder}
            <button
              className="button-button"
              onClick={handleCallBackCar}
            >召回车辆</button>
            <button
              className="button-button"
              onClick={handleCallOutCar}
            >派出车辆</button>
          </div>
          <div className="map">
            {/* <img src={mapTest} alt="" className="map-img" /> */}
            <Map></Map>
          </div>

          <div className="order-detail">
            <Timeline
              items={[
                {
                  color: 'green',
                  children: '等待接单',
                },
                {
                  color: 'green',
                  children: '前往目的地',
                },
                {
                  color: 'blue',
                  children: '行程进行中',
                },
                {
                  color: 'gray',
                  children: '行程完成',
                },
              ]}
            />
          </div>

          {/* <div className="info-detail">
          <div className="info-item">
            <div className="item-label">今日接单</div>
            <div className="item-value">{ orderNum }单</div>
          </div>
        </div> */}
        </div>
      </div>
    </ConfigProvider>
  );
}
import "./index.scss"

import mapTest from '../../assets/map_test.jpg'

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
import { use, useEffect, useState } from "react";

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
  const carLicense = "京8 8888"
  const carType = "特斯拉 Model 3"
  const carImage = "https://tandianji.com/uploads/2023/06/Tesla-Models-3-01.jpg"
  const carAuditStatus = CarAuditStatus.Approved;
  const [isRunning, setIsRunning] = useState(true);  // or false

  const batteryPercent = 85;
  const milesToGo = "350km";

  const bodyState = state[0]; // or "注意", "危险"
  const tirePressure = state[0]; // or "注意", "危险"
  const brakeState = state[1]; // or "正常", "危险"
  const powerState = state[2]; // or "正常", "注意"

  const time = "14:30"
  const money = "128.00"

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


  const handleCallBackCar = () => {
    console.log("点击了召回车辆")
    openNotificationOfCallBackCar()
  }

  const handleCallOutCar = () => {
    console.log("点击了派出车辆")
    openNotificationOfCallOutCar()
  }

  const isNightMode = useColorModeStore(state => state.isNightMode);
  useEffect(() => {
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
  }, [isNightMode]);

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
                    <span className="list-item-text">上线时间：180天</span>
                  </div>
                  <div className="list-item">
                    <DashboardTwoTone className="list-item-icon" />
                    <span className="list-item-text">总里程：12800公里</span>
                  </div>
                  <div className="list-item">
                    <StarTwoTone className="list-item-icon" />
                    <span className="list-item-text">评分：4.9</span>
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
            <img src={mapTest} alt="" className="map-img" />
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
import { useNavigate } from 'react-router-dom';
import './index.scss'

import { Form, Input, Button, message } from 'antd';
import request from '../../api';

const AddVehicle = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      // 调用添加车辆API
      const response = await request.addVehicle({
        licensePlate: values.plateNumber
      });
      
      console.log('API响应：', response);
      
      // 检查响应是否包含vehicleId，表示真正成功
      if (response?.vehicleId) {
        // message.success('车辆绑定成功！');
        // 跳转到仪表板
        navigate('/dashboard');
      } else {
        // 显示服务器返回的错误信息
        const errorMessage = response?.data?.message || response?.message || '车辆绑定失败';
        message.error(errorMessage);
        console.log(errorMessage)
      }
    } catch (error: any) {
      console.error('添加车辆失败：', error);
      // 尝试从错误响应中获取具体错误信息
      const errorMessage = error?.response?.data?.message || error?.message || '车辆绑定失败，请重试';
      message.error(errorMessage);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto' }}>
      <h2>绑定车辆信息</h2>
      <Form onFinish={onFinish} layout="vertical">
        <Form.Item
          label="车牌号"
          name="plateNumber"
          rules={[{ required: true, message: '请输入车牌号' }]}
        >
          <Input placeholder="请输入车牌号" />
        </Form.Item>



        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            提交绑定
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddVehicle;

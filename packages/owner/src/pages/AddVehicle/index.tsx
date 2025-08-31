import { useNavigate } from 'react-router-dom';
import './index.scss'

import { Form, Input, Button } from 'antd';

const AddVehicle = () => {
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    console.log('车辆信息：', values);
    // TODO: 提交接口绑定车辆

    navigate('/dashboard');
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

        <Form.Item
          label="车辆型号"
          name="model"
          rules={[{ required: true, message: '请输入车辆型号' }]}
        >
          <Input placeholder="如：比亚迪汉 EV" />
        </Form.Item>

        <Form.Item
          label="颜色"
          name="color"
        >
          <Input placeholder="如：白色" />
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

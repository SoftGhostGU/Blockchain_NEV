import './index.scss';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, Col, Form, Input, Row, Select, Upload, type UploadFile, type UploadProps, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import request from '../../api';

const { Option } = Select;

interface DrawerComponentProps {
  onSubmit?: (values: any) => void;
  vehicleData?: any;
}

const DrawerComponent = forwardRef(({ onSubmit, vehicleData }: DrawerComponentProps, ref) => {
  const [form] = Form.useForm(); 

  // 使用API数据或默认值
  const initialValues = {
    vehicleModel: vehicleData?.vehicleModel || '未知型号',
    licensePlate: vehicleData?.licensePlate || '未知车牌',
    bodyStatus: vehicleData?.bodyStatus || "未知状态",
    tirePressure: vehicleData?.tirePressure || "未知状态",
    brakeSystem: vehicleData?.brakeSystem || "未知状态",
    powerSystem: vehicleData?.powerSystem || "未知状态",
    remark: vehicleData?.remark || "暂无备注信息",
    carImage: [],
  };

  const [fileList, setFileList] = useState<UploadFile<any>[]>([]);

  // 暴露给父组件 submit 方法
  useImperativeHandle(ref, () => ({
    submit: () => form.submit(),
  }));

  const handleBeforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isAllowed = file.type === 'image/png' || file.type === 'image/jpeg';
    if (!isAllowed) {
      console.log(`${file.name} is not a png or jpg file`);
      return Upload.LIST_IGNORE;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      console.log('文件大小必须小于2MB!');
      return Upload.LIST_IGNORE;
    }

    return false; // 阻止自动上传
  };

  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const uploadProps: UploadProps = {
    beforeUpload: handleBeforeUpload,
    onChange: handleUploadChange,
    fileList: fileList,
    maxCount: 1,
    listType: "picture",
    multiple: false,
    accept: ".png,.jpg,.jpeg",
  };

  const onFinish = async (values: any) => {
    console.log('表单提交数据:', values);
    
    try {
      // 将前端状态字符串映射为后端需要的数字状态
      const statusMap: Record<string, number> = {
        '正常': 1,
        '注意': 2,
        '危险': 3
      };

      // 准备API请求参数
      const requestData = {
        vehicleId: 4000, // 假设车辆ID为4000，根据实际情况调整
        vehicleModel: values.vehicleModel,
        licensePlate: values.licensePlate,
        bodyState: statusMap[values.bodyStatus] || 1,
        tirePressure: statusMap[values.tirePressure] || 1,
        brakeState: statusMap[values.brakeSystem] || 1,
        powerState: statusMap[values.powerSystem] || 1,
        batteryPercent: 85, // 默认电池百分比
        milesToGo: "300" // 默认续航里程
      };

      console.log('API请求数据:', requestData);
      
      // 调用更新车辆状况API
      const response = await request.updateVehicleCondition(requestData);
      console.log('API响应:', response);
      
      if (response.code === 200) {
        message.success('车辆信息更新成功');
        onSubmit?.(values);
      } else {
        message.error(response.message || '更新失败');
      }
    } catch (error) {
      console.error('更新车辆信息失败:', error);
      message.error('更新车辆信息失败，请稍后重试');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      variant="filled"
      hideRequiredMark
      initialValues={initialValues}
      onFinish={onFinish}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="vehicleModel" label="车辆型号" rules={[{ required: true, message: '请输入车辆型号' }]}>
            <Input placeholder="请输入车辆型号" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="licensePlate" label="车牌号" rules={[{ required: true, message: '请输入车牌号' }]}>
            <Input placeholder="请输入车牌号" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="bodyStatus" label="车身状态" rules={[{ required: true, message: '请选择车身状态' }]}>
            <Select placeholder="请选择车身状态">
              <Option value="正常">正常</Option>
              <Option value="注意">注意</Option>
              <Option value="危险">危险</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="tirePressure" label="轮胎气压" rules={[{ required: true, message: '请选择轮胎气压' }]}>
            <Select placeholder="请选择轮胎气压">
              <Option value="正常">正常</Option>
              <Option value="注意">注意</Option>
              <Option value="危险">危险</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="brakeSystem" label="制动系统" rules={[{ required: true, message: '请选择制动系统' }]}>
            <Select placeholder="请选择制动系统">
              <Option value="正常">正常</Option>
              <Option value="注意">注意</Option>
              <Option value="危险">危险</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="powerSystem" label="动力系统" rules={[{ required: true, message: '请选择动力系统' }]}>
            <Select placeholder="请选择动力系统">
              <Option value="正常">正常</Option>
              <Option value="注意">注意</Option>
              <Option value="危险">危险</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="remark"
            label="备注"
            rules={[{ required: true, message: '请输入更多相关信息' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入更多相关信息" />
          </Form.Item>
        </Col>
      </Row>

      {/* <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="carImage"
            label="上传汽车相关图片"
            valuePropName="fileList"
            getValueFromEvent={(e) => e.fileList}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>选择图片 (PNG, JPG, 最大2MB)</Button>
            </Upload>
          </Form.Item>
        </Col>
      </Row> */}
    </Form>
  );
});

export default DrawerComponent;

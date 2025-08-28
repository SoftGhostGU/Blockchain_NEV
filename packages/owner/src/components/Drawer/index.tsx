import './index.scss';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, Col, Form, Input, Row, Select, Upload, type UploadFile, type UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;

interface DrawerComponentProps {
  onSubmit?: (values: any) => void;
}

const DrawerComponent = forwardRef(({ onSubmit }: DrawerComponentProps, ref) => {
  const [form] = Form.useForm(); 

  // 初始值
  const initialValues = {
    vehicleModel: '特斯拉 Model 3',
    licensePlate: '京A 88888',
    bodyStatus: "正常",
    tirePressure: "正常",
    brakeSystem: "注意",
    powerSystem: "危险",
    remark: "车辆状况良好，定期保养",
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

  const onFinish = (values: any) => {
    console.log('表单提交数据:', values);
    onSubmit?.(values);
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

      <Row gutter={16}>
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
      </Row>
    </Form>
  );
});

export default DrawerComponent;

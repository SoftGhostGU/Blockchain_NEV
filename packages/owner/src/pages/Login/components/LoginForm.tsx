import { useState, useRef } from 'react';
import '../index.scss'
import { Form, Input, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
// import request from '@/api'
import { useNavigate } from 'react-router-dom'
// import loginBg from "../../assets/login_bg.png"
import GraphicCode from '../../../components/GraphicCode';

interface GraphicCodeRef {
  verify: (str: string) => boolean;
}

const LoginForm = () => {
  const navigate = useNavigate()
  // 登录按钮loading
  let [_loading, setLoading] = useState(false)
  let [_submitLoginName, setSubmitLoginName] = useState('登录')
  let GraphicCodeRef = useRef<GraphicCodeRef>(null)
  // 确认登录
  const onFinish = async (userInfo: any) => {
    setLoading(true)
    setSubmitLoginName('正在登录...')

    navigate('/dashboard')

    // 真实登录
    // userInfo.password = passwordEncryption(userInfo.password) //密码加密
    // request.getLogin(userInfo).then(res => {
    //   if (res?.data?.code == 200) {
    //     console.log("登录成功：", res.data.data)
    //     setTimeout(() => {
    //       navigate('/dashboard/analysis')
    //     }, 300);
    //   } else {
    //     message.error("登录失败，请检查用户名和密码");
    //   }
    //   setLoading(false)
    //   setSubmitLoginName('登录')
    // }).catch(error => {
    //   console.error("登录错误：", error);
    //   setLoading(false)
    //   setSubmitLoginName('登录')
    //   message.error("登录失败，请检查用户名和密码");
    // })
  };

  // 验证码校验
  const validateInputCode = async (rule: any, value: any) => {
    if (value) {
      let verify = await GraphicCodeRef.current?.verify(value)
      if (!verify) throw new Error("验证码错误！")
    }
  }

  return (
    <>
      <Form.Item
        name="phone"
        rules={[
          { required: true, message: '请输入电话号码!' },
          { min: 11, message: '电话长度应为11位' },
          { max: 11, message: '电话长度应为11位' },
          { pattern: /^[0-9a-zA-Z@~!#$%^&*`.-_]{1,}$/, message: '包含非法字符' },
        ]}
      >
        <Input size="large" placeholder="电话号码" prefix={<UserOutlined className="site-form-item-icon" />} allowClear />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          { required: true, whitespace: false, message: '请输入登录密码!' },
          { min: 5, message: '最少长度为5位' },
          { max: 18, message: '最大长度为18位' },
          { pattern: /^[0-9a-zA-Z@~!#$%^&*`_]{1,}$/, message: '必须为数字，字母，特殊符号组成' },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="密码" size="large"
        />
      </Form.Item>
      <Form.Item name="inputCode"
        rules={[
          { required: true, message: '请输入验证码!' },
          { validator: validateInputCode, }
        ]}>
        <Row justify="space-between" style={{ display: 'flex', flexWrap: 'nowrap' }}>
          <Col className="yanzhengma">
            <Input size="large" placeholder="验证码" prefix={<SafetyCertificateOutlined className="site-form-item-icon" />} />
          </Col>
          <Col>
            <GraphicCode ref={GraphicCodeRef} />
          </Col>
        </Row>
      </Form.Item>
    </>
  )
}

export default LoginForm;
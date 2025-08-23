import React, { useEffect, useState, useRef } from 'react';
import './index.scss'
import { Form, Input, Button, Row, Col, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
// import request from '@/api'
import { useNavigate } from 'react-router-dom'
import loginBg from "../../assets/login_bg.png"
import GraphicCode from '../../components/GraphicCode';

interface GraphicCodeRef {
  verify: (str: string) => Promise<boolean>
}

const Login = () => {
  const navigate = useNavigate()
  // 登录按钮loading
  let [loading, setLoading] = useState(false)
  let title = "车主登录"
  let [submitLoginName, setSubmitLoginName] = useState('登录')
  let [form] = Form.useForm();
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
    <div className="login" style={{ backgroundImage: `url(${loginBg})` }}>
    {/* <div className="login" style={{ 
      backgroundImage: `url(${loginBg})`,
      minHeight: '100vh', // 最小高度自适应
      minWidth: '100vw',  // 最小宽度自适应
      backgroundSize: 'cover', // 确保背景图片覆盖整个容器
      backgroundPosition: 'center', // 背景图片居中
    }}> */}
      {/* <Three /> */}
      <div className="login-content-box">
        <div className="logo_left_top"><p>AutoCrowd</p><p>车主登录</p></div>
        <section className="login-content">
          <div className="head">
            {/* <img src={logo} alt="" className='logoImg' /> */}
            <h2>
              {title}
            </h2>
          </div>
          <div>
            <Form
              name="normal_login"
              className="login-form"
              form={form}
              initialValues={{ remember: true }}
              onFinish={onFinish}
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入用户名!' },
                  { min: 3, message: '最少长度为3位' },
                  { max: 20, message: '最大长度为20位' },
                  { pattern: /^[0-9a-zA-Z@~!#$%^&*`.-_]{1,}$/, message: '包含非法字符' },
                ]}
              >
                <Input size="large" placeholder="用户名" prefix={<UserOutlined className="site-form-item-icon" />} allowClear />
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
              {/* <Checkbox onChange={onChange} checked={checked} >记住密码</Checkbox> */}

              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button" loading={loading} disabled={loading}>
                  {submitLoginName}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </section>
      </div>
      <Author />
    </div>
  );

}

function Author() {
  return (
    <div className="author">
      {/* <p>技术支持：Fitten Tech</p>
      <p>版本信息：v2.0.0 | <a href="/docs">开发文档</a></p>
      <p>版权所有 © 2025 Fitten Tech</p> */}
    </div>
  );
}

export default Login

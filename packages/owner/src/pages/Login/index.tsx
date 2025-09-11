import { useState } from 'react';
import './index.scss'
import { Form, Button } from 'antd';
// import request from '@/api'
import loginBg from "../../assets/login_bg.png"
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import { useNavigate } from 'react-router-dom';


const Login = () => {
  let [isLogin, setIsLogin] = useState(true);
  // 登录按钮loading
  let [loading, setLoading] = useState(false)
  let title = isLogin ? "车主登录" : "车主注册";
  const submitLoginName = isLogin ? '登录' : '注册';
  const toggleForm = () => setIsLogin(!isLogin);

  const navigate = useNavigate()

  // 确认登录
  const onFinish = async (userInfo: any) => {
    setLoading(true)
    // setSubmitLoginName('正在登录...')

    try {
      if (isLogin) {
        // === 登录逻辑 ===
        console.log("登录信息：", userInfo);

        // 假设调用登录接口
        // await request.login(userInfo);

        navigate('/dashboard');
      } else {
        // === 注册逻辑 ===
        console.log("注册信息：", userInfo);

        // 假设调用注册接口
        // await request.register(userInfo);

        // 注册完成 → 跳转到添加车辆页面
        navigate('/add-vehicle');
      }
    } catch (error) {
      console.error("操作失败", error);
    } finally {
      setLoading(false);
    }

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
              className='login-form'
              onFinish={onFinish}
            >
              {isLogin ? <LoginForm /> : <RegisterForm />}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className={isLogin ? "login-form-button" : "register-form-button"}
                  loading={loading} disabled={loading}
                >
                  {submitLoginName}
                </Button>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                {isLogin && <>还没有账号？<Button type="link" onClick={toggleForm}>去注册</Button></>}
                {!isLogin && <>已有账号？<Button type="link" onClick={toggleForm}>去登录</Button></>}
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

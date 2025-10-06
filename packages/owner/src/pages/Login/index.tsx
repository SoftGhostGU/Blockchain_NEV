import { useState } from 'react';
import './index.scss'
import { Form, Button, message } from 'antd';
import loginBg from "../../assets/login_bg.png"
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import { useNavigate } from 'react-router-dom';

import request from '../../api/index.ts';
import { testApiConnection, testRegisterApi } from '../../utils/apiTest';
import { storeUserPrivateKey } from '../../utils/IBE/keys';
import { setToken } from '../../utils/request/token';

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
    
    // 添加 API 连接测试（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 开发模式：测试 API 连接...');
      await testApiConnection();
    }

    try {
      if (isLogin) {
        // === 登录逻辑 ===
        console.log("登录信息：", userInfo);

        // 构建符合后端接口要求的参数
        const loginParams = {
          phone: userInfo.phone, // 将前端的 username 映射为后端的 phone
          password: userInfo.password
        };

        // 调用登录接口
        const result = await request.login(loginParams);
        
        console.log("登录响应：", result);

        // 判断登录是否成功
        if (result && ((result as any).code === 200 || (result as any).code === 0)) {
          message.success("登录成功！");
          
          // 保存登录信息到本地存储
          if ((result as any).data && (result as any).data.token) {
            const appInfo = {
              token: (result as any).data.token,
              userInfo: (result as any).data.driver,
              role: 'driver',
              driverId: (result as any).data.driver.driver_id,
              username: (result as any).data.driver.username,
              creditScore: (result as any).data.driver.credit_score,
              walletBalance: (result as any).data.driver.wallet_balance
            };
            localStorage.setItem("ROOT_APP_INFO", JSON.stringify(appInfo));
            setToken((result as any).data.token, appInfo);
            console.log("已保存用户信息到本地存储：", appInfo);
            
            // 生成并存储用户私钥
            const userIdentity = `DRIVER_${(result as any).data.driver.driver_id}`;
            storeUserPrivateKey(userIdentity);
            console.log("已生成并存储用户私钥：", userIdentity);
          }

          // 延迟跳转到仪表板
          setTimeout(() => {
            navigate('/dashboard');
          }, 300);
        } else {
          const errorMsg = (result as any)?.message || "登录失败，请检查用户名和密码";
          message.error(errorMsg);
        }
      } else {
        // === 注册逻辑 ===
        console.log("注册信息：", userInfo);

        // 构建符合后端接口要求的注册参数
        const registerParams = {
          phone: userInfo.phone,
          password: userInfo.password,
          username: userInfo.username
        };

        console.log('📤 发送注册请求:', registerParams);

        // 调用注册接口 - 添加错误处理
        let result;
        try {
          result = await request.register(registerParams);
        } catch (apiError) {
          console.error('❌ 注册 API 调用失败:', apiError);
          // 尝试使用测试函数
          result = await testRegisterApi(registerParams);
        }
        
        console.log("注册响应：", result);

        // 判断注册是否成功
        if (result && ((result as any).code === 200 || (result as any).code === 0)) {
          message.success("注册成功！请登录");
          
          // 注册成功后保存用户信息和生成私钥（如果返回了token和用户信息）
          if ((result as any).data && (result as any).data.token && (result as any).data.driver) {
            const appInfo = {
              token: (result as any).data.token,
              userInfo: (result as any).data.driver,
              role: 'driver',
              driverId: (result as any).data.driver.driver_id,
              username: (result as any).data.driver.username,
              creditScore: (result as any).data.driver.credit_score,
              walletBalance: (result as any).data.driver.wallet_balance
            };
            localStorage.setItem("ROOT_APP_INFO", JSON.stringify(appInfo));
            setToken((result as any).data.token, appInfo);
            console.log("已保存注册用户信息到本地存储：", appInfo);
            
            // 生成并存储用户私钥
            const userIdentity = `DRIVER_${(result as any).data.driver.driver_id}`;
            storeUserPrivateKey(userIdentity);
            console.log("已生成并存储用户私钥：", userIdentity);
          }
          
          setTimeout(() => {
            navigate('/add-vehicle');
          }, 300);
        } else {
          const errorMsg = (result as any)?.message || "注册失败，请检查输入信息";
          message.error(errorMsg);
        }
      }
    } catch (error) {
      console.error("操作失败", error);
      message.error(error instanceof Error ? error.message : "操作失败，请稍后重试");
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

<template>
  <div class="login-container">
    <div class="background">
      <div class="shape"></div>
      <div class="shape"></div>
    </div>
    <form>
      <h3>Login Here</h3>

      <label for="username">Username</label>
      <input type="text" placeholder="Username" id="username" v-model="username" />

      <label for="password">Password</label>
      <div class="password-input">
        <input :type="passwordType" placeholder="Password" id="password" v-model="password" />
        <div class="toggle-password" @click="togglePasswordVisibility">
          <img :src="passwordVisible ? eyeOff : eye" alt="eye icon" style="height: 20px; width: 20px;" />
        </div>
      </div>

      <div class="login-btn" @click="handleLogin">Log In</div>
      <!-- <div class="social">
        <div class="go"><i class="fab fa-google"></i> Google</div>
        <div class="fb"><i class="fab fa-facebook"></i> Facebook</div>
      </div> -->
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import router from '../router';

// 导入图标
import eye from '@/assets/icons/eye.svg'
import eyeOff from '@/assets/icons/eyeOff.svg'

const passwordType = ref('password');
const passwordVisible = ref(false);

// 双向绑定表单
const username = ref('');
const password = ref('');
const correctUsername = "admin";
const correctPassword = "admin";

// 切换密码可见性
const togglePasswordVisibility = () => {
  passwordType.value = passwordType.value === 'password' ? 'text' : 'password';
  passwordVisible.value = !passwordVisible.value;
};

// 登录事件
const handleLogin = () => {
  if (username.value === correctUsername && password.value === correctPassword) {
    router.push('/dashboard');
  } else {
    alert('Invalid username or password');
  }
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  background-color: #080710;
}

.background {
  width: 430px;
  height: 520px;
  position: absolute;
  transform: translate(-50%, -50%);
  left: 50%;
  top: 50%;
}

.background .shape {
  height: 200px;
  width: 200px;
  position: absolute;
  border-radius: 50%;
}

.shape:first-child {
  background: linear-gradient(#1845ad, #23a2f6);
  left: -80px;
  top: -80px;
}

.shape:last-child {
  background: linear-gradient(to right, #ff512f, #f09819);
  right: -30px;
  bottom: -80px;
}

form {
  height: fit-content;
  width: 400px;
  background-color: rgba(255, 255, 255, 0.13);
  position: absolute;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 40px rgba(8, 7, 16, 0.6);
  padding: 50px 35px;
}

form * {
  font-family: "Poppins", sans-serif;
  color: #ffffff;
  letter-spacing: 0.5px;
  outline: none;
  border: none;
}

form h3 {
  font-size: 32px;
  font-weight: 500;
  line-height: 42px;
  text-align: center;
}

label {
  display: block;
  margin-top: 30px;
  font-size: 16px;
  font-weight: 500;
}

input {
  display: block;
  height: 50px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.07);
  border-radius: 3px;
  padding: 0 10px;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 300;
}

::placeholder {
  color: #e5e5e5;
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input input {
  width: 100%;
}

.toggle-password {
  position: absolute;
  top: 25px;
  right: 10px;
  cursor: pointer;
  color: #ffffff;
}

.icon-eye {
  color: #000;
}

.login-btn {
  margin-top: 50px;
  width: 100%;
  background-color: #ffffff;
  color: #080710;
  padding: 15px 0;
  font-size: 18px;
  font-weight: 600;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  justify-content: center;
}

.social {
  margin-top: 30px;
  display: flex;
}

.social div {
  background: red;
  width: 150px;
  border-radius: 3px;
  padding: 5px 10px 10px 5px;
  background-color: rgba(255, 255, 255, 0.27);
  color: #eaf0fb;
  text-align: center;
}

.social div:hover {
  background-color: rgba(255, 255, 255, 0.47);
}

.social .fb {
  margin-left: 25px;
}

.social i {
  margin-right: 4px;
}
</style>
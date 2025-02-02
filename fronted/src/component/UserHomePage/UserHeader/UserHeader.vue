<template>
  <div class="user-header">
    <div class="user-logo">
      <div class="main-logo">USER</div>
      <div class="sub-logo">PRO</div>
    </div>
    <div class="search-box">
      <input type="text" class="search-input" placeholder="Search" />
      <button class="search-button">
        <img src="@/assets/icon/icons8-search-50.png" alt="Search" />
      </button>
    </div>
    <div class="user-info">
      <div class="user-balance">${{ balance }}</div>
      <div class="user-message">
        <img src="@/assets/icon/icons8-bell.gif" alt="Bell" />
        <!-- <img src="@/assets/icon/icons8-bell-24.png" alt="Search" /> -->
      </div>
      <div class="user-picture">
        <img class="user-picture-img" src="@/assets/images/user-picture.jpg" alt="user-picture" />
        <img class="online-img" src="@/assets/icon/icons8-online-50.png" alt="online" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserHeader",
  props: {
    balance: {
      type: Number,
      default: 0
    }
  }
};
</script>

<style>
.user-header {
  width: 100%;
  height: 80px;
  padding: 5px 10px;
  top: 0;
  background-color: white;
  background: white;
  /* justify-content: space-between; */
  position: fixed;
  z-index: 1000;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.3);
}

.user-logo {
  margin-left: 20px;
  width: 16%;
  float: left;
  font-size: 70px;
  font-family: Haettenschweiler;
}

.user-logo .main-logo {
  margin-left: 20px;
  bottom: 0px;
  float: left;
}

.user-logo .sub-logo {
  font-size: 20px;
  margin-left: 5px;
  margin-top: 10px;
  float: left;
}

.search-box {
  width: 300px;
  height: 30px;
  display: flex;
  float: left;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 30px; /* 更大的圆角 */
  margin: 14.33px 0px;
  padding: 10px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease; /* 添加过渡效果 */
}

.search-box:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.search-input {
  border: none;
  outline: none;
  padding: 10px;
  width: 240px;
  height: 15px;
  border-radius: 20px;
  box-shadow: none;
}

.search-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
}

.search-button img {
  width: 20px; /* 根据需要调整图标大小 */
}

.user-info {
  width: 300px;
  height: 80px;
  padding: 0 10px;
  float: right;
  display: flex;
  align-items: center;
  /* background-color: pink; */
}

.user-balance {
  width: 40px;
  height: 15px;
  background: linear-gradient(135deg, #d67bde 0%, #9375f2 100%);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  transition: box-shadow 0.3s ease; /* 添加过渡效果 */
}

.user-balance:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.user-message {
  margin: 0 30px;
}

.user-picture {
  margin-left: 45px;
  margin-right: 30px;
  width: 45px;
  height: 45px;
  position: relative;
}

.user-picture-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.online-img {
  width: 23px;
  height: 23px;
  position: absolute;
  top: -6px;
  right: -8px;
}
</style>
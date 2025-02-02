<template>
  <div class="catelog">
    <div class="catelog-top">
      <button class="catelog-box" v-for="(item, index) in topItems" :key="index">
        <img :src="item.icon" :alt="item.title" />
        <div class="catelog-box-title">{{ item.title }}</div>
      </button>
    </div>

    <div class="catelog-bottom">
      <button class="catelog-box" v-for="(item, index) in bottomItems" :key="index">
        <img :src="item.icon" :alt="item.title" />
        <div class="catelog-box-title">{{ item.title }}</div>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      topItems: [
        {
          icon: './src/assets/icon/icons8-home-50.png',
          title: 'Home',
        },
        {
          icon: './src/assets/icon/icons8-order-24.png',
          title: 'Order',
        },
        {
          icon: './src/assets/icon/icons8-dollar-50.png',
          title: 'Earning',
        },
      ],
      bottomItems: [
        {
          icon: './src/assets/icon/icons8-settings-50.png',
          title: 'Settings',
        },
        {
          icon: './src/assets/icon/icons8-help-26.png',
          title: 'Help',
        },
        {
          icon: './src/assets/icon/icons8-feedback-50.png',
          title: 'Feedback',
        },
      ],
    }
  },
}
</script>

<style>
.catelog {
  float: left;
  width: 15%;
  height: 100%;
  background-color: white;
  position: fixed;
  padding: 0 10px;
}

.catelog-top {
  padding-bottom: 20px;
  border-bottom: 1px solid #ccc;
}

.catelog-bottom {
  padding-top: 20px;
}

.catelog-box {
  width: 100%;
  height: 60px;
  margin: 5px 0;
  background-color: white;
  display: flex;
  align-items: center;
  border: none;
  border-radius: 20px;
  transition: background-color 0.3s ease; /* 添加过渡效果 */
}

.catelog-box:hover {
  background-color: #f1f1f1;
}

.catelog-box img {
  width: 24px;
  height: 24px;
  margin-left: 30px;
}

.catelog-box-title {
  margin-left: 20px;
  font-size: 20px;
  font-family: 'OPPOSans H';
}
</style>
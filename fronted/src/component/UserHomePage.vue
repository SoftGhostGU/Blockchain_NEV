<template>
  <div class="user-wrapper">
    <div class="user-header">
      <div class="user-logo">
        <div class="main-logo">USER</div>
        <div class="sub-logo">PRO</div>
      </div>
      <div class="search-box">
        <input type="text" class="search-input" placeholder="Search" />
        <button class="search-button">
          <img src="../assets/icon/icons8-search-50.png" alt="Search" />
        </button>
      </div>
      <div class="user-info">
        <div class="user-balance">${{ balance }}</div>
        <div class="user-message">
          <img src="../assets/icon/icons8-bell.gif" alt="Bell" />
          <!-- <img src="../icon/icons8-bell-24.png" alt="Search" /> -->
        </div>
        <div class="user-picture">
          <img
            class="user-picture-img"
            src="../assets/images/user-picture.jpg"
            alt="user-picture"
          />
          <img class="online-img" src="../assets/icon/icons8-online-50.png" alt="online" />
        </div>
      </div>
    </div>
    <div class="user-container">
      <!-- <div class="user-box">Emergency Use</div>
      <div class="user-box">Food Delivery</div>
      <div class="user-box">Goods Delivery</div>
      <div class="user-box">Medical Treatment</div>
      <div class="user-box">Ride Hailing</div> -->
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

      <div class="content"></div>

      <div class="client-container">
        <div class="client-header">
          <div class="client-header-title">Current Driver</div>
          <div class="client-search">
            <span>Search</span>
            <div>
              <div @click="selectOption('ALL')" class="search-drop">ALL</div>
              <div @click="selectOption('Available')" class="search-drop">Available</div>
              <div @click="selectOption('Busy')" class="search-drop">Busy</div>
              <div @click="selectOption('Online')" class="search-drop">Online</div>
              <div @click="selectOption('Offline')" class="search-drop">Offline</div>
            </div>
          </div>
        </div>

        <div v-for="(client, index) in filteredClients" :key="index" class="client">
          <img class="client-avatar" :src="client.avatar" alt="Driver" />
          <div class="client-info">
            <div class="cline-name">{{ client.name }}</div>
            <div class="client-message">{{ client.message }}</div>
            <img
              class="driver-state-img"
              :src="getStatusImage(client.isOnline, client.isBusy)"
              alt="status"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      balance: 280,
      showDropdown: false,
      selectedOption: 'ALL',
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
      clients: [
        {
          avatar: './src/assets/images/driver-1.jpg',
          name: 'rodbuysmiami',
          message: 'I will send you later, is ok? 😊',
          isOnline: true,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-2.jpg',
          name: 'Parinam',
          message: 'great thank you hope all is...',
          isOnline: false,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-3.jpg',
          name: 'Marif',
          message: 'Open house November 10...',
          isOnline: true,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-4.jpg',
          name: 'Ratuna',
          message: 'just a simple open house f...',
          isOnline: false,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-5.jpg',
          name: 'Priya',
          message: 'hello you did my business ca...',
          isOnline: true,
          isBusy: true,
        },
        {
          avatar: './src/assets/images/driver-6.jpg',
          name: 'Ratan',
          message: 'what do you think about using...',
          isOnline: true,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-7.jpg',
          name: 'Caya',
          message: 'Hi I am done.',
          isOnline: false,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-8.jpg',
          name: 'pinkamu',
          message: 'Very welcome. I will have...',
          isOnline: true,
          isBusy: true,
        },
        {
          avatar: './src/assets/images/driver-9.jpg',
          name: 'Ck',
          message: 'Sorry. My mistake. I saw old...',
          isOnline: true,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-10.jpg',
          name: 'Maya',
          message: 'Thank you.',
          isOnline: true,
          isBusy: true,
        },
        {
          avatar: './src/assets/images/driver-11.jpg',
          name: 'Cak',
          message: 'YES!! Much better. Send file.',
          isOnline: false,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-12.jpg',
          name: 'Mike',
          message: '... Other messages here.',
          isOnline: true,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-13.jpg',
          name: 'Sarah',
          message: 'Ready for your next trip!',
          isOnline: true,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-14.jpg',
          name: 'John',
          message: 'Taking a break right now.',
          isOnline: false,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-15.jpg',
          name: 'Emily',
          message: 'Available for new orders.',
          isOnline: true,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-16.jpg',
          name: 'David',
          message: 'Currently on another job.',
          isOnline: true,
          isBusy: true,
        },
        {
          avatar: './src/assets/images/driver-17.jpg',
          name: 'Linda',
          message: 'Not available at the moment.',
          isOnline: false,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-18.jpg',
          name: 'Chris',
          message: 'Ready to go!',
          isOnline: true,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-19.jpg',
          name: 'Jessica',
          message: 'Working on a delivery.',
          isOnline: true,
          isBusy: true,
        },
        {
          avatar: './src/assets/images/driver-20.jpg',
          name: 'Michael',
          message: 'Available for rides.',
          isOnline: true,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-21.jpg',
          name: 'Amanda',
          message: 'On my way to pick you up.',
          isOnline: true,
          isBusy: true,
        },
        {
          avatar: './src/assets/images/driver-22.jpg',
          name: 'Daniel',
          message: 'Looking for new orders.',
          isOnline: true,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-23.jpg',
          name: 'Olivia',
          message: 'Taking a short break.',
          isOnline: false,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-24.jpg',
          name: 'James',
          message: 'Available for work.',
          isOnline: true,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-25.jpg',
          name: 'Sophia',
          message: 'On a job, will be back soon.',
          isOnline: true,
          isBusy: true,
        },
        {
          avatar: './src/assets/images/driver-26.jpg',
          name: 'William',
          message: 'Ready to help.',
          isOnline: true,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-27.jpg',
          name: 'Isabella',
          message: 'Taking a lunch break.',
          isOnline: false,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-28.jpg',
          name: 'Benjamin',
          message: 'Available for orders.',
          isOnline: true,
          isBusy: false,
        },
        {
          avatar: './src/assets/images/driver-29.jpg',
          name: 'Charlotte',
          message: 'Currently busy.',
          isOnline: true,
          isBusy: true,
        },
        {
          avatar: './src/assets/images/driver-30.jpg',
          name: 'Ethan',
          message: 'Ready to go!',
          isOnline: true,
          isBusy: false,
        },
      ],
    }
  },
  computed: {
    filteredClients() {
      if (this.selectedOption === 'ALL') {
        return this.clients;
      } else if (this.selectedOption === 'Online') {
        return this.clients.filter(client => client.isOnline);
      } else if (this.selectedOption === 'Offline') {
        return this.clients.filter(client => !client.isOnline);
      } else if (this.selectedOption === 'Busy') {
        return this.clients.filter(client => client.isBusy);
      } else if (this.selectedOption === 'Available') {
        return this.clients.filter(client => client.isOnline & !client.isBusy);
      }
      return this.clients;
    }
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    selectOption(option) {
      this.selectedOption = option;
      this.toggleDropdown(); // 选中后关闭下拉菜单
    },
    getStatusImage(isOnline, isBusy) {
      if (!isOnline) {
        return './src/assets/icon/icons8-offline-50.png' // 离线状态图标
      }
      return isBusy
        ? './src/assets/icon/icons8-busy-50.png' // 忙碌状态图标
        : './src/assets/icon/icons8-online-50.png' // 在线状态图标
    },
  },
}
</script>

<style scoped>
.user-wrapper {
  min-height: 97.5vh;
  display: flex;
  /* align-items: center; */
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  /* padding: 20px; */
  flex-wrap: wrap; /* 可选：如果容器宽度不足以容纳所有子元素，子元素会换行 */
}

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

.user-container {
  width: 100%;
  /* height: 100px; */
  margin-top: 80px;
  display: flex;
  float: left;
  flex-wrap: wrap; /* 允许换行 */
  background-color: white;
}

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

.content {
  margin-left: 15%;
  width: 65%;
  /* background-color: purple; */
}

.client-container {
  width: 20%;
  right: 0;
  margin-top: 5px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  /* padding: 10px; */
  font-family: Arial, sans-serif;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.3);
  /*   
  display: flex;
    flex-direction: row; */
}

.client-header {
  width: 100%;
  height: 45px;
  color: #fff;
}

.client-header-title {
  float: left;
  width: 50%;
  height: 45px;
  color: black;
  font-size: 25px;
  padding-left: 20px;
  line-height: 45px;
  font-family: 'impact';
}

.client-search {
  width: 40%;
  height: 45px;
  color: black;
  line-height: 45px;
  text-align: center;
  position: relative;
  overflow: hidden;
  float: right;
  background: linear-gradient(135deg, #82e0e5 0%, #6ca4f8 100%);
}

.client-search:hover {
  overflow: visible;
  background: black;
  color: white;
  z-index: 999;
  cursor: pointer;
}

.search-drop {
  background: rgb(247, 247, 247);
  color: black;
  text-align: center;
  width: 100%;
  height: 45px;
  line-height: 45px;
  overflow: hidden;
}

.search-drop:hover {
  background: linear-gradient(135deg, #82e0e5 0%, #6ca4f8 100%);
  color: white;
  cursor: pointer;
}

.client {
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  margin: 10px;
  transition: background-color 0.3s ease; /* 添加过渡效果 */
}

.client:hover {
  background-color: #f1f1f1;
}

.client-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 20px;
  /* background-color: #cfcfcf; */
  position: absolute;
}

.client-info {
  position: relative;
  left: 50px;
  flex-direction: column; /* 使子元素垂直排列 */
}

.cline-name {
  position: relative;
  top: 13px;
  width: 100%;
  height: 22px;
  font-size: 16px;
  color: #555;
  font-family: 'Cooper Black';
}

.client-message {
  position: relative;
  top: 13px;
  width: 100%;
  height: 18px;
  font-size: 12px;
  color: #555;
}

.driver-state-img {
  width: 20px;
  position: relative;
  left: -30px;
  top: -30px;
}

.user-box {
  width: 260px;
  height: 260px;
  background: white;
  border-radius: 20px;
  margin: 10px;
  padding: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  /* display: flex; */
  float: left;
}
</style>
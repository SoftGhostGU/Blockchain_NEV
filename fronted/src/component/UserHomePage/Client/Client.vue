<template>
  <div class="clients-container">
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
</template>

<script>
export default {
  name: 'Client',
  data() {
    return {
      showDropdown: false,
      selectedOption: 'ALL',
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
  props: {
    filteredClients: {
      type: Array,
      required: true,
    },
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    selectOption(option) {
      console.log(option)
      this.selectedOption = option
      this.toggleDropdown() // 选中后关闭下拉菜单
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
  computed: {
    filteredClients() {
      if (this.selectedOption === 'ALL') {
        return this.clients
      } else if (this.selectedOption === 'Online') {
        return this.clients.filter((client) => client.isOnline)
      } else if (this.selectedOption === 'Offline') {
        return this.clients.filter((client) => !client.isOnline)
      } else if (this.selectedOption === 'Busy') {
        return this.clients.filter((client) => client.isBusy)
      } else if (this.selectedOption === 'Available') {
        return this.clients.filter((client) => client.isOnline && !client.isBusy)
      }
      return this.clients
    },
  },
}
</script>

<style scoped>
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
</style>
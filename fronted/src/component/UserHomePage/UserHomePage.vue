<template>
  <div class="user-wrapper">
    <UserHeader :balance="balance"/>
    <div class="user-container">
      <div class="catelog">
        <Catelog />
      </div>

      <div class="content">
        <div class="Carousel">
          <Carousel />
        </div>
        <div class="get-service">
          <h2>Get Pro Services</h2>
          <GetService />
        </div>
        <div class="get-history">
          <h2>Order History</h2>
          <history-cards :projects="projects"/>
        </div>
      </div>

      <div class="client-container">
        <Client/>
      </div>
    </div>
  </div>
</template>

<script>
import UserHeader from './UserHeader/UserHeader.vue';
import Catelog from './Catelog/Catelog.vue';
import Carousel from './Carousel/Carousel.vue'
import GetService from './GetService/GetService.vue';
import HistoryCards from './HistoryCards/HistoryCards.vue';
import Client from './Client/Client.vue';

export default {
  components: {
    UserHeader,
    Catelog,
    Carousel,
    GetService,
    HistoryCards,
    Client,
  },
  data() {
    return {
      balance: 280,
      projects: [
        {
          image: './src/assets/images/driver-1.jpg',
          title: 'Ride Hailing to workplace',
          description:
            'From: My Home, To: My Company; Travel Time: Approximately 31 minutes; Departure Time: 7:53 AM\n- Arrival Time: 8:24 AM',
          status: 'Open • 10 months ago • 2025/01/26',
          tags: ['Ride Hailing', 'Workplace', 'Home', '31 Min', 'Morning'],
          price: '$18',
          type: 'service-type-ride-hailing',
        },
        {
          image: './src/assets/images/driver-4.jpg',
          title: 'Goods Delivery',
          description:
            'Shop: Tech Store; Address: 456 Tech St, Anytown USA; Delivery Time: 11:00 AM\n- Delivery Time: 11:30 AM',
          status: 'Open • 10 months ago • 2025/01/28',
          tags: ['Goods Delivery', 'Shop', 'Tech Store', '30 Min', 'Morning'],
          price: '$8',
          type: 'service-type-goods-delivery',
        },
        {
          image: './src/assets/images/driver-6.jpg',
          title: 'Emergency Use',
          description:
            'Type: Emergency Room; Location: City Hospital; Departure Time: 12:00 PM\n- Arrival Time: 12:15 PM',
          status: 'Open • 10 months ago • 2025/01/26',
          tags: ['Emergency Use', 'Emergency Room', 'City Hospital', '15 Min', 'Afternoon'],
          price: '$100',
          type: 'service-type-emergency-use',
        },
        {
          image: './src/assets/images/driver-2.jpg',
          title: 'Ride Hailing to Shopping Mall',
          description:
            'From: My Home, To: Shopping Mall; Travel Time: Approximately 28 minutes; Departure Time: 10:00 AM\n- Arrival Time: 10:28 AM',
          status: 'Open • 10 months ago • 2025/01/27',
          tags: ['Ride Hailing', 'Shopping', 'Home', '28 Min', 'Morning'],
          price: '$20',
          type: 'service-type-ride-hailing',
        },
        {
          image: './src/assets/images/driver-5.jpg',
          title: 'Food Delivery',
          description:
            'Shop: McDonald\'s; Address: 123 Main St, Anytown USA; Delivery Time: 10:00 AM\n- Delivery Time: 10:30 AM',
          status: 'Open • 10 months ago • 2025/01/29',
          tags: ['Food Delivery', 'Breakfast', 'Fast Food', '30 Min'],
          price: '$15',
          type: 'service-type-food-delivery',
        },
        {
          image: './src/assets/images/driver-7.jpg',
          title: 'Medical Treatment',
          description:
            'Doctor: Dr. Zhang, Specialty: Internal Medicine; Treatment Time: Approximately 30 minutes; Departure Time: 9:00 AM\n- Arrival Time: 9:30 AM',
          status: 'Open • 10 months ago • 2025/01/25',
          tags: ['Medical Treatment', 'Internal Medicine', 'Treatment', '30 Min', 'Morning'],
          price: '$50',
          type: 'service-type-medical-treatment',
        },
        {
          image: './src/assets/images/driver-3.jpg',
          title: 'Ride Hailing to Airport',
          description:
            'From: My Home, To: Airport; Travel Time: Approximately 45 minutes; Departure Time: 3:20 PM\n- Arrival Time: 4:05 PM',
          status: 'Open • 10 months ago • 2025/01/27',
          tags: ['Ride Hailing', 'Airport', 'Home', '45 Min', 'Afternoon'],
          price: '$30',
          type: 'service-type-ride-hailing',
        },
        // 你可以在此处添加更多项目
      ],
    }
  },
}
</script>

<style scoped>
.user-wrapper {
  min-height: 97.5vh;
  display: flex;
  /* align-items: center; */
  justify-content: center;
  /* background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); */
  /* padding: 20px; */
  flex-wrap: wrap; /* 可选：如果容器宽度不足以容纳所有子元素，子元素会换行 */
}

.user-container {
  width: 100%;
  /* height: 100px; */
  margin-top: 90px;
  display: flex;
  float: left;
  flex-wrap: wrap; /* 允许换行 */
  background-color: white;
}

.content {
  margin-left: 20%;
  width: 60%;
  /* background-color: purple; */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.Carousel {
  margin: 20px 0 40px 0;
  height: 280px;
  width: 600px;
}

.get-service {
  width: 100%;
  display: block;
  margin-bottom: 20px;
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
  /* display: flex;
  flex-direction: row; */
}
</style>
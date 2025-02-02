<template>
  <div class="card-container">
    <div
      class="card"
      v-for="(item, index) in projects.slice().reverse()"
      :key="index"
      :class="item.type"
    >
      <div class="card-content">
        <img :src="item.image" alt="Profile" class="profile-pic" />
        <div class="text-content">
          <h2>{{ item.title }}</h2>
          <p>{{ item.description }}</p>
          <hr />
          <span class="status">{{ item.status }} | </span>
          <span class="tags">{{ item.tags.join(', ') }}</span>
        </div>
        <div class="price">
          <span>{{ item.price }}</span>
          <button class="apply-btn">Find out more</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    projects: {
      type: Array,
      default: () => [
        {
          image: './src/assets/images/user-picture.jpg',
          title: 'No History Found',
          description:
            'Click the button above and use the service',
          status: '----------',
          tags: ['---', '---', '---', '---', '---'],
          price: '$---',
          type: 'service-type-ride-hailing',
        },
      ],
    },
  },
}
</script>

<style>
.card {
  position: relative; /* 为了使伪元素定位相对卡片 */
  width: 85%;
  border-radius: 10px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin: 20px;
  padding: 20px;
  display: flex;
  transition: all 0.3s ease; /* 添加过渡效果 */
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

.card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.service-type-emergency-use::before {
  background: linear-gradient(135deg, #909ff8 0%, #3b48e2 100%);
}

.service-type-ride-hailing::before {
  background: linear-gradient(135deg, #81e6d9 0%, #4bc0c8 100%);
}

.service-type-food-delivery::before {
  background: linear-gradient(135deg, #d67bde 0%, #9375f2 100%);
}

.service-type-goods-delivery::before {
  background: linear-gradient(135deg, #f7c2a2 0%, #f09070 100%);
}

.service-type-medical-treatment::before {
  background: linear-gradient(135deg, #1deb99 0%, #159f88 100%);
}

.card-content {
  display: flex;
  flex: 1;
  align-items: center;
}

.profile-pic {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 20px;
}

.text-content {
  flex: 1;
}

.text-content h2 {
  margin: 0;
  font-size: 1.2em;
}

.text-content p {
  margin: 10px 0;
  color: gray;
}

.status {
  font-size: 0.9em;
  color: #666;
}

.tags {
  font-size: 0.9em;
  color: #888;
}

.price {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  margin: 0 10px;
}

.price span {
  font-size: 1.5em;
  font-weight: bold;
  color: #4caf50; /* 绿色 */
}

.apply-btn {
  padding: 10px 20px;
  /* background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%); */
  color: black;
  border: black 1px solid;
  margin: 10px 0;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: all 0.3s;
}

.apply-btn:hover {
  color: white;
  border: white 1px solid;
  background: linear-gradient(90deg, #2575fc 0%, #6a11cb 100%);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}
</style>
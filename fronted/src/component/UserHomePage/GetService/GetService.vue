<template>
  <div class="get-service-box">
    <div class="user-box">
      <p class="user-box-title">Emergency Use</p>
      <p class="user-box-desc">
        Get necessary assistance and services quickly in emergency situations.
      </p>
    </div>
    <div class="user-box">
      <p class="user-box-title">Food Delivery</p>
      <p class="user-box-desc">
        Enjoy fast and efficient food delivery services to meet your dietary needs.
      </p>
    </div>
    <div class="user-box">
      <p class="user-box-title">Goods Delivery</p>
      <p class="user-box-desc">
        Conveniently receive everyday items with our fast and efficient goods delivery service.
      </p>
    </div>
    <div class="user-box">
      <p class="user-box-title">Medical Treatment</p>
      <p class="user-box-desc">
        Receive professional medical care to ensure timely support when needed.
      </p>
    </div>
    <div class="user-box">
      <p class="user-box-title">Ride Hailing</p>
      <p class="user-box-desc">
        Convenient travel options, ensuring quick arrival at your destination.
      </p>
    </div>
  </div>
</template>

<script>
</script>

<style>
.user-box {
  width: 250px;
  /* height: 80px; */
  border-radius: 20px;
  margin: 10px;
  padding: 30px 25px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  /* display: flex; */
  float: left;
  text-align: center;
  align-items: center;
  display: flex;
  flex-direction: column;
  background: none;
}

.get-service-box {
  width: 100%;
}

.get-service-box > :first-child {
  background: linear-gradient(135deg, #909ff8 0%, #3b48e2 100%);
}

.get-service-box > :nth-child(2) {
  background: linear-gradient(135deg, #d67bde 0%, #9375f2 100%);
}

.get-service-box > :nth-child(3) {
  background: linear-gradient(135deg, #f7c2a2 0%, #f09070 100%);
}

.get-service-box > :nth-child(4) {
  background: linear-gradient(135deg, #1deb99 0%, #159f88 100%);
}

.get-service-box > :nth-child(5) {
  background: linear-gradient(135deg, #81e6d9 0%, #4bc0c8 100%);
}

.user-box-title {
  background-color: none;
  font-size: 26px;
  margin: 5px;
  color: #f1f1f1;
  font-family: 'impact';
}

.user-box-desc {
  background-color: none;
  font-size: 11px;
  margin: 5px;
  color: #f1f1f1;
}
</style>
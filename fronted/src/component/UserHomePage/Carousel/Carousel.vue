<template>
  <swiper
    class="Carousel"
    :pagination="{ clickable: true }"
    :modules="modules"
    :autoplay="autoplayOptions"
    ref="mySwiper"
    :watchSlidesProgress="true"
  >
    <swiper-slide v-for="(image, index) in images" :key="index">
      <img :src="image" alt="Slide Image" class="Carousel-image" />
    </swiper-slide>
  </swiper>
</template>

<script>
// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      modules: [Pagination, Autoplay],
      images: [
        './src/component/UserHomePage/Carousel/images/01.jpg',
        './src/component/UserHomePage/Carousel/images/02.jpg',
        './src/component/UserHomePage/Carousel/images/03.jpg',
        './src/component/UserHomePage/Carousel/images/04.jpg',
        './src/component/UserHomePage/Carousel/images/05.jpg',
        './src/component/UserHomePage/Carousel/images/06.jpg',
        './src/component/UserHomePage/Carousel/images/07.jpg',
        './src/component/UserHomePage/Carousel/images/08.jpg',
        './src/component/UserHomePage/Carousel/images/09.jpg',
        './src/component/UserHomePage/Carousel/images/10.jpg',
      ],
      autoplayOptions: {
        delay: 2000,
        disableOnInteraction: false,
      },
    }
  },
}
</script>

<style>
.Carousel {
  padding: 0 10%;
  height: 280px;
  width: 600px;
}

.Carousel-image {
  height: 280px;
  width: 600px;
  transition: all 0.5s ease-in-out;
}

/* 为前一张照片应用特殊的样式 */
.swiper-slide-prev .Carousel-image {
  filter: blur(2px);
  opacity: 0.8;
  transform: scale(0.8) translateX(50px);
  transition: all 0.5s ease-in-out;
}

/* 为后一张照片应用特殊的样式 */
.swiper-slide-next .Carousel-image {
  filter: blur(2px);
  opacity: 0.8;
  transform: scale(0.8) translateX(-50px);
}
</style>

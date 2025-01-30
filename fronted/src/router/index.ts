import { createRouter, createWebHistory } from 'vue-router';
import Login from '../component/Login.vue';
// import NotFound from '../component/NotFound.vue';
// import DriverHomePage from '../component/DriverHomePage.vue';
// import UserHomePage from '../component/UserHomePage.vue';

const routes = [
  {
    path: '/', 
    component: Login
  },
  // {
  //   path: '/driver', 
  //   component: DriverHomePage
  // },
  // {
  //   path: '/user', 
  //   component: UserHomePage
  // },
  // {
  //   path: '/:pathMatch(.*)*', 
  //   component: NotFound
  // }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

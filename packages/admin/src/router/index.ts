import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/dashboard', component: Dashboard,
    children: [
      {
        path: 'car-management',
        children: [
          {
            path: 'car-view',
            component: () => import('@/views/dashboards/CarManagement/CarView.vue')
          },
          {
            path: 'car-approval',
            component: () => import('@/views/dashboards/CarManagement/CarApproval.vue')
          }
        ]
      },
      {
        path: 'user-management',
        children: [
          {
            path: 'user-view',
            component: () => import('@/views/dashboards/UserManagement/UserView.vue')
          },
          {
            path: 'owner-view',
            component: () => import('@/views/dashboards/UserManagement/OwnerView.vue')
          },
        ]
      },
      {
        path: 'comment-management',
        children: [
          {
            path: 'comment-view',
            component: () => import('@/views/dashboards/CommentManagement/CommentView.vue')
          },
          {
            path: 'comment-approval',
            component: () => import('@/views/dashboards/CommentManagement/CommentApproval.vue')
          }
        ]
      },
      {
        path: 'order-management',
        component: () => import('@/views/dashboards/OrderManagement.vue')
      },
      {
        path: 'finance-management',
        component: () => import('@/views/dashboards/FinanceManagement.vue')
      }
    ]
   }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

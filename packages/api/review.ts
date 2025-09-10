import request from '@/utils/request'
import type { ReviewDTO } from '@/types/review'

// 获取所有评论
export function getReviews() {
  return request.get<ReviewDTO[]>('/reviews')
}

// 根据 driver_id 获取评论
export function getReviewsByDriver(driverId: number) {
  return request.get<ReviewDTO[]>(`/reviews/driver/${driverId}`)
}

// 根据 user_id 获取评论
export function getReviewsByUser(userId: number) {
  return request.get<ReviewDTO[]>(`/reviews/user/${userId}`)
}

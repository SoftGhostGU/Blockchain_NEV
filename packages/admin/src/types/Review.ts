export interface ReviewDTO {
  review_id: number
  order_id: string | null
  user_id: number | null
  driver_id: number | null
  content: string | null
  created_at: string
  updated_at: string
  comment_star: number | null
}

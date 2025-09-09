export interface DriverDTO {
  driver_id: number
  username: string
  phone: string
  password: string
  credit_score: number
  wallet_balance: number
  bank_card: string | null
  created_at: string
  updated_at: string
}

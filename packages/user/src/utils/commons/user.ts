import { z } from 'zod';

export const emailSchema = z.string().email({ message: '请输入有效的邮箱地址' });

export const usernameSchema = z.string()
  .min(3, { message: '用户名至少需要3个字符' })
  .max(18, { message: '用户名最多18个字符' })

export const passwordSchema = z.string()
  .min(6, { message: '密码至少需要6个字符' })
  .max(32, { message: '密码最多32个字符' })
  //.regex(/[A-Z]/, { message: '密码必须包含至少一个大写字母' })
  //.regex(/[a-z]/, { message: '密码必须包含至少一个小写字母' })
  .regex(/[0-9]/, { message: '密码必须包含至少一个数字' });

export const verificationCodeSchema = z.string()
  .length(6, { message: '验证码必须是6位数字' })
  .regex(/^[0-9]+$/, { message: '验证码只能是数字' });

export const userGenderSchema = z.union([z.literal(0), z.literal(1), z.literal(2)]);

export const userRegisterSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  verifyCode: verificationCodeSchema
});
export const userLoginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema
});
export const userUpdateInfoSchema = z.object({
  username: usernameSchema.optional(),
  gender: userGenderSchema.optional(),
});
export const userUpdatePasswordSchema = z.object({
  newPassword: passwordSchema,
  oldPassword: passwordSchema
});
export const userUpdateEmailSchema = z.object({
  email: emailSchema,
  verifyCode: verificationCodeSchema
});
export const userForgetPasswordSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  verifyCode: verificationCodeSchema
});

export type UserRegister = z.infer<typeof userRegisterSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserUpdateInfo = z.infer<typeof userUpdateInfoSchema>;
export type UserUpdatePassword = z.infer<typeof userUpdatePasswordSchema>;
export type UserUpdateEmail = z.infer<typeof userUpdateEmailSchema>;
export type UserForgetPassword = z.infer<typeof userForgetPasswordSchema>;
export const USER_TYPE = {
  USER: 0,
  REVIEWER: 1,
  ADMIN: 2
}
export interface UserInfo {
  username: string
  avatar: string
  userType: number
  email: string
  gender: number
  registerTime: string
  _count: {
    Passage: number
  }
  uid: number
}

import { View, Image } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import './UserAvatar.scss'

interface UserAvatarProps {
  src?: string
  size?: 'small' | 'medium' | 'large'
  className?: string
  onClick?: () => void
}

export default function UserAvatar({ 
  src, 
  size = 'medium', 
  className = '', 
  onClick 
}: UserAvatarProps) {
  const sizeMap = {
    small: 60,
    medium: 80,
    large: 100
  }

  const avatarSize = sizeMap[size]

  return (
    <View 
      className={`user-avatar ${size} ${className}`}
      style={{ width: `${avatarSize}rpx`, height: `${avatarSize}rpx` }}
      onClick={onClick}
    >
      {src ? (
        <Image 
          src={src} 
          className='avatar-image'
          mode='aspectFill'
        />
      ) : (
        <View className='avatar-placeholder'>
          <AtIcon value='user' size={avatarSize / 4} color='#8c8c8c' />
        </View>
      )}
      <View className='avatar-border' />
    </View>
  )
}
import { View } from '@tarojs/components'

interface TirePressureIconProps {
  size?: number
  className?: string
}

export default function TirePressureIcon({ size = 20, className }: TirePressureIconProps) {
  return (
    <View className={className} style={{ width: `${size}px`, height: `${size}px`, display: 'inline-block' }}>
      <svg 
        viewBox="0 0 1024 1024" 
        version="1.1" 
        xmlns="http://www.w3.org/2000/svg" 
        width="100%" 
        height="100%"
      >
        <path 
          d="M512 512a90.784478 90.784478 0 0 0-39.431642 9.017313L324.852537 373.37791l-43.176119 43.17612 147.639403 147.715821A91.701493 91.701493 0 1 0 512 512z" 
          fill="#515151"
        />
        <path 
          d="M878.80597 512a366.80597 366.80597 0 0 0-733.61194 0h61.134328a305.671642 305.671642 0 0 1 611.343284 0z" 
          fill="#515151"
        />
        <path 
          d="M512 0a512 512 0 0 0-296.195821 929.547463l46.767761-70.151642a427.940299 427.940299 0 1 1 465.690747 21.702686l61.134328 61.134329A512 512 0 0 0 512 0z" 
          fill="#515151"
        />
      </svg>
    </View>
  )
}
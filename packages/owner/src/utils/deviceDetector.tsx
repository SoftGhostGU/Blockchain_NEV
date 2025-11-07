// 检测设备类型的工具函数
export const isMobileDevice = (): boolean => {
  // 判断是否为移动设备
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// 创建一个移动端提示组件
export const MobileWarning = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#fff',
      color: '#333',
      fontSize: '18px',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{
        marginBottom: '20px',
        fontSize: '48px'
      }}>
        📱
      </div>
      <h2>请用电脑端查看</h2>
      <p style={{
        marginTop: '10px',
        fontSize: '16px',
        color: '#666'
      }}>
        该页面需要在电脑端浏览器中查看以获得最佳体验
      </p>
    </div>
  );
};
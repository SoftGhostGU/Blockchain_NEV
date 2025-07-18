import notFound from '../../assets/404_white.png';

export default function NotFound() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 'calc(100vh - 72px)',
    }}>
      {/* <div
        style={{
          fontSize: '64px',
          fontWeight: 'bold',
          fontFamily: 'Goudy Stout',
          position: 'absolute',
          top: '30%',
          left: '65%',
          transform: 'translate(-50%, -50%)',
          color: '#b4a3ea',
        }}
      >
        <div>404 Not</div>
        <div style={{paddingLeft: '40px'}}>Found</div>
      </div> */}
      <img
        src={notFound}
        alt="logo"
        style={{
          width: '70%',
          position: 'absolute',
          left: '50%',
          top: '45%',
          transform: 'translate(-50%, -50%)',
        }}
      ></img>
      {/* <div
        style={{
          fontSize: '36px',
          fontWeight: 'bold',
          fontFamily: 'Goudy Stout',
          position: 'absolute',
          top: '63%',
          left: '65%',
          transform: 'translate(-50%, -50%)',
          color: '#b4a3ea',
        }}
      >AutoCrowd</div> */}
    </div>

  )
}
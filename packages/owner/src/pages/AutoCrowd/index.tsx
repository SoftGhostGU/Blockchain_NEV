import './index.scss'
import { Clock as ClockText } from '../../components/Clock/clock'
import Clock from 'react-clock';
import Calendar from '../../components/calendar'
// import { Weather } from '../../components/weather'
import { useEffect, useState, lazy, Suspense, useRef } from 'react';
import { useColorModeStore } from '../../store/store';
import outer_img from '../../assets/outer_img.png'
import video from '../../assets/testmp4.mp4'
// import 'react-clock/dist/Clock.css';
import { Image } from 'antd';

// 懒加载天气组件
const WeatherLazy = lazy(() => import('../../components/Weather/weather'));

export default function AutoCrowd() {
  const [value, setValue] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setValue(new Date()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const isNightMode = useColorModeStore(state => state.isNightMode);
  useEffect(() => {
    const reactClockFace = document.querySelectorAll('.react-clock__face');
    const reactClockHandBody = document.querySelectorAll('.react-clock__hand__body');
    const reactClockMarkBody = document.querySelectorAll('.react-clock__mark__body');
    const time = document.querySelector('.time');
    const calendar = document.querySelector('.calendar');
    const weather = document.querySelector('.weather');
    const videoContainer = document.querySelector('.video-container');
    if (isNightMode) {
      reactClockFace.forEach(item => { item.classList.add('night-mode'); });
      reactClockHandBody.forEach(item => { item.classList.add('night-mode'); });
      reactClockMarkBody.forEach(item => { item.classList.add('night-mode'); });
      time?.classList.add('night-mode');
      calendar?.classList.add('night-mode');
      weather?.classList.add('night-mode');
      videoContainer?.classList.add('night-mode');
      // ;
    } else {
      reactClockFace.forEach(item => { item.classList.remove('night-mode'); });
      reactClockHandBody.forEach(item => { item.classList.remove('night-mode'); });
      reactClockMarkBody.forEach(item => { item.classList.remove('night-mode'); });
      time?.classList.remove('night-mode');
      calendar?.classList.remove('night-mode');
      weather?.classList.remove('night-mode');
      videoContainer?.classList.remove('night-mode');
      // ;
    }
  }, [isNightMode]);

  return (
    <div>
      <div className='auto-crowd-container'>
        <div className="column-auto-crowd">
          <div className="time">
            <Clock value={value} />
            <ClockText />
          </div>
          <div className='calendar'>
            <Calendar />
          </div>
        </div>
        <div className="column-auto-crowd">
          <div className='video-container'>
            <Image
              width="100%"
              preview={{
                destroyOnHidden: true,
                imageRender: () => (
                  <video
                    // muted
                    width="60%"
                    controls
                    src={video}
                    autoPlay
                  />
                ),
                toolbarRender: () => null,
              }}
              src={outer_img}
            />
          </div>
          <div className="weather">
            <Suspense fallback={<div>加载中...</div>}>
              {/* <WeatherLazy /> */}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
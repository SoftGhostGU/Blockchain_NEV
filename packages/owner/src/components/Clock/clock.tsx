import React, { useEffect, useRef, useState } from 'react';
import './clock.scss';
import { useColorModeStore } from '../../store/store';

export const Clock = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [currentDate, setCurrentDate] = useState('');

  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  // 获取日期
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'long', // 8月
        day: 'numeric', // 13日
      });
      // 这里 toLocaleDateString 在 zh-CN 会直接是 "2025年8月13日"
      setCurrentDate(formatter.format(now));
    };

    updateDate(); // 初始化
    const dateTimer = setInterval(updateDate, 60 * 1000); // 每分钟更新一次
    return () => clearInterval(dateTimer);
  }, []);

  const isNightMode = useColorModeStore(state => state.isNightMode);
  useEffect(() => {
    const clock = document.querySelectorAll('.clock');
    if (isNightMode) {
      clock.forEach(item => { item.classList.add('night-mode'); });
      ;
    } else {
      clock.forEach(item => { item.classList.remove('night-mode'); });
      ;
    }
  }, [isNightMode]);

  return (
    <main id="board" ref={boardRef}>
    <div className='date'>{currentDate}</div>
    <div className="clock">
      <div className="hours">
        <div className="first"><div className="number">{hh[0]}</div></div>
        <div className="second"><div className="number">{hh[1]}</div></div>
      </div>
      <div className="tick">:</div>
      <div className="minutes">
        <div className="first"><div className="number">{mm[0]}</div></div>
        <div className="second"><div className="number">{mm[1]}</div></div>
      </div>
      <div className="tick">:</div>
      <div className="seconds">
        <div className="first"><div className="number">{ss[0]}</div></div>
        <div className="second infinite"><div className="number">{ss[1]}</div></div>
      </div>
    </div>
  </main>
  );
};
// import React from 'react';

const IconFont = ({ type, ...props }: { type: string }) => (
  <span className={`iconfont ${type}`} {...props} />
);

export default IconFont;

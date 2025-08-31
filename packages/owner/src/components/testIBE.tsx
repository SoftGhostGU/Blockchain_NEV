import React, { useEffect } from 'react';
import { encrypt } from '../utils/IBE/encrypt';
import { decrypt } from '../utils/IBE/decrypt';

const TestIBE: React.FC = () => {
  useEffect(() => {
    const order = {
      order_id: "A-10086",
      driver_id: "67890",
      plate_number: "沪A12345",
      phone: "13800000000"
    };
    const policy = "(USER_1) OR (DRIVER_67890) OR (ADMIN)";

    // 加密
    const ciphertextObj = encrypt(order, policy);
    console.log("加密结果:", ciphertextObj);

    // 测试不同身份解密
    const identities = ["DRIVER_67890", "USER_1", "DRIVER_11111", "ADMIN", "USER_2"];

    identities.forEach(id => {
      const decrypted = decrypt(ciphertextObj, id);
      console.log(`--- 解密身份: ${id} ---`);
      console.log(decrypted);
    });
  }, []);

  return <div>IBE 测试组件（硬编码公私钥），打开控制台查看结果</div>;
};

export default TestIBE;

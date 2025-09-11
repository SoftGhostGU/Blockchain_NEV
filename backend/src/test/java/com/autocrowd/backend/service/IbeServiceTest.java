package com.autocrowd.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;

import javax.annotation.Resource;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@Import(TestConfig.class)
public class IbeServiceTest {

    @Resource
    private IbeService ibeService;

    @MockBean
    private PairingBasedCryptosystem pbc;

    @Test
    public void testGetPublicKey() {
        // 模拟PBC返回公钥
        when(pbc.generateMasterKey()).thenReturn("masterKey");
        when(pbc.derivePublicKey("masterKey")).thenReturn("publicKey");

        IbeService testService = new IbeService(pbc);
        String publicKey = testService.getPublicKey();
        assertNotNull(publicKey, "Public key should not be null");
        assertFalse(publicKey.isEmpty(), "Public key should not be empty");
        System.out.println("Public Key: " + publicKey);
    }

    @Test
    public void testGeneratePrivateKey() {
        // 模拟PBC行为
        when(pbc.generateMasterKey()).thenReturn("masterKey");
        when(pbc.derivePublicKey("masterKey")).thenReturn("publicKey");
        when(pbc.generatePrivateKey("masterKey", "USER_123"))
            .thenReturn("privateKey".getBytes());

        IbeService testService = new IbeService(pbc);
        String attribute = "USER_123";
        var result = testService.generatePrivateKey(attribute);
        
        assertNotNull(result, "Result should not be null");
        assertEquals(attribute, result.get("attribute"), "Attribute should match");
        assertNotNull(result.get("private_key"), "Private key should not be null");
        assertFalse(((String)result.get("private_key")).isEmpty(), "Private key should not be empty");
        
        System.out.println("Attribute: " + result.get("attribute"));
        System.out.println("Private Key: " + result.get("private_key"));
    }

    @Test
    public void testCheckAccess() {
        when(pbc.generateMasterKey()).thenReturn("masterKey");
        when(pbc.derivePublicKey("masterKey")).thenReturn("publicKey");
        
        IbeService testService = new IbeService(pbc);
        String accessPolicy = "(USER_123) OR (DRIVER_456) OR (ADMIN)";
        String userAttribute = "USER_123";
        boolean hasAccess = testService.checkAccess(accessPolicy, userAttribute);
        assertTrue(hasAccess, "User should have access");
        
        String userAttribute2 = "GUEST_789";
        boolean hasAccess2 = testService.checkAccess(accessPolicy, userAttribute2);
        assertFalse(hasAccess2, "Guest should not have access");
    }

    @Test
    public void testEncryptAndDecrypt() {
        // 模拟PBC行为
        when(pbc.generateMasterKey()).thenReturn("masterKey");
        when(pbc.derivePublicKey("masterKey")).thenReturn("publicKey");
        when(pbc.generatePrivateKey("masterKey", "USER_123"))
            .thenReturn("testPrivateKey".getBytes());
        when(pbc.encrypt("This is a secret message for testing IBE encryption.", "USER_123", "publicKey"))
            .thenReturn("encryptedData");
        when(pbc.decrypt("encryptedData", "USER_123", "testPrivateKey".getBytes(), "publicKey"))
            .thenReturn("This is a secret message for testing IBE encryption.");

        IbeService testService = new IbeService(pbc);
        
        String plaintext = "This is a secret message for testing IBE encryption.";
        String attribute = "USER_123";
        
        // 加密
        String ciphertext = testService.encrypt(plaintext, attribute);
        assertNotNull(ciphertext, "Ciphertext should not be null");
        assertFalse(ciphertext.isEmpty(), "Ciphertext should not be empty");
        assertNotEquals(plaintext, ciphertext, "Ciphertext should be different from plaintext");
        
        System.out.println("Plaintext: " + plaintext);
        System.out.println("Ciphertext: " + ciphertext);
        
        // 先生成私钥再解密
        testService.generatePrivateKey(attribute);
        
        // 解密
        String decryptedText = testService.decrypt(ciphertext, attribute);
        assertNotNull(decryptedText, "Decrypted text should not be null");
        assertEquals(plaintext, decryptedText, "Decrypted text should match original plaintext");
        
        System.out.println("Decrypted Text: " + decryptedText);
    }

    @Test
    public void testEncryptAndDecryptWithDifferentAttributes() {
        // 模拟PBC行为
        when(pbc.generateMasterKey()).thenReturn("masterKey");
        when(pbc.derivePublicKey("masterKey")).thenReturn("publicKey");
        when(pbc.generatePrivateKey("masterKey", "USER_123"))
            .thenReturn("testPrivateKey1".getBytes());
        when(pbc.generatePrivateKey("masterKey", "DRIVER_456"))
            .thenReturn("testPrivateKey2".getBytes());
        when(pbc.encrypt("This is a secret message for testing IBE encryption with different attributes.", "USER_123", "publicKey"))
            .thenReturn("encryptedData");
        when(pbc.decrypt("encryptedData", "USER_123", "testPrivateKey1".getBytes(), "publicKey"))
            .thenReturn("This is a secret message for testing IBE encryption with different attributes.");
        when(pbc.decrypt("encryptedData", "DRIVER_456", "testPrivateKey2".getBytes(), "publicKey"))
            .thenReturn("wrongDecryptedText");

        IbeService testService = new IbeService(pbc);
        
        String plaintext = "This is a secret message for testing IBE encryption with different attributes.";
        String attribute1 = "USER_123";
        String attribute2 = "DRIVER_456";
        
        // 使用属性1加密
        String ciphertext = testService.encrypt(plaintext, attribute1);
        
        // 生成两个属性的私钥
        testService.generatePrivateKey(attribute1);
        testService.generatePrivateKey(attribute2);
        
        // 使用属性1解密 - 应该成功
        String decryptedText1 = testService.decrypt(ciphertext, attribute1);
        assertEquals(plaintext, decryptedText1, "Decryption with same attribute should succeed");
        
        // 使用属性2解密 - 应该失败（得到乱码）
        String decryptedText2 = testService.decrypt(ciphertext, attribute2);
        assertNotEquals(plaintext, decryptedText2, "Decryption with different attribute should fail");
        
        System.out.println("Encryption/Decryption with different attributes test passed.");
    }

    @Test
    public void testFullEncryptionDecryptionProcess() {
        System.out.println("开始完整的IBE加密解密测试流程");

        // 模拟PBC行为
        when(pbc.generateMasterKey()).thenReturn("masterKey");
        when(pbc.derivePublicKey("masterKey")).thenReturn("publicKey");
        when(pbc.generatePrivateKey("masterKey", "USER_123"))
            .thenReturn("testPrivateKey".getBytes());
        when(pbc.encrypt("这是一条测试消息，用于验证IBE加密解密功能", "USER_123", "publicKey"))
            .thenReturn("encryptedData");
        when(pbc.decrypt("encryptedData", "USER_123", "testPrivateKey".getBytes(), "publicKey"))
            .thenReturn("这是一条测试消息，用于验证IBE加密解密功能");

        IbeService ibeService = new IbeService(pbc);

        // 1. 获取公钥
        System.out.println("步骤1: 获取公钥");
        String publicKey = ibeService.getPublicKey();
        assertNotNull(publicKey, "公钥不应为null");
        assertFalse(publicKey.isEmpty(), "公钥不应为空");
        System.out.println("公钥获取成功");

        // 2. 生成用户私钥
        System.out.println("步骤2: 生成用户私钥");
        String attribute = "USER_123";
        var privateKeyResult = ibeService.generatePrivateKey(attribute);
        assertNotNull(privateKeyResult, "私钥生成结果不应为null");
        assertEquals(attribute, privateKeyResult.get("attribute"), "属性应该匹配");
        assertNotNull(privateKeyResult.get("private_key"), "私钥不应为null");
        System.out.println("私钥生成成功，属性: " + privateKeyResult.get("attribute"));

        // 3. 测试加密功能
        System.out.println("步骤3: 测试加密功能");
        String plaintext = "这是一条测试消息，用于验证IBE加密解密功能";
        String ciphertext = ibeService.encrypt(plaintext, attribute);
        assertNotNull(ciphertext, "密文不应为null");
        assertNotEquals(plaintext, ciphertext, "密文应该与明文不同");
        System.out.println("加密成功");
        System.out.println("明文: " + plaintext);
        System.out.println("密文: " + ciphertext);

        // 4. 测试解密功能
        System.out.println("步骤4: 测试解密功能");
        String decryptedText = ibeService.decrypt(ciphertext, attribute);
        assertNotNull(decryptedText, "解密结果不应为null");
        assertEquals(plaintext, decryptedText, "解密后的文本应该与原文相同");
        System.out.println("解密成功");
        System.out.println("解密后文本: " + decryptedText);

        // 5. 验证权限检查功能
        System.out.println("步骤5: 验证权限检查功能");
        String accessPolicy = "(USER_123) OR (DRIVER_456) OR (ADMIN)";
        boolean hasAccess = ibeService.checkAccess(accessPolicy, attribute);
        assertTrue(hasAccess, "用户应该有访问权限");

        String accessPolicy2 = "(DRIVER_456) OR (ADMIN)";
        boolean hasAccess2 = ibeService.checkAccess(accessPolicy2, attribute);
        assertFalse(hasAccess2, "用户应该没有访问权限");
        System.out.println("权限检查功能验证成功");

        System.out.println("完整的IBE加密解密测试流程完成");
    }
}
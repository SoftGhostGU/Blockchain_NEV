package com.autocrowd.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import javax.annotation.Resource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class IbeServiceTest {

    @Resource
    private IbeService ibeService;

    @Test
    public void testGetPublicKey() {
        String publicKey = ibeService.getPublicKey();
        assertNotNull(publicKey, "Public key should not be null");
        assertFalse(publicKey.isEmpty(), "Public key should not be empty");
        System.out.println("Public Key: " + publicKey);
    }

    @Test
    public void testGeneratePrivateKey() {
        String attribute = "USER_123";
        var result = ibeService.generatePrivateKey(attribute);
        
        assertNotNull(result, "Result should not be null");
        assertEquals(attribute, result.get("attribute"), "Attribute should match");
        assertNotNull(result.get("private_key"), "Private key should not be null");
        assertFalse(((String)result.get("private_key")).isEmpty(), "Private key should not be empty");
        
        System.out.println("Attribute: " + result.get("attribute"));
        System.out.println("Private Key: " + result.get("private_key"));
    }

    @Test
    public void testCheckAccess() {
        String accessPolicy = "(USER_123) OR (DRIVER_456) OR (ADMIN)";
        String userAttribute = "USER_123";
        boolean hasAccess = ibeService.checkAccess(accessPolicy, userAttribute);
        assertTrue(hasAccess, "User should have access");
        
        String userAttribute2 = "GUEST_789";
        boolean hasAccess2 = ibeService.checkAccess(accessPolicy, userAttribute2);
        assertFalse(hasAccess2, "Guest should not have access");
    }

    @Test
    public void testEncryptAndDecrypt() {
        String plaintext = "This is a secret message for testing IBE encryption.";
        String attribute = "USER_123";
        
        // 加密
        String ciphertext = ibeService.encrypt(plaintext, attribute);
        assertNotNull(ciphertext, "Ciphertext should not be null");
        assertFalse(ciphertext.isEmpty(), "Ciphertext should not be empty");
        assertNotEquals(plaintext, ciphertext, "Ciphertext should be different from plaintext");
        
        System.out.println("Plaintext: " + plaintext);
        System.out.println("Ciphertext: " + ciphertext);
        
        // 解密
        String decryptedText = ibeService.decrypt(ciphertext, attribute);
        assertNotNull(decryptedText, "Decrypted text should not be null");
        assertEquals(plaintext, decryptedText, "Decrypted text should match original plaintext");
        
        System.out.println("Decrypted Text: " + decryptedText);
    }

    @Test
    public void testEncryptAndDecryptWithDifferentAttributes() {
        String plaintext = "This is a secret message for testing IBE encryption with different attributes.";
        String attribute1 = "USER_123";
        String attribute2 = "DRIVER_456";
        
        // 使用属性1加密
        String ciphertext = ibeService.encrypt(plaintext, attribute1);
        
        // 使用属性1解密 - 应该成功
        String decryptedText1 = ibeService.decrypt(ciphertext, attribute1);
        assertEquals(plaintext, decryptedText1, "Decryption with same attribute should succeed");
        
        // 使用属性2解密 - 应该失败（得到乱码）
        String decryptedText2 = ibeService.decrypt(ciphertext, attribute2);
        assertNotEquals(plaintext, decryptedText2, "Decryption with different attribute should fail");
        
        System.out.println("Encryption/Decryption with different attributes test passed.");
    }
}
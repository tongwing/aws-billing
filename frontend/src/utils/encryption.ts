// Simple client-side encryption for localStorage (not production-grade security)
// This provides basic obfuscation to prevent casual inspection of credentials

const ENCRYPTION_KEY = 'aws-billing-dashboard-key';

export const encrypt = (text: string): string => {
  try {
    // Simple XOR encryption with a static key (not secure, just obfuscation)
    const encrypted = text.split('').map((char, index) => {
      const keyChar = ENCRYPTION_KEY.charCodeAt(index % ENCRYPTION_KEY.length);
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
    }).join('');
    
    // Base64 encode to make it non-obvious
    return btoa(encrypted);
  } catch (error) {
    console.error('Encryption failed:', error);
    return text; // Fallback to plain text if encryption fails
  }
};

export const decrypt = (encryptedText: string): string => {
  try {
    // Base64 decode
    const decoded = atob(encryptedText);
    
    // XOR decrypt
    const decrypted = decoded.split('').map((char, index) => {
      const keyChar = ENCRYPTION_KEY.charCodeAt(index % ENCRYPTION_KEY.length);
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
    }).join('');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedText; // Fallback to returning the input
  }
};
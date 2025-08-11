// utils/rsa.ts
export async function importPublicKey(pem: string): Promise<CryptoKey> {
  // Turn escaped newlines into actual newlines
  const pemWithRealNewlines = pem.replace(/\\n/g, '\n');

  // Remove header, footer, and all whitespace/newlines
  const cleanPem = pemWithRealNewlines
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s+/g, '') // removes spaces, tabs, and real newlines
    .trim();

  const binaryDer = Uint8Array.from(atob(cleanPem), c => c.charCodeAt(0));

  return await window.crypto.subtle.importKey(
    'spki',
    binaryDer.buffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  );
}


export async function encryptObject(obj: Record<string, any>, publicKey: CryptoKey): Promise<string> {
  const json = JSON.stringify(obj);
  const encoded = new TextEncoder().encode(json);

  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    encoded
  );

  return arrayBufferToBase64(encrypted);
}
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}


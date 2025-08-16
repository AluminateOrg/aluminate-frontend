// utils/rsa-node.ts
import forge from 'node-forge';

export type ForgePublicKey = forge.pki.rsa.PublicKey;

// Normalizes the PEM and returns a forge PublicKey
export function importPublicKey(pem: string): ForgePublicKey {
  const normalized = pem.replace(/\\n/g, '\n').trim();
  return forge.pki.publicKeyFromPem(normalized);
}

// Encrypts a JSON-serializable object using RSA-OAEP with:
// - OAEP digest: SHA-256 (matches your backend transform name)
// - MGF1 digest: SHA-1  (matches BouncyCastle default when no OAEPParameterSpec is passed)
export function encryptObject(obj: Record<string, any>, publicKey: ForgePublicKey): string {
  const json = JSON.stringify(obj);

  // (Optional) size guard: OAEP max = k - 2*hLen - 2; hLen for SHA-256 = 32
  const keyBits = publicKey.n.bitLength();
  const kBytes = Math.ceil(keyBits / 8);
  const hLen = 32; // SHA-256
  const maxPlainLen = kBytes - 2 * hLen - 2;
  const utf8Bytes = forge.util.encodeUtf8(json);
  if (utf8Bytes.length > maxPlainLen) {
    throw new Error(
      `RSA-OAEP payload too large: ${utf8Bytes.length} > ${maxPlainLen} bytes (key=${keyBits} bits, OAEP=SHA-256). ` +
      `Use a smaller payload or switch to hybrid (AES-GCM for data + RSA-OAEP for the AES key).`
    );
  }

  const cipherBytes = publicKey.encrypt(utf8Bytes, 'RSA-OAEP', {
    md: forge.md.sha256.create(),                        // OAEP digest = SHA-256
    mgf1: forge.mgf.mgf1.create(forge.md.sha1.create()),// MGF1 digest = SHA-1 (BC default)
    // label not set -> empty label, same as PSource.PSpecified.DEFAULT
  });

  return forge.util.encode64(cipherBytes);
}

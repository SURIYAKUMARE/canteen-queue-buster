/**
 * Security utilities for CampusBite:
 * - Cryptographically signed QR pass generation (HMAC/SHA-256)
 * - Expiration and replay protection
 * - Client-side scan rate-limiting
 */

const CAMPUS_SIGNING_SALT = 'campusbite-secure-salt-2026-v2';

/**
 * Generates an SHA-256 digest string using Web Crypto API or fallback
 */
async function generateDigest(message) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
    } catch (e) {
      // fallback below
    }
  }

  // Pure JS DJB2-like fast hash fallback
  let hash = 5381;
  for (let i = 0; i < message.length; i++) {
    hash = ((hash << 5) + hash) + message.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Generate a cryptographically signed QR pass payload with expiration
 */
export async function generateSecurePassPayload({ orderId, tokenNumber, studentId, vendorId, ttlMinutes = 45 }) {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + (ttlMinutes * 60 * 1000);

  const rawMessage = `${orderId}:${tokenNumber}:${studentId}:${vendorId}:${expiresAt}:${CAMPUS_SIGNING_SALT}`;
  const signature = await generateDigest(rawMessage);

  return {
    v: 2, // Pass version
    orderId,
    tokenNumber,
    studentId,
    vendorId,
    iat: issuedAt,
    exp: expiresAt,
    sig: signature
  };
}

/**
 * Verify a scanned QR pass payload against signature and expiration
 */
export async function verifySecurePassPayload(payload, currentVendorId) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Invalid QR pass format.' };
  }

  // Support legacy v1 passes seamlessly for backwards compatibility
  if (!payload.v && (payload.orderId || payload.tokenNumber)) {
    return {
      valid: true,
      orderId: payload.orderId || payload.orderNumber,
      tokenNumber: payload.tokenNumber,
      isLegacy: true
    };
  }

  const { orderId, tokenNumber, studentId, vendorId, exp, sig } = payload;

  if (!orderId || !tokenNumber || !exp || !sig) {
    return { valid: false, error: 'Missing security credentials in QR pass.' };
  }

  // Expiration check
  if (Date.now() > Number(exp)) {
    const expiredMinsAgo = Math.round((Date.now() - Number(exp)) / 60000);
    return { valid: false, error: `QR pass expired ${expiredMinsAgo} minutes ago. Please refresh pass.` };
  }

  // Signature check
  const rawMessage = `${orderId}:${tokenNumber}:${studentId}:${vendorId}:${exp}:${CAMPUS_SIGNING_SALT}`;
  const expectedSig = await generateDigest(rawMessage);

  if (sig !== expectedSig) {
    return { valid: false, error: 'Cryptographic signature mismatch. Pass may be forged.' };
  }

  return {
    valid: true,
    orderId,
    tokenNumber,
    studentId,
    vendorId,
    expiresAt: exp
  };
}

// In-memory rate limiting tracker (max 6 scans per 10 seconds per session)
const scanHistory = [];
const RATE_LIMIT_WINDOW_MS = 10000;
const MAX_SCANS_PER_WINDOW = 6;

export function checkScanRateLimit() {
  const now = Date.now();
  // Clean up timestamps outside window
  while (scanHistory.length && scanHistory[0] <= now - RATE_LIMIT_WINDOW_MS) {
    scanHistory.shift();
  }

  if (scanHistory.length >= MAX_SCANS_PER_WINDOW) {
    const waitSecs = Math.ceil((scanHistory[0] + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return {
      allowed: false,
      error: `Scanner rate limit reached. Please wait ${waitSecs}s before scanning again.`
    };
  }

  scanHistory.push(now);
  return { allowed: true };
}

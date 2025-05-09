// lib/tokenStore.js
const store = new Map();

export function storeRefreshToken(jti, token) {
  store.set(jti, token);
}

export function isRefreshTokenValid(jti) {
  return store.has(jti);
}

export function revokeRefreshToken(jti) {
  store.delete(jti);
}

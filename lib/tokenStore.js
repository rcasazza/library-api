const store = new Map(); // key: jti, value: userName

export function storeRefreshToken(jti, userName) {
  store.set(jti, userName);
}

export function isRefreshTokenValid(jti, userName) {
  return store.get(jti) === userName;
}

export function revokeRefreshToken(jti) {
  store.delete(jti);
}

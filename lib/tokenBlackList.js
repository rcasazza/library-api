const blacklist = new Set();

export function revokeAccessToken(token) {
  blacklist.add(token);
}

export function isAccessTokenRevoked(token) {
  return blacklist.has(token);
}

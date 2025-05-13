export function roleGuard(allowedRoles) {
  return async function (request, reply) {
    const user = request.user;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!user || !roles.includes(user.role)) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
  };
}

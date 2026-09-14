function toPublicUser(user) {
  if (!user) return null;

  const { password, ...publicUser } = user;
  return publicUser;
}

module.exports = {
  toPublicUser
};

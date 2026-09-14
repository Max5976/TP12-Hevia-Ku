const { users } = require("../data/db");
const { toPublicUser } = require("../utils/sanitizeUser");

function listUsers(req, res) {
  return res.status(200).json({
    total: users.length,
    users: users.map(toPublicUser)
  });
}

module.exports = {
  listUsers
};

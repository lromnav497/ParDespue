const db = require('../config/db');

const UserModel = {
  findByEmail: async (email) => {
    const [rows] = await db.execute('SELECT * FROM Users WHERE Email = ?', [email]);
    return rows[0];
  },
  // ...otros métodos...
};

module.exports = UserModel;
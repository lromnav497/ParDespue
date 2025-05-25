const pool = require('../config/db');

const UserModel = {
  findByEmail: async (email) => {
    const [rows] = await pool.query('SELECT * FROM Users WHERE Email = ?', [email]);
    return rows[0];
  },
  create: async (user) => {
    const [result] = await pool.query(
      'INSERT INTO Users (Name, Email, Password, Role) VALUES (?, ?, ?, ?)',
      [user.Name, user.Email, user.Password, user.Role]
    );
    return result;
  },
  update: async (id, user) => {
    const [result] = await pool.query(
      'UPDATE Users SET Name = ?, Email = ?, Role = ? WHERE id = ?',
      [user.Name, user.Email, user.Role, id]
    );
    return result;
  },
  // ...otros métodos...
};

module.exports = UserModel;
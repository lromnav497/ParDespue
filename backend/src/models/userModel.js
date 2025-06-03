const pool = require('../config/db');

const UserModel = {
  findByEmail: async (email) => {
    const [rows] = await pool.query('SELECT * FROM Users WHERE Email = ?', [email]);
    return rows[0];
  },
  create: async (user) => {
    const [result] = await pool.query(
      'INSERT INTO Users (Name, Email, Password, Role, Verified, VerificationToken, Profile_Picture) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        user.Name,
        user.Email,
        user.Password,
        user.Role,
        user.Verified ?? false,
        user.VerificationToken ?? null,
        user.Profile_Picture ?? null
      ]
    );
    return result;
  },
  update: async (id, user) => {
    const fields = Object.keys(user);
    if (fields.length === 0) throw new Error('No fields to update');
    const values = fields.map(f => user[f]);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    await pool.query(
      `UPDATE Users SET ${setClause} WHERE User_ID = ?`,
      [...values, id]
    );
    return true;
  },
  findOne: async (id) => {
    const [rows] = await pool.query('SELECT * FROM Users WHERE User_ID = ?', [id]);
    return rows[0];
  },
  findById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM Users WHERE User_ID = ?', [id]);
    return rows[0] || null;
  },
  // ...otros métodos...
};

module.exports = UserModel;
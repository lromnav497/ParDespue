const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const UserModel = {
  findByEmail: async (email) => {
    const [rows] = await pool.query(
      'SELECT * FROM Users WHERE Email = ? LIMIT 1',
      [email]
    );
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
  update: async (userId, fields) => {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    await pool.query(`UPDATE Users SET ${setClause} WHERE User_ID = ?`, [...values, userId]);
  },
  findOne: async (id) => {
    const [rows] = await pool.query('SELECT * FROM Users WHERE User_ID = ?', [id]);
    return rows[0];
  },
  findById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM Users WHERE User_ID = ?', [id]);
    return rows[0] || null;
  },
  getAll: async () => {
    const [rows] = await pool.query('SELECT * FROM Users');
    return [rows];
  },
  generateToken: (user, remember) => {
    const token = jwt.sign(
      { id: user.User_ID, email: user.Email, role: user.Role, Profile_Picture: user.Profile_Picture },
      process.env.JWT_SECRET,
      { expiresIn: remember ? '30d' : '2h' } // Si remember, sin expiración
    );
    return token;
  }
  // ...otros métodos...
};

module.exports = UserModel;
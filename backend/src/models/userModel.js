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
    // Construye dinámicamente el SET y los valores
    const fields = [];
    const values = [];
    if (user.Name !== undefined) {
      fields.push('Name = ?');
      values.push(user.Name);
    }
    if (user.Email !== undefined) {
      fields.push('Email = ?');
      values.push(user.Email);
    }
    if (user.Role !== undefined) {
      fields.push('Role = ?');
      values.push(user.Role);
    }
    if (user.Password !== undefined) {
      fields.push('Password = ?');
      values.push(user.Password);
    }
    if (fields.length === 0) throw new Error('No fields to update');
    values.push(id);

    const [result] = await pool.query(
      `UPDATE Users SET ${fields.join(', ')} WHERE User_ID = ?`,
      values
    );
    return result;
  },
  findOne: async (id) => {
    const [rows] = await pool.query('SELECT * FROM Users WHERE User_ID = ?', [id]);
    return rows[0];
  },
  // ...otros métodos...
};

module.exports = UserModel;
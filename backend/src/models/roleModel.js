const db = require('../config/db');

const RoleModel = {
  findByName: async (name) => {
    const [rows] = await db.execute('SELECT * FROM Roles WHERE Name = ?', [name]);
    return rows[0];
  },
  findAll: async () => {
    const [rows] = await db.execute('SELECT * FROM Roles');
    return rows;
  }
};

module.exports = RoleModel;
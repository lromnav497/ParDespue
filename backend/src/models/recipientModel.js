const db = require('../config/db');

const RecipientModel = {
  add: async ({ User_ID, Capsule_ID, Role_ID }) => {
    await db.execute(
      'INSERT INTO Recipients (User_ID, Capsule_ID, Role_ID) VALUES (?, ?, ?)',
      [User_ID, Capsule_ID, Role_ID]
    );
  },
  remove: async ({ User_ID, Capsule_ID, Role_ID }) => {
    await db.execute(
      'DELETE FROM Recipients WHERE User_ID = ? AND Capsule_ID = ? AND Role_ID = ?',
      [User_ID, Capsule_ID, Role_ID]
    );
  },
  removeAllByCapsule: async (Capsule_ID) => {
    await db.execute('DELETE FROM Recipients WHERE Capsule_ID = ?', [Capsule_ID]);
  },
  findByCapsule: async (Capsule_ID) => {
    const [rows] = await db.execute(
      `SELECT r.*, u.Name, u.Email, ro.Name as RoleName
       FROM Recipients r
       JOIN Users u ON r.User_ID = u.User_ID
       JOIN Roles ro ON r.Role_ID = ro.Role_ID
       WHERE r.Capsule_ID = ?`,
      [Capsule_ID]
    );
    return rows;
  }
};

module.exports = RecipientModel;
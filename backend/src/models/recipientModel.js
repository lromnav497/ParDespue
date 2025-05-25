const db = require('../config/db');

const RecipientModel = {
  create: async ({ User_ID, Capsule_ID, Role_ID }) => {
    const [result] = await db.execute(
      'INSERT INTO Recipients (User_ID, Capsule_ID, Role_ID) VALUES (?, ?, ?)',
      [User_ID, Capsule_ID, Role_ID]
    );
    return { User_ID, Capsule_ID, Role_ID };
  },
  // Puedes agregar más métodos si los necesitas
};

module.exports = RecipientModel;
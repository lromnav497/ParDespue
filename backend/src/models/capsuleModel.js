const db = require('../config/db');

const CapsuleModel = {
  create: async (capsule) => {
    const { Title, Creation_Date, Opening_Date, Privacy, Password = null, Creator_User_ID, Tags } = capsule;
    const [result] = await db.execute(
      `INSERT INTO Capsules (Title, Creation_Date, Opening_Date, Privacy, Password, Creator_User_ID, Tags)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [Title, Creation_Date, Opening_Date, Privacy, Password, Creator_User_ID, Tags]
    );
    return { Capsule_ID: result.insertId, ...capsule };
  },

  // Obtener todas las cápsulas de un usuario
  findByUser: async (userId) => {
    console.log('Buscando cápsulas para userId:', userId);
    const [rows] = await db.execute(
      `SELECT * FROM Capsules WHERE Creator_User_ID = ? ORDER BY Creation_Date DESC`,
      [userId]
    );
    console.log('Capsules encontradas en el modelo:', rows); // <-- Agrega esto
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.execute(
        `SELECT * FROM Capsules WHERE Capsule_ID = ? LIMIT 1`,
        [id]
    );
    return rows[0] || null;
  },
};

module.exports = CapsuleModel;
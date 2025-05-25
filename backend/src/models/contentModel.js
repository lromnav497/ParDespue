const db = require('../config/db'); // Ajusta si tu conexión es diferente

const ContentModel = {
  create: async (content) => {
    const { Type, File_Path, Creation_Date, Capsule_ID } = content;
    const [result] = await db.execute(
      `INSERT INTO Contents (Type, File_Path, Creation_Date, Capsule_ID)
       VALUES (?, ?, ?, ?)`,
      [Type, File_Path, Creation_Date, Capsule_ID]
    );
    return { Content_ID: result.insertId, ...content };
  },

  findByCapsule: async (capsuleId) => {
    const [rows] = await db.execute(
      `SELECT Content_ID, Type, File_Path AS Path FROM Contents WHERE Capsule_ID = ?`,
      [capsuleId]
    );
    return rows;
  }
};

module.exports = ContentModel;
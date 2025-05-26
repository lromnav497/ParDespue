const db = require('../config/db');
const GeneralModel = require('./generalModel');
const capsuleGeneralModel = new GeneralModel('Capsules', 'Capsule_ID');

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

  findPublicPaginated: async ({ page, pageSize, category, search }) => {
    const offset = (page - 1) * pageSize;
    let where = "WHERE c.Privacy = 'public'";
    const params = [];

    // Filtro por categoría (por nombre)
    if (category && category !== 'todas') {
      where += " AND cat.Name = ?";
      params.push(category);
    }

    // Filtro de búsqueda avanzada
    if (search) {
      where += ` AND (
        c.Title LIKE ? OR
        c.Tags LIKE ? OR
        u.Name LIKE ? OR
        u.Email LIKE ? OR
        cat.Name LIKE ? OR
        DATE_FORMAT(c.Opening_Date, '%Y-%m-%d') LIKE ?
      )`;
      const like = `%${search}%`;
      params.push(like, like, like, like, like, like);
    }

    // Consulta principal
    const [rows] = await db.query(
      `SELECT 
        c.Capsule_ID as id,
        c.Title as titulo,
        c.Tags as tags,
        c.Creation_Date as fechaCreacion,
        c.Opening_Date as fechaApertura,
        c.Privacy as privacidad,
        c.Password as password,
        c.Creator_User_ID as creatorId,
        u.Name as autor,
        u.Email as email,
        GROUP_CONCAT(cat.Name) as categorias
      FROM Capsules c
      JOIN Users u ON c.Creator_User_ID = u.User_ID
      LEFT JOIN Capsule_Category cc ON c.Capsule_ID = cc.Capsule_ID
      LEFT JOIN Categories cat ON cc.Category_ID = cat.Category_ID
      ${where}
      GROUP BY c.Capsule_ID
      ORDER BY c.Opening_Date DESC
      LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    // Total para paginación
    const [[{ total }]] = await db.query(
      `SELECT COUNT(DISTINCT c.Capsule_ID) as total
      FROM Capsules c
      JOIN Users u ON c.Creator_User_ID = u.User_ID
      LEFT JOIN Capsule_Category cc ON c.Capsule_ID = cc.Capsule_ID
      LEFT JOIN Categories cat ON cc.Category_ID = cat.Category_ID
      ${where}`,
      params
    );

    return {
      capsulas: rows.map(row => ({
        ...row,
        tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
        categorias: row.categorias ? row.categorias.split(',').map(c => c.trim()) : []
      })),
      totalPages: Math.ceil(total / pageSize)
    };
  },

  update: async (id, data) => {
    return capsuleGeneralModel.update(id, data);
  },

  delete: async (id) => {
    // Elimina relaciones en tablas hijas primero
    await db.execute('DELETE FROM Capsule_Category WHERE Capsule_ID = ?', [id]);
    await db.execute('DELETE FROM Contents WHERE Capsule_ID = ?', [id]);
    await db.execute('DELETE FROM Recipients WHERE Capsule_ID = ?', [id]);
    await db.execute('DELETE FROM Comments WHERE Capsule_ID = ?', [id]);
    await db.execute('DELETE FROM Notifications WHERE Capsule_ID = ?', [id]);
    // Ahora elimina la cápsula
    return capsuleGeneralModel.delete(id);
  },
};

module.exports = CapsuleModel;
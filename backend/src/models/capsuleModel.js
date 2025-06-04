const db = require('../config/db');
const GeneralModel = require('./generalModel');
const capsuleGeneralModel = new GeneralModel('Capsules', 'Capsule_ID');
const fs = require('fs');
const path = require('path');

const CapsuleModel = {
  create: async (capsule) => {
    const { Title, Description, Creation_Date, Opening_Date, Privacy, Password = null, Creator_User_ID, Tags, Category_ID, Cover_Image = null } = capsule;
    const [result] = await db.execute(
      `INSERT INTO Capsules (Title, Description, Creation_Date, Opening_Date, Privacy, Password, Creator_User_ID, Tags, Category_ID, Cover_Image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [Title, Description, Creation_Date, Opening_Date, Privacy, Password, Creator_User_ID, Tags, Category_ID, Cover_Image]
    );
    // DEVUELVE SOLO EL ID Y LOS DATOS REALES
    return {
      Capsule_ID: result.insertId,
      Title,
      Description,
      Creation_Date,
      Opening_Date,
      Privacy,
      Password,
      Creator_User_ID,
      Tags,
      Category_ID,
      Cover_Image
    };
  },

  // Obtener todas las cápsulas de un usuario
  findByUser: async (userId) => {
    const [rows] = await db.execute(
      `SELECT c.*, cat.Name as Category_Name, cat.Description as Category_Description, cat.Category_ID as Category_ID
       FROM Capsules c
       LEFT JOIN Categories cat ON c.Category_ID = cat.Category_ID
       WHERE c.Creator_User_ID = ? ORDER BY c.Creation_Date DESC`,
      [userId]
    );
    // Construye el objeto Category igual que en findById
    return rows.map(capsule => ({
      ...capsule,
      Category: {
        Category_ID: capsule.Category_ID,
        Name: capsule.Category_Name,
        Description: capsule.Category_Description
      }
    }));
  },

  findById: async (id) => {
    const [rows] = await db.execute(
        `SELECT c.*, cat.Name as Category_Name, cat.Description as Category_Description, cat.Category_ID as Category_ID
         FROM Capsules c
         LEFT JOIN Categories cat ON c.Category_ID = cat.Category_ID
         WHERE c.Capsule_ID = ? LIMIT 1`,
        [id]
    );
    const capsule = rows[0];
    if (capsule) {
      capsule.Category = {
        Category_ID: capsule.Category_ID,
        Name: capsule.Category_Name,
        Description: capsule.Category_Description
      };
    }
    return capsule;
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
        cat.Name as categoria
      FROM Capsules c
      JOIN Users u ON c.Creator_User_ID = u.User_ID
      JOIN Categories cat ON c.Category_ID = cat.Category_ID
      ${where}
      ORDER BY c.Opening_Date DESC
      LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    // Total para paginación
    const [[{ total }]] = await db.query(
      `SELECT COUNT(DISTINCT c.Capsule_ID) as total
      FROM Capsules c
      JOIN Users u ON c.Creator_User_ID = u.User_ID
      JOIN Categories cat ON c.Category_ID = cat.Category_ID
      ${where}`,
      params
    );

    return {
      capsulas: rows.map(row => ({
        ...row,
        tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
        categoria: row.categoria
      })),
      totalPages: Math.ceil(total / pageSize)
    };
  },

  update: async (id, data) => {
    return capsuleGeneralModel.update(id, data);
  },

  delete: async (id) => {
    // 1. Obtener los paths de los archivos asociados a la cápsula y el id del usuario
    const [capsule] = await db.execute('SELECT Creator_User_ID FROM Capsules WHERE Capsule_ID = ?', [id]);
    const userId = capsule[0]?.Creator_User_ID;

    const [contents] = await db.execute('SELECT File_Path FROM Contents WHERE Capsule_ID = ?', [id]);
    // 2. Eliminar los archivos físicos
    for (const content of contents) {
      if (content.File_Path && userId) {
        // Nuevo path organizado: uploads/<id_usuario>/<id_capsula>/<archivo>
        const filePath = path.join(__dirname, '../../uploads', String(userId), String(id), content.File_Path);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error('Error eliminando archivo:', filePath, err);
        }
      }
    }
    // 3. Elimina relaciones en tablas hijas primero
    await db.execute('DELETE FROM Contents WHERE Capsule_ID = ?', [id]);
    await db.execute('DELETE FROM Recipients WHERE Capsule_ID = ?', [id]);
    await db.execute('DELETE FROM Comments WHERE Capsule_ID = ?', [id]);
    await db.execute('DELETE FROM Notifications WHERE Capsule_ID = ?', [id]);
    // 4. Ahora elimina la cápsula
    return capsuleGeneralModel.delete(id);
  },
};

module.exports = CapsuleModel;
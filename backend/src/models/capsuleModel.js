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
    const [rows] = await db.query(
      `SELECT c.*, u.Name as CreatorName, u.Email as CreatorEmail
       FROM Capsules c
       JOIN Users u ON c.Creator_User_ID = u.User_ID
       WHERE c.Creator_User_ID = ?
       ORDER BY c.Creation_Date DESC`,
      [userId]
    );
    return rows;
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
        cat.Name as categoria,
        c.Cover_Image as cover_image,
        c.Likes as likes, c.Views as views
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

  findAll: async () => {
    const [rows] = await db.query(
      `SELECT c.*, u.Name as CreatorName, u.Email as CreatorEmail
       FROM Capsules c
       JOIN Users u ON c.Creator_User_ID = u.User_ID
       ORDER BY c.Creation_Date DESC`
    );
    return rows;
  },

  update: async (id, data) => {
    return capsuleGeneralModel.update(id, data);
  },

  delete: async (id) => {
    // Elimina notificaciones asociadas
    await db.query('DELETE FROM Notifications WHERE Capsule_ID = ?', [id]);
    // Elimina likes asociados
    await db.query('DELETE FROM CapsuleLikes WHERE Capsule_ID = ?', [id]);
    // Elimina comentarios asociados
    await db.query('DELETE FROM Comments WHERE Capsule_ID = ?', [id]);
    // Elimina colaboradores asociados
    await db.query('DELETE FROM Recipients WHERE Capsule_ID = ?', [id]);
    // Elimina otros hijos si existen...

    // Ahora sí elimina la cápsula
    await db.query('DELETE FROM Capsules WHERE Capsule_ID = ?', [id]);
  },

  addView: async (capsuleId) => {
    await db.execute('UPDATE Capsules SET Views = Views + 1 WHERE Capsule_ID = ?', [capsuleId]);
  },

  addLike: async (capsuleId, userId) => {
    // Solo inserta el like, el trigger suma el contador
    await db.execute(
      'INSERT IGNORE INTO CapsuleLikes (Capsule_ID, User_ID) VALUES (?, ?)',
      [capsuleId, userId]
    );
  },

  removeLike: async (capsuleId, userId) => {
    // Solo borra el like, el trigger resta el contador
    await db.execute(
      'DELETE FROM CapsuleLikes WHERE Capsule_ID = ? AND User_ID = ?',
      [capsuleId, userId]
    );
  },

  userLiked: async (capsuleId, userId) => {
    const [rows] = await db.execute('SELECT 1 FROM CapsuleLikes WHERE Capsule_ID = ? AND User_ID = ?', [capsuleId, userId]);
    return rows.length > 0;
  },
};

module.exports = CapsuleModel;
const db = require('../config/db');
const GeneralModel = require('./generalModel');

class CommentModel extends GeneralModel {
    constructor() {
        super('Comments'); // Nombre de la tabla
    }

    // Obtener comentarios de una cápsula con nombre de usuario
    async findByCapsuleId(capsuleId) {
        const [rows] = await db.execute(
            `SELECT c.*, u.Name 
             FROM Comments c
             JOIN Users u ON c.User_ID = u.User_ID
             WHERE c.Capsule_ID = ?
             ORDER BY c.Creation_Date ASC`,
            [capsuleId]
        );
        return rows;
    }

    // Crear un comentario
    async createComment({ Content, Creation_Date, User_ID, Capsule_ID }) {
        const [result] = await db.execute(
            `INSERT INTO Comments (Content, Creation_Date, User_ID, Capsule_ID)
             VALUES (?, ?, ?, ?)`,
            [Content, Creation_Date, User_ID, Capsule_ID]
        );
        return {
            Comment_ID: result.insertId,
            Content,
            Creation_Date,
            User_ID,
            Capsule_ID
        };
    }

    // Editar un comentario
    async updateComment(commentId, { Content }) {
        await db.execute(
            `UPDATE Comments SET Content = ? WHERE Comment_ID = ?`,
            [Content, commentId]
        );
        // Puedes devolver el comentario actualizado si lo necesitas
        const [rows] = await db.execute(
            `SELECT * FROM Comments WHERE Comment_ID = ?`,
            [commentId]
        );
        return rows[0];
    }

    // Eliminar un comentario
    async deleteComment(commentId) {
        await db.execute(
            `DELETE FROM Comments WHERE Comment_ID = ?`,
            [commentId]
        );
        return { success: true };
    }
}

module.exports = new CommentModel();
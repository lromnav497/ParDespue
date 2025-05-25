const db = require('../config/db');

class GeneralModel {
    constructor(tableName, primaryKey = null) {
        this.tableName = tableName;
        // Si no se pasa, intenta deducirlo (ej: Users -> User_ID)
        this.primaryKey = primaryKey || `${tableName.slice(0, -1)}_ID`;
    }

    async create(data) {
        const keys = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        const query = `INSERT INTO ${this.tableName} (${keys}) VALUES (${placeholders})`;
        const [result] = await db.execute(query, values);
        return result;
    }

    async findAll() {
        const query = `SELECT * FROM ${this.tableName}`;
        const [rows] = await db.execute(query);
        return rows;
    }

    async findOne(id) {
        const query = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }

    async update(id, data) {
        const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), id];

        const query = `UPDATE ${this.tableName} SET ${updates} WHERE ${this.primaryKey} = ?`;
        const [result] = await db.execute(query, values);
        return result;
    }

    async delete(id) {
        const query = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
        const [result] = await db.execute(query, [id]);
        return result;
    }
}

module.exports = GeneralModel;
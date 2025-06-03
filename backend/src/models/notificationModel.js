const db = require('../config/db');

const NotificationModel = {
  create: async ({ userId, capsuleId, message, sentDate }) => {
    await db.execute(
      `INSERT INTO Notifications (User_ID, Capsule_ID, Message, Sent_Date)
       VALUES (?, ?, ?, ?)`,
      [userId, capsuleId, message, sentDate]
    );
  },

  updateDate: async ({ userId, capsuleId, sentDate }) => {
    await db.execute(
      `UPDATE Notifications SET Sent_Date = ? WHERE User_ID = ? AND Capsule_ID = ?`,
      [sentDate, userId, capsuleId]
    );
  },

  getRecent: async (userId, limit = 5) => {
    // Ensure limit is a safe integer
    limit = Number.isInteger(limit) && limit > 0 ? limit : 5;
    const [rows] = await db.execute(
      `SELECT * FROM Notifications WHERE User_ID = ? ORDER BY Sent_Date DESC LIMIT ${limit}`,
      [userId]
    );
    return rows;
  },

  getAll: async (userId) => {
    const [rows] = await db.execute(
      `SELECT * FROM Notifications WHERE User_ID = ? AND Sent_Date <= NOW() ORDER BY Sent_Date DESC`,
      [userId]
    );
    return rows;
  }
};

module.exports = NotificationModel;
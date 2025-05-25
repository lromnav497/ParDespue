const db = require('../config/db');

const CapsuleCategoryModel = {
  create: async ({ Capsule_ID, Category_ID }) => {
    const [result] = await db.execute(
      'INSERT INTO Capsule_Category (Capsule_ID, Category_ID) VALUES (?, ?)',
      [Capsule_ID, Category_ID]
    );
    return { Capsule_ID, Category_ID };
  }
};

module.exports = CapsuleCategoryModel;
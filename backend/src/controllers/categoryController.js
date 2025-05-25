const GeneralController = require('./generalController');
const categoryModel = require('../models/categoryModel');

class CategoryController extends GeneralController {
    constructor() {
        super(categoryModel);
    }
}

module.exports = new CategoryController();
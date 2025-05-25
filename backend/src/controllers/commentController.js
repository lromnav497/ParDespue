const GeneralController = require('./generalController');
const commentModel = require('../models/commentModel');

class CommentController extends GeneralController {
    constructor() {
        super(commentModel);
    }
}

module.exports = new CommentController();
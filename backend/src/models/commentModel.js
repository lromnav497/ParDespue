const GeneralModel = require('./generalModel');

class CommentModel extends GeneralModel {
    constructor() {
        super('Comments'); // Nombre de la tabla
    }

    // Puedes agregar métodos específicos para Comments si es necesario
}

module.exports = new CommentModel();
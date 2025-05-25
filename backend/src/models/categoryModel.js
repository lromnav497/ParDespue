const GeneralModel = require('./generalModel');

class CategoryModel extends GeneralModel {
    constructor() {
        super('Categories'); // Nombre de la tabla
    }

    // Puedes agregar métodos específicos para Categories si es necesario
}

module.exports = new CategoryModel();
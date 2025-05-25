const GeneralModel = require('./generalModel');

class NotificationModel extends GeneralModel {
    constructor() {
        super('Notifications'); // Nombre de la tabla
    }

    // Puedes agregar métodos específicos para Notifications si es necesario
}

module.exports = new NotificationModel();
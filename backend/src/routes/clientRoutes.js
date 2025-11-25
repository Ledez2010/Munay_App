const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticate } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de clientes
router.get('/', clientController.getClients.bind(clientController));
router.get('/:id', clientController.getClient.bind(clientController));
router.post('/', clientController.createClient.bind(clientController));
router.put('/:id', clientController.updateClient.bind(clientController));
router.delete('/:id', clientController.deleteClient.bind(clientController));

// Importar usuarios desde CSV para un cliente
router.post('/:clientId/import-users', clientController.importUsersFromCSV.bind(clientController));

module.exports = router;


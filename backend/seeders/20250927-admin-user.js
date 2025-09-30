'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash de la contraseña "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 12);

    await queryInterface.bulkInsert('users', [
      {
        nombre: 'Administrador',
        apellido: 'Sistema',
        email: 'admin@sistema.com',
        password: hashedPassword,
        rol: 'admin',
        telefono: null,
        activo: true,
        ultimo_acceso: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: 'admin@sistema.com'
    }, {});
  }
};

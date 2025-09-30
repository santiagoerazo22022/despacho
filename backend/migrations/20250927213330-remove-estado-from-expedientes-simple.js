'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Remove estado column from expedientes_simple table
    await queryInterface.removeColumn('expedientes_simple', 'estado');
  },

  async down (queryInterface, Sequelize) {
    // Add estado column back to expedientes_simple table
    await queryInterface.addColumn('expedientes_simple', 'estado', {
      type: Sequelize.ENUM('activo', 'inactivo'),
      allowNull: false,
      defaultValue: 'activo'
    });
  }
};

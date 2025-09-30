'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add tipo_expediente column to expedientes_simple table
    await queryInterface.addColumn('expedientes_simple', 'tipo_expediente', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'true = Expediente, false = Actuación'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove tipo_expediente column from expedientes_simple table
    await queryInterface.removeColumn('expedientes_simple', 'tipo_expediente');
  }
};

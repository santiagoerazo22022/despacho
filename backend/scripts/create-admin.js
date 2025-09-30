const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    console.log('🔧 Creando usuario administrador...');

    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({
      where: { email: 'admin@sistema.com' }
    });

    if (existingAdmin) {
      console.log('✅ Usuario admin ya existe:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Nombre: ${existingAdmin.nombre} ${existingAdmin.apellido}`);
      console.log(`   Rol: ${existingAdmin.rol}`);
      return;
    }

    // Crear usuario admin
    const adminUser = await User.create({
      nombre: 'Administrador',
      apellido: 'Sistema',
      email: 'admin@sistema.com',
      password: 'admin123', // Se encripta automáticamente por el hook del modelo
      rol: 'admin',
      activo: true
    });

    console.log('🎉 Usuario administrador creado exitosamente:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Contraseña: admin123`);
    console.log(`   Rol: ${adminUser.rol}`);
    console.log(`   ID: ${adminUser.id}`);
    console.log('');
    console.log('📝 Credenciales de acceso:');
    console.log('   Email: admin@sistema.com');
    console.log('   Contraseña: admin123');

  } catch (error) {
    console.error('❌ Error al crear usuario admin:', error.message);
  } finally {
    process.exit(0);
  }
}

// Ejecutar solo si este archivo se ejecuta directamente
if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser };

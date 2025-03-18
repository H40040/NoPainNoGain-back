import { connect, connection } from 'mongoose';
import { hashSync } from 'bcryptjs';
import Admin from './models/adminModel';

connect('mongodb://localhost:27017/treinos', { useNewUrlParser: true });

async function createAdmin() {
    const hashedPassword = hashSync('senha123', 10);
    const admin = new Admin({
        username: 'admin',
        password: hashedPassword
    });

    await admin.save();
    console.log('Administrador criado com sucesso!');
    connection.close();
}

createAdmin();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    profileImage: String,
    birthDate: Date,
    gender: String,
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    role: { type: String, enum: ['user', 'trainer', 'admin'], default: 'user', immutable: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    preferences: {
        language: { type: String, default: 'pt-BR' },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true }
        },
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' }
    },
    lastActivity: Date
});

// Método para verificar senha
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Middleware pré-save (correto)
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    this.updatedAt = new Date();
    next();
});

// Middleware para atualização
UserSchema.pre(['update', 'findOneAndUpdate'], async function(next) {
    const data = this.getUpdate();
    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }
    data.updatedAt = new Date();
    this.setUpdate(data);
    next();
});

// Índices para otimização de consulta
UserSchema.index({ email: 1, isActive: 1 });
UserSchema.index({ role: 1, isActive: 1 });

const User = mongoose.model('User', UserSchema);

module.exports = User;

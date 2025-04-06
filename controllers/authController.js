exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      console.warn(`Tentativa de login com email inexistente: ${email}`);
      return res.status(401).json({ success: false, error: 'Email ou senha incorretos' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`Falha de login por senha incorreta para o usuário: ${email}`);
      return res.status(401).json({ success: false, error: 'Email ou senha incorretos' });
    }

    // Gerar token JWT para autenticação bem-sucedida
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    // No backend (authController.js):
console.log("JWT_SECRET:", process.env.JWT_SECRET);
    res.json({
      success: true,
      message: 'Login efetuado com sucesso!',
      token,
      userId: user._id,
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
  }
};


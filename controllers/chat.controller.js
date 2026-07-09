const Message = require('../models/Message');
const db = require('../config/db');

exports.getChat = async (req, res) => {
  try {
    // Obtener últimos 100 mensajes
    const messages = await Message.find().sort({ created_at: 1 }).limit(100);

    // Obtener lista de usuarios para las sugerencias de menciones
    const [users] = await db.mysql.query('SELECT name, role FROM users');

    res.render('chat', {
      messages,
      usersList: users,
      user: req.session.user,
      error: req.session.error,
      success: req.session.success
    });
    req.session.error = null;
    req.session.success = null;
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar el chat.');
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ created_at: 1 }).limit(100);
    const [users] = await db.mysql.query('SELECT name, role FROM users');
    res.json({ success: true, messages, usersList: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener mensajes.' });
  }
};

exports.postMessage = async (req, res) => {
  const { message, reply_to, reply_to_name } = req.body;
  const user = req.session.user;

  if (!message || message.trim() === '') {
    return res.status(400).json({ success: false, error: 'El mensaje no puede estar vacío.' });
  }

  try {
    // Detectar menciones usando RegExp
    const mentionRegex = /@([a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]{2,30})/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(message)) !== null) {
      mentions.push(match[1].trim());
    }

    const newMessage = new Message({
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      message,
      reply_to: reply_to || null,
      reply_to_name: reply_to_name || null,
      mentions
    });

    await newMessage.save();
    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al enviar mensaje.' });
  }
};

exports.updateMessage = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const user = req.session.user;

  try {
    const msg = await Message.findById(id);
    if (!msg) {
      return res.status(404).json({ success: false, error: 'El mensaje no existe.' });
    }

    if (msg.user_id !== user.id) {
      return res.status(403).json({ success: false, error: 'No tienes permiso para editar este mensaje.' });
    }

    msg.message = message;
    msg.is_edited = true;
    await msg.save();

    res.json({ success: true, message: msg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al actualizar mensaje.' });
  }
};

exports.deleteMessage = async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;

  try {
    const msg = await Message.findById(id);
    if (!msg) {
      return res.status(404).json({ success: false, error: 'El mensaje no existe.' });
    }

    const isAdmin = user.role === 'admin';
    if (msg.user_id !== user.id && !isAdmin) {
      return res.status(403).json({ success: false, error: 'No tienes permiso para eliminar este mensaje.' });
    }

    await Message.deleteOne({ _id: msg._id });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al eliminar mensaje.' });
  }
};

//chatserver.js
const db = require('../database/appddbd.js');

//Detectar la conexión de un nuevo cliente
module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("Un usuario se ha conectado");

        // Obtener chat_id desde el cliente
        const chat_id = socket.handshake.query.chat_id;
        console.log('Chat_id', chat_id);
        if (!chat_id) {
            console.error("Chat ID no proporcionado");
            socket.emit("error", { message: "Chat ID requerido" });
            return;
        }

        // Cargar historial de mensajes para el usuario X
        const messages = db.chat.getMessages(username);

        // Enviar historial de mensajes al cliente
        socket.emit("chat history", messages);

        // Manejar nuevo mensaje
        socket.on("new message", (messageData) => {
            const { username, content } = messageData;
            if (!username || !content) {
                console.error("Datos del mensaje incompletos");
                socket.emit("error", { message: "Datos del mensaje incompletos" });
                return;
            }

            try {
                // Guardar el mensaje en la base de datos
                db.chat.regiterMessage(username, content);

                // Emitir el mensaje a todos los clientes
                io.emit("new message", { username, content });
            } catch (err) {
                console.error("Error al guardar el mensaje:", err.message);
                socket.emit("error", { message: "Error enviando el mensaje" });
            }
        });

        //Desconexión de un cliente
        socket.on("disconnect", () => {
            console.log("Un usuario se ha desconectado");
        });
    });
};


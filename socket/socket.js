import { Server } from "socket.io";

const socketConnection = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  let users = [];

  const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
      users.push({
        userId,
        socketId,
      });
  };

  const removeUser = (socketId) => {
    users = users.filter(
      (user) => user.socketId !== socketId
    );
  };

  const getUser = (userId) => {
    return users.find(
      (user) => user.userId === userId
    );
  };

  io.on("connection", (socket) => {
    console.log("User Connected");

    /* ADD USER */
    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);

      io.emit("getUsers", users);
    });

    /* SEND MESSAGE */
    socket.on(
      "sendMessage",
      ({
        senderId,
        receiverId,
        text,
        media,
        mediaType,
      }) => {
        const user = getUser(receiverId);

        if (user) {
          io.to(user.socketId).emit(
            "getMessage",
            {
              senderId,
              text,
              media,
              mediaType,
              createdAt: Date.now(),
            }
          );
        }
      }
    );

    /* DISCONNECT */
    socket.on("disconnect", () => {
      console.log("User Disconnected");

      removeUser(socket.id);

      io.emit("getUsers", users);
    });
  });

  return io;
};

export default socketConnection;
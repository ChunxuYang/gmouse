const { Server } = require("socket.io");

const PORT = 5123;

const io = new Server(PORT, {});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("operation", (operation) => {
    console.log(operation);
  });
});

io.listen(PORT);

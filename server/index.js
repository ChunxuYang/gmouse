const PORT = 5124;

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server, {});

const robot = require("robotjs");

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("operation", (data) => {
    if (data.type) {
      switch (data.type) {
        case "tap":
          robot.mouseClick();
          break;
        case "scroll-up":
          robot.scrollMouse(0, -1);
          break;
        case "scroll-down":
          robot.scrollMouse(0, 1);
          break;
        case "scroll-left":
          robot.scrollMouse(-1, 0);
          break;
        case "scroll-right":
          robot.scrollMouse(1, 0);
          break;
        case "move":
          console.log(data);
          const { x, y } = data.data;
          const currPos = robot.getMousePos();
          const dpi = robot.getScreenSize().height / 1080 / 2;
          robot.moveMouse(currPos.x + x * dpi, currPos.y + y * dpi);

        case "moveTo":
          console.log(data);
          const dd = robot.getScreenSize().height;
          const yy = robot.getScreenSize().width;
          robot.moveMouse(data.data.x * yy, data.data.y * dd);

        default:
          break;
      }
    }
  });
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

server.listen(PORT, () => {
  console.log("listening on *:" + PORT);
});

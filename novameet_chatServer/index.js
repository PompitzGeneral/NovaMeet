import connectionPool from "./db.js";
import fs from "fs";
import https from "https";
import socketio from "socket.io";
import userUtil from "./users.js";

// const server = require('https').createServer({
//   key: fs.readFileSync('/etc/letsencrypt/archive/www.novameet.ga/privkey1.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/archive/www.novameet.ga/cert1.pem')
// });

// const io = require('socket.io')(server);
// const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const server = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/archive/www.novameet.ga/privkey1.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/archive/www.novameet.ga/cert1.pem')
});

const io = socketio(server);

const PORT = process.env.PORT || 5000;

// 3. 소켓 연결 및 이벤트
io.on("connection", (socket) => {
  console.log("New Socket Connected");

  // 클라이언트에서 join이벤트를 보냈을 경우에 대해서 처리 `on`
  socket.on("join", ({ name, imageUrl, room }, callback) => {
    console.log("join, name :", name);
    console.log("join, imageUrl :", imageUrl);
    console.log("join, room :", room);
    console.log("join, socketid :", socket.id);

    const { error, user } = userUtil.addUser({ id: socket.id, name, imageUrl, room });
    
    if (error) {
      return callback(error); // username taken
    }

    socket.join(user.room);
 
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: userUtil.getUsersInRoom(user.room),
    });
    
    doPlusMemberCount(user.room);

    callback();
  });
  // 유저가 생성한 이벤트에 대한 처리 `on`
  socket.on("sendMessage", (message, callback) => {
    // console.log(socket.id, "socket.id");
    const user = userUtil.getUser(socket.id);
    console.log("sendMessage, user : ", user);
    console.log("sendMessage, mesage : ", message);
    console.log("sendMessage, usersInRoom : ", userUtil.getUsersInRoom(user.room));
    // 해당 방으로 메세지를
    if (user) {
      console.log("send Message, user.room : user.room");
      io.to(user.room).emit("message", { user: user.name, imageUrl: user.imageUrl, text: message });
    }
    // callback();
  });

  socket.on("leave_all", () => {
    console.log("receive leave_all");
    const user = userUtil.getUser(socket.id);
    if (user) {
      io.to(user.room).emit("leave_room");
    }
  });

  socket.on("disconnect", () => {
    const user = userUtil.removeUser(socket.id);
    console.log("Socket Disconnected");

    if (user) {
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: userUtil.getUsersInRoom(user.room),
      });

      doMinusMemberCount(user.room);
    }
  });
});

const doPlusMemberCount = (roomID) => {
  const roomPlusMemberQuery = `
  UPDATE rooms
  SET room_member_current_count = room_member_current_count + 1
  WHERE room_id = ?
  `;

  connectionPool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return;
    }
    connection.query(roomPlusMemberQuery, roomID, (err, row) => {
      connection.release();
      if (err) {
        console.log(err);
        return;
      }
    });
  });
}

const doMinusMemberCount = (roomID) => {
  const roomPlusMemberQuery = `
  UPDATE rooms
  SET room_member_current_count = room_member_current_count - 1
  WHERE room_id = ?
  `;

  connectionPool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return;
    }
    connection.query(roomPlusMemberQuery, roomID, (err, row) => {
      connection.release();
      if (err) {
        console.log(err);
        return;
      }
    });
  });
}


const handleListening = () =>
  console.log(`✅ Chat Server listening on http://localhost:${PORT} 🚀`);

server.listen(PORT, handleListening);

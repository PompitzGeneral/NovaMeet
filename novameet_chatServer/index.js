var fs = require('fs');

const server = require('https').createServer({
  key: fs.readFileSync('/etc/letsencrypt/archive/www.novameet.ga/privkey1.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/archive/www.novameet.ga/cert1.pem')
});

const io = require('socket.io')(server);

// users.js
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const PORT = process.env.PORT || 5000;

// 3. 소켓 연결 및 이벤트
io.on("connection", (socket) => {
  console.log("소켓 연결 완료");

  // 클라이언트에서 join이벤트를 보냈을 경우에 대해서 처리 `on`
  socket.on("join", ({ name, imageUrl, room }, callback) => {
    console.log("join, name :", name);
    console.log("join, imageUrl :", imageUrl);
    console.log("join, room :", room);
    console.log("join, socketid :", socket.id);
    const { error, user } = addUser({ id: socket.id, name, imageUrl, room });
    if (error) {
      return callback(error); // username taken
    }
    console.log("1");
      // 해당 유저 방에 접속처리
    socket.join(user.room);
 
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });
  // 유저가 생성한 이벤트에 대한 처리 `on`
  socket.on("sendMessage", (message, callback) => {
    // console.log(socket.id, "socket.id");
    const user = getUser(socket.id);
    console.log("user : ", user);
    // 해당 방으로 메세지를
    if (user) {
      io.to(user.room).emit("message", { user: user.name, imageUrl: user.imageUrl, text: message });
    }
    // callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    console.log("유저가 떠났습니다..");

    if (user) {
      // 210813 DGLEE : 어색한 안내메시지 제거
      // io.to(user.room).emit("message", {
      //   user: "Admin",
      //   text: `${user.name} has left.`,
      // });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});


const handleListening = () =>
  console.log(`✅ Signaling Server listening on http://localhost:${PORT} 🚀`);

server.listen(PORT, handleListening);

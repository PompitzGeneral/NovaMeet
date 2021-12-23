import connectionPool from "./db.js";
import fs from "fs";
import https from "https";
import socketio from "socket.io";
import net from "net"
import userUtil from "./users.js";

const wsServer = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/archive/www.novameet.ga/privkey2.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/archive/www.novameet.ga/cert2.pem')
});

const io = socketio(wsServer);

const WS_PORT  = process.env.PORT  || 5000;
const TCP_PORT = 5001;

// 3. 소켓 연결 및 이벤트
io.on("connection", (socket) => {
  console.log("New Socket Connected");

  // 클라이언트에서 join이벤트를 보냈을 경우에 대해서 처리 `on`
  socket.on("join", ({ userID, userDisplayName, userImageUrl, roomID }, callback) => {
    console.log("join, userID :", userID);
    console.log("join, userDisplayName :", userDisplayName);
    console.log("join, userImageUrl :", userImageUrl);
    console.log("join, roomID :", roomID);
    console.log("join, socketID :", socket.id);

    // add User
    const { error, user } = userUtil.addUser({ 
      socketID: socket.id, 
      userID, 
      userDisplayName, 
      userImageUrl,
      roomID 
    });
    
    if (error) {
      return callback(error); // username taken
    }

    socket.join(user.roomID);
 
    io.to(user.roomID).emit("roomData", {
      users: userUtil.getUsersInRoom(user.roomID),
    });
    
    doPlusMemberCount(user.roomID);

    callback();
  });

  socket.on("sendMessage", (messageText, callback) => {
    // console.log(socket.id, "socket.id");
    const senderUser = userUtil.getUser(socket.id);
    const equalRoomUsers = userUtil.getUsersInRoom(senderUser.roomID)
    // const timestamp = new Date().getTime();
    const timestamp = getTimestamp()
    
    console.log("sendMessage, user : ", senderUser);
    console.log("sendMessage, mesage : ", messageText);
    console.log("sendMessage, usersInRoom : ", equalRoomUsers);
    console.log("sendMessage, timestamp : ", timestamp);
    // 해당 방으로 메세지 송신
    if (senderUser) {
      // Send Message To WebSocket Connection
      io.to(senderUser.roomID).emit("message", { 
        userID: senderUser.userID, 
        userDisplayName: senderUser.userDisplayName, 
        userImageUrl: senderUser.userImageUrl,
        text: messageText,
        timestamp: timestamp
      });
      // Send Message To TCP Socket Connection
      equalRoomUsers.forEach((user) => {
        let targetClient = tcpClients.find((client) => user.socketID === client.socketID);
        console.log(`targetClient`, targetClient)
        if (targetClient) {
          let message =
            `message;${senderUser.userID};${senderUser.userDisplayName};${senderUser.userImageUrl};${messageText};${timestamp}\n`
          targetClient.socket.write(message)
        }
      })
    }
  });

  socket.on("leave_all", () => {
    console.log("receive leave_all");
    const user = userUtil.getUser(socket.id);
    if (user) {
      io.to(user.roomID).emit("leave_room");
    }
  });

  socket.on("disconnect", () => {
    const user = userUtil.removeUser(socket.id);
    console.log("Socket Disconnected");

    if (user) {
      io.to(user.roomID).emit("roomData", {
        users: userUtil.getUsersInRoom(user.roomID),
      });

      doMinusMemberCount(user.roomID);
    }
  });
});

//클라이언트 정보 저장
let tcpClients = [];

const tcpServer = net.createServer( (socket) => {
  console.log("connection : "+socket.remotePort);
  console.log('Client connection');
  console.log('   local = '+ socket.localAddress +':'+ socket.localPort);
  console.log('   remote ='+ socket.remoteAddress+':'+ socket.remotePort);
  // console.log('   client ='+ JSON.stringify(socket));
  // console.log('   socket =', socket);
  
  tcpClients.push({
    socketID: socket.remotePort,
    socket: socket
  });

  console.log("connection clients list : ", tcpClients);
  socket.setEncoding('utf8');
  
  socket.on('data', function(data) {
    console.log('received TCP data, remort port: '+ socket.remotePort +' / data: ', data);
    // Todo. 메시지 길이 체크 후 처리로직 추가
    let socketID = socket.remotePort
    let feilds = data.split(";")
    console.log(`message feilds: `, feilds);
    let messageName = feilds[0]
    if (messageName === "join") {
      receivedJoinMessageFromTCPSocket(socketID, feilds)
    } else if (messageName === "sendMessage") {
      receivedSendMessageFromTCPSocket(socketID, feilds[1])
    } else {
      console.log(`received unknown Message`)
    }
  });

  //클라이언트 소켓이 커넥션을 끊었을때 
  socket.on('close', function() {
    let socketID = socket.remotePort
    console.log('TCP Socket disconnected');
    console.log("Disconnected Socket ID : ", socketID);
    
    let idx = tcpClients.indexOf(tcpClients.socketID);
    tcpClients.splice(idx, 1);
    console.log("current tcpClients", tcpClients);

    const user = userUtil.removeUser(socketID);
    if (user) {
      console.log("removed user : ", user);
      doMinusMemberCount(user.roomID);
    }
  });
  
  socket.on('error', function(err) {
    console.log('Socket Error: ', JSON.stringify(err));
  });
  
  socket.on('timeout', function() {
    console.log('Socket Timed out');
  });
});

const receivedJoinMessageFromTCPSocket = (socketID, feilds) => {
  console.log(`received join`, feilds)
  const user = userUtil.addUser({ 
    socketID: socketID, 
    userID: feilds[1], 
    userDisplayName: feilds[2], 
    userImageUrl: feilds[3],
    roomID: feilds[4] 
  });

  doPlusMemberCount(feilds[4]);
}

const receivedSendMessageFromTCPSocket = (socketID, messageText) => {
  console.log(`received sendMessage`)
  let senderUser = userUtil.getUser(socketID)
  let equalRoomUsers = userUtil.getUsersInRoom(senderUser.roomID)
  // const timestamp = new Date().getTime();
  const timestamp = getTimestamp();

  console.log(`equalRoomUsers`, equalRoomUsers)
  console.log("sendMessage, timestamp : ", timestamp);
  // 메시지를 보낸 유저와 같은 방에 있는 유저들에게 메시지 전송(TCP User)
  equalRoomUsers.forEach((user) => {
    let targetClient = tcpClients.find((client) => user.socketID === client.socketID);
    // console.log(`targetClient`, targetClient)
    // tcp
    if (targetClient) {
      let message = 
        // `message;${senderUser.userID};${senderUser.userDisplayName};${senderUser.userImageUrl};${messageText};${timestamp}\n`
        `message;${senderUser.userID};${senderUser.userDisplayName};${senderUser.userImageUrl};${messageText};${timestamp}`
      targetClient.socket.write(message)
    }
  })
  // 메시지를 보낸 유저와 같은 방에 있는 유저들에게 메시지 전송(WS User)
  io.to(senderUser.roomID).emit("message", { 
    userID: senderUser.userID, 
    userDisplayName: senderUser.userDisplayName, 
    userImageUrl: senderUser.userImageUrl,
    text: messageText,
    timestamp: timestamp
  });
}

const doPlusMemberCount = (roomID) => {
  console.log("roomID", roomID)
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

const getTimestamp = (() => {
  // 1. 현재 시간(Locale)
  const curr = new Date();
  
  // 2. UTC 시간 계산
  const utc =
    curr.getTime() +
    (curr.getTimezoneOffset() * 60 * 1000);

  // 3. UTC to KST (UTC + 9시간)
  const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
  // const kr_curr =
  //   new Date(utc + (KR_TIME_DIFF));

    const kr_curr =
    new Date(curr.getTime());
    // new Date(curr.getTime() - (12 * 60 * 60 * 1000));

    console.log("curr : ", curr)
    console.log("kr_curr : ", kr_curr)

    // return kr_curr.getTime();
    return new Date().getTime();
})


const handleWSServerListening = () =>
  console.log(`✅ Chat Server listening on http://localhost:${WS_PORT}(WS) 🚀`);

const handleTCPServerListening = () => {
  console.log(`✅ Chat Server listening on http://localhost:${TCP_PORT}(TCP) 🚀`);

  tcpServer.on('close', () => {
    console.log('Server Terminated');
  });
  tcpServer.on('error', (err) => {
    console.log('Server Error: ', JSON.stringify(err));
  });
}


wsServer.listen(WS_PORT, handleWSServerListening);
tcpServer.listen(TCP_PORT, handleTCPServerListening);

var fs = require('fs');

const server = require('https').createServer({
    key: fs.readFileSync('/etc/letsencrypt/archive/www.novameet.ga/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/archive/www.novameet.ga/cert.pem')
  });

const io = require('socket.io')(server);

//app.use(cors());
const PORT = process.env.PORT || 4001;

let users = {};

let socketToRoom = {};

const maximum = process.env.MAXIMUM || 8;

io.on('connection', socket => {
    console.log(`received connection, socket id:`, socket.id);
    socket.on('join_room', data => {
        // user[room]에는 room에 있는 사용자들이 배열 형태로 저장된다.
        // room이 존재한다면
        console.log(`request join_room, data : `, data)
        if (users[data.room]) {
            const length = users[data.room].length;
            // 최대 인원을 충족시켰으면 더 이상 접속 불가
            if (length === maximum) {
                socket.to(socket.id).emit('room_full');
                return;
            }
            // 인원이 최대 인원보다 적으면 접속 가능
            users[data.room].push({
                socketID: socket.id, 
                userID: data.userID,
                userDisplayName: data.userDisplayName,
                userImageUrl: data.userImageUrl,
                isVideoEnabled: data.isVideoEnabled,
                isAudioEnabled: data.isAudioEnabled
            });
        } else {
            // room이 존재하지 않는다면 새로 생성
            users[data.room] = [{
                socketID: socket.id, 
                userID: data.userID,
                userDisplayName: data.userDisplayName,
                userImageUrl: data.userImageUrl,
                isVideoEnabled: data.isVideoEnabled,
                isAudioEnabled: data.isAudioEnabled
            }];
        }
        // 해당 소켓이 어느 room에 속해있는 지 알기 위해 저장
        socketToRoom[socket.id] = data.room;

        socket.join(data.room);
        console.log(`[${socketToRoom[socket.id]}]: ${socket.id} enter`);

        // 본인을 제외한 같은 room의 user array
        const usersInThisRoom = users[data.room].filter(user => user.socketID !== socket.id);
        console.log(usersInThisRoom);

        // 접속한 소켓에게 기존 방 내부 유저들의 정보 전송
        // 새로 접속하는 user가 이미 방에 있는 user들에게 offer(signal)를 보내기 위해
        io.sockets.to(socket.id).emit('all_users', usersInThisRoom);
    });

    // 다른 user들에게 offer를 보냄 (자신의 RTCSessionDescription)
    socket.on('offer', data => {
        //console.log(data.sdp);
        console.log("received offer, data : ", data);
        console.log("received offer, receiverSocketID : ", data.receiverSocketID);
        socket.to(data.receiverSocketID).emit('getOffer', {
            sdp: data.sdp, 
            senderSocketID: data.senderSocketID, 
            senderUserID: data.senderUserID,
            senderUserDisplayName: data.senderUserDisplayName,
            senderUserImageUrl: data.senderUserImageUrl,
            isVideoEnabled: data.isVideoEnabled,
            isAudioEnabled: data.isAudioEnabled
        });
    });

    // offer를 보낸 user에게 answer을 보냄 (자신의 RTCSessionDescription)
    socket.on('answer', data => {
        //console.log(data.sdp);
        socket.to(data.receiverSocketID).emit('getAnswer', {sdp: data.sdp, senderSocketID: data.senderSocketID});
    });

    // 자신의 ICECandidate 정보를 signal(offer 또는 answer)을 주고 받은 상대에게 전달
    socket.on('candidate', data => {
        console.log("candidate : ", data);
        socket.to(data.candidateReceiveID).emit('getCandidate', {candidate: data.candidate, candidateSendID: data.candidateSendID});
    })

    socket.on('mediaEnabledChanged', data => {
        console.log("mediaEnabledChanged : ", data);
        const roomID = socketToRoom[socket.id];
        let senderUser = users[roomID].find(user => user.socketID === socket.id);
        if(senderUser) {
            if (data.type === 'video') {
                console.log("senderUsers isVideoEnabled Property Changed");
                senderUser.isVideoEnabled = data.isEnabled
            } else if (data.type === 'audio') {
                console.log("senderUsers isAudioEnabled Property Changed");
                senderUser.isAudioEnabled = data.isEnabled
            }
        } 
        socket.to(roomID).emit('mediaEnabledChanged', data);
    })

    // user가 연결이 끊겼을 때 처리
    socket.on('disconnect', () => {
        console.log(`[${socketToRoom[socket.id]}]: ${socket.id} exit`);
        // disconnect한 user가 포함된 roomID
        const roomID = socketToRoom[socket.id];
        // room에 포함된 유저
        let room = users[roomID];
        // room이 존재한다면(user들이 포함된)
        if (room) {
            // disconnect user를 제외
            room = room.filter(user => user.socketID !== socket.id);
            users[roomID] = room;
            if (room.length === 0) {
                delete users[roomID];
                return;
            }
        }
        // 어떤 user가 나갔는 지 room의 다른 user들에게 전달
        socket.to(roomID).emit('user_exit', {socketID: socket.id});
        console.log(users);
    })
});

const handleListening = () =>
  console.log(`✅ Signaling Server listening on http://localhost:${PORT} 🚀`);

server.listen(PORT, handleListening);
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import io from 'socket.io-client';
import Video from 'components/Video';
import "routes/ChatRoom.css"

const ChatRoom = () => {

  const [socket, setSocket] = useState("");
  const [users, setUsers] = useState([]);
  
  let localVideoRef  = useRef(null);

  // socketID : RTCPeerConnection map
  // let pcs: { [socketId: string]: RTCPeerConnection };
  let pcs = null;

  let {roomID} = useParams();
  console.log(useParams());
  
  const pc_config = {
    "iceServers": [
      // {
      //   urls: 'stun:[STUN_IP]:[PORT]',
      //   'credentials': '[YOR CREDENTIALS]',
      //   'username': '[USERNAME]'
      // },
      {
        urls : 'stun:stun.l.google.com:19302'
      }
    ]
  }
  
  useEffect(() => {

    let newSocket = io.connect('https://www.novameet.ga:4001', {secure: true});
    //210730
    // let localStream: MediaStream;
    let localStream = null;

    // 자신을 제외한 같은 방의 모든 user 목록을 받아온다.
    // 해당 user들에게 offer signal을 보낸다(createOffer() 함수 호출).
    newSocket.on('all_users', allUsers => {
      let len = allUsers.length;

      for (let i = 0; i < len; i++) {
        createPeerConnection(allUsers[i].id, allUsers[i].email, newSocket, localStream);
        let pc = pcs[allUsers[i].id];
        if (pc) {
          pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
            .then(sdp => {
              console.log('create offer success');
              pc.setLocalDescription(new RTCSessionDescription(sdp));
              newSocket.emit('offer', {
                sdp: sdp,
                offerSendID: newSocket.id,
                offerSendEmail: 'offerSendSample@sample.com',
                offerReceiveID: allUsers[i].id
              });
            })
            .catch(error => {
              console.log(error);
            })
        }
      }
    });
  
    // 상대방에게서 offer signal 데이터로 상대방의 RTCSessionDescription을 받는다.
    // 해당 user에게 answer signal을 보낸다(createAnswer(sdp) 함수 호출).
    newSocket.on('getOffer', (data) => {
      console.log('get offer');
      createPeerConnection(data.offerSendID, data.offerSendEmail, newSocket, localStream);
      // 210730
      // let pc: RTCPeerConnection = pcs[data.offerSendID];
      let pc = pcs[data.offerSendID];
      if (pc) {
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
          console.log('answer set remote description success');
          pc.createAnswer({ offerToReceiveVideo: true, offerToReceiveAudio: true })
            .then(sdp => {

              console.log('create answer success');
              pc.setLocalDescription(new RTCSessionDescription(sdp));
              newSocket.emit('answer', {
                sdp: sdp,
                answerSendID: newSocket.id,
                answerReceiveID: data.offerSendID
              });
            })
            .catch(error => {
              console.log(error);
            })
        })
      }
    });
  
    // 본인 RTCPeerConnection의 RemoteDescription으로 상대방의 RTCSessionDescription을 설정한다.
    newSocket.on('getAnswer', (data) => {
      console.log('get answer');
      // 210730
      // let pc: RTCPeerConnection = pcs[data.answerSendID];
      let pc= pcs[data.answerSendID];
      if (pc) {
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }
      //console.log(sdp);
    });
  
    // 본인 RTCPeerConnection의 IceCandidate로 상대방의 RTCIceCandidate를 설정한다.
    newSocket.on('getCandidate', (data) => {
      console.log('get candidate');
      // 210730
      // let pc: RTCPeerConnection = pcs[data.candidateSendID];
      let pc = pcs[data.candidateSendID];
      if (pc) {
        pc.addIceCandidate(new RTCIceCandidate(data.candidate)).then(() => {
          console.log('candidate add success');
        })
      }
    });

    newSocket.on('user_exit', (data) => {
      pcs[data.id].close();
      delete pcs[data.id];
      setUsers(oldUsers => oldUsers.filter(user => user.id !== data.id));
    })

    setSocket(newSocket);

    // MediaStream 설정 및 RTCPeerConnection 이벤트
    navigator.mediaDevices.getUserMedia({
      // video: true,
      audio: true,
      video: {
        width: 240, // ori:240
        height: 240 // ori:240
      }
    }).then(stream => {
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      localStream = stream;

      newSocket.emit('join_room', {room: roomID, email: 'sample@naver.com'});
    }).catch(error => {
      console.log(`getUserMedia error: ${error}`);
    });

    // returned function will be called on component unmount 
    return () => {
      console.log("component will unmount");
      if (newSocket) {
        newSocket.disconnect();
         // Todo. rooms table 방에 들어와있는 멤버 수 discount
      }
      console.log("socket disconnected");
    }
  }, []);

  const createPeerConnection = (socketID, email, newSocket, localStream) => {

    let pc = new RTCPeerConnection(pc_config);

    // add pc to peerConnections object
    pcs = { ...pcs, [socketID]: pc };

    // onicecandidate 이벤트
    // offer 또는 answer signal을 생성한 후부터 본인의 icecadidate 정보 이벤트가 발생한다.
    // offer 또는 answer를 보냈던 상대방에게 본인의 icecandidate 정보를 Signaling Server를 통해 보낸다.
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log('onicecandidate');
        newSocket.emit('candidate', {
          candidate: e.candidate,
          candidateSendID: newSocket.id,
          candidateReceiveID: socketID
        });
      }
    }

    // oniceconnectionstatechange 이벤트
    // ICE connection 상태가 변경됐을 때의 log
    pc.oniceconnectionstatechange = (e) => {
      console.log(e);
    }

    // ontrack 이벤트
    // 상대방의 RTCSessionDescription을 본인의 RTCPeerConnection에서의 remoteSessionDescription으로 지정하면 상대방의 track 데이터에 대한 이벤트가 발생한다.
    // 해당 데이터에서 MediaStream을 상대방의 video, audio를 재생할 video 태그에 등록한다.
    pc.ontrack = (e) => {
      console.log('ontrack success');
      setUsers(oldUsers => oldUsers.filter(user => user.id !== socketID));
      setUsers(oldUsers => [...oldUsers, {
        id: socketID,
        email: email,
        stream: e.streams[0]
      }]);
    }

    if (localStream) {
      console.log('localstream add');
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    } else {
      console.log('no local stream');
    }

    return pc;
  }

  // 본인과 상대방의 video 렌더링
  return (
    <div>
      <video
        style={{
          width: 210, //240
          height: 210, //240
          margin: 5,
          backgroundColor: 'black'
        }}
        muted
        ref={localVideoRef}
        autoPlay>
      </video>
      {users.map((user, index) => {
        return (
          <Video
            key={index}
            email={user.email}
            stream={user.stream}
          />
        );
      })}
    </div>
  );
};
export default ChatRoom;

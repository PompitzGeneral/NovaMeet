import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

import "routes/ChatRoom.css"
import io from 'socket.io-client';

const ChatRoom = () => {

  const [pc, setPc] = useState("");
  const [socket, setSocket] = useState("");
  
  let localVideoRef  = useRef(null);
  let remoteVideoRef  = useRef(null);

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
    let newPC = new RTCPeerConnection(pc_config);

    // 자신을 제외한 같은 방의 모든 user 목록을 받아온다.
    // 해당 user들에게 offer signal을 보낸다(createOffer() 함수 호출).
    newSocket.on('all_users', allUsers => {
      let len = allUsers.length;
      if (len > 0) {
        createOffer();
      }
    });
  
    // 상대방에게서 offer signal 데이터로 상대방의 RTCSessionDescription을 받는다.
    // 해당 user에게 answer signal을 보낸다(createAnswer(sdp) 함수 호출).
    newSocket.on('getOffer', sdp => {
      //console.log(sdp);
      console.log('get offer');
      createAnswer(sdp);
    });
  
    // 본인 RTCPeerConnection의 RemoteDescription으로 상대방의 RTCSessionDescription을 설정한다.
    newSocket.on('getAnswer', sdp => {
      console.log('get answer');
      newPC.setRemoteDescription(new RTCSessionDescription(sdp));
      //console.log(sdp);
    });
  
    // 본인 RTCPeerConnection의 IceCandidate로 상대방의 RTCIceCandidate를 설정한다.
    newSocket.on('getCandidate', candidate => {
      newPC.addIceCandidate(new RTCIceCandidate(candidate)).then(() => {
        console.log('candidate add success');
      })
    })

    setSocket(newSocket);
    setPc(newPC);

    // MediaStream 설정 및 RTCPeerConnection 이벤트
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => {
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // 자신의 video, audio track을 모두 자신의 RTCPeerConnection에 등록한다.
      stream.getTracks().forEach(track => {
        newPC.addTrack(track, stream);
      })

      // onicecandidate 이벤트
      // offer 또는 answer signal을 생성한 후부터 본인의 icecadidate 정보 이벤트가 발생한다.
      // offer 또는 answer를 보냈던 상대방에게 본인의 icecandidate 정보를 Signaling Server를 통해 보낸다.
      newPC.onicecandidate = (e) => {
        if (e.candidate) {
          console.log('onicecandidate');
          newSocket.emit('candidate', e.candidate);
        }
      }

      // oniceconnectionstatechange 이벤트
      // ICE connection 상태가 변경됐을 때의 log
      newPC.oniceconnectionstatechange = (e) => {
        console.log(e);
      }
      
      // ontrack 이벤트
      // 상대방의 RTCSessionDescription을 본인의 RTCPeerConnection에서의 remoteSessionDescription으로 지정하면 상대방의 track 데이터에 대한 이벤트가 발생한다.
      // 해당 데이터에서 MediaStream을 상대방의 video, audio를 재생할 video 태그에 등록한다.
      newPC.ontrack = (ev) => {
        console.log('add remotetrack success');
        if(remoteVideoRef.current) remoteVideoRef.current.srcObject = ev.streams[0];
      } 

      // 자신의 video, audio track을 모두 자신의 RTCPeerConnection에 등록한 후에 room에 접속했다고 Signaling Server에 알린다.
      // 왜냐하면 offer or answer을 주고받을 때의 RTCSessionDescription에 해당 video, audio track에 대한 정보가 담겨 있기 때문에
      // 순서를 어기면 상대방의 MediaStream을 받을 수 없음
      // newSocket.emit('join_room', {room: '1234', email: 'sample@naver.com'});

      newSocket.emit('join_room', {room: roomID, email: 'sample@naver.com'});
      
    }).catch(error => {
      console.log(`getUserMedia error: ${error}`);
    });
    

  // 상대방에게 offer signal 전달
  const createOffer = () => {
    console.log('create offer');
    newPC.createOffer({offerToReceiveAudio: true, offerToReceiveVideo: true})
      .then(sdp => {
        newPC.setLocalDescription(new RTCSessionDescription(sdp));
        newSocket.emit('offer', sdp);
      })
      .catch(error => {
        console.log(error);
      })
    }

    // 상대방에게 answer signal 전달
    const createAnswer = sdp => {
        newPC.setRemoteDescription(new RTCSessionDescription(sdp)).then(() => {
          console.log('answer set remote description success');
          newPC.createAnswer({offerToReceiveVideo: true, offerToReceiveAudio: true})
          .then(sdp1 => {
            
           console.log('create answer');
            newPC.setLocalDescription(new RTCSessionDescription(sdp1));
            newSocket.emit('answer', sdp1);
          })
          .catch(error => {
            console.log(error);
          })
        })
    }
  }, []);

  // 본인과 상대방의 video 렌더링
  return (
    <div>
        <video
          style={{
            width: 240,
            height: 240,
            margin: 5,
            backgroundColor: 'black'
          }}
          muted
          ref={ localVideoRef }
          autoPlay>
        </video>
        <video
          id='remotevideo'
          style={{
            width: 340,
            height: 340,
            margin: 5,
            backgroundColor: 'black'
          }}
          ref={ remoteVideoRef }
          autoPlay>
        </video>
      </div>
  );
};
export default ChatRoom;

import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import axios from 'axios';
import io from 'socket.io-client';
import Video from 'components/Video';
import Chat from 'components/Chat/Chat';
import Members from 'components/Members';
import "routes/ChatRoom.css";
import Grid from '@material-ui/core/Grid';
import ChatRoomBottom from "components/ChatRoomBottom"

import { makeStyles } from '@material-ui/core/styles';

let gSignalingSocket = null;
let gChatSocket = null;

const ChatRoom = () => {

  const [chatSocket, setChatSocket] = useState(null);
  // const [isRoomOwner, setIsRoomOwner] = useState(false);
  const [isShowedMember, setIsShowedMember] = useState(false);
  const [isShowedChat, setIsShowedChat] = useState(false);
  const [signalingUserInfos, setSignalingUserInfos] = useState([]);
  const [users, setUsers] = useState(null);
  const history = useHistory();
  const location = useLocation();

  // For WebRTC
  let localVideoRef  = useRef(null);
  let pcs = null;

  let userInfo = undefined;
  let isRoomOwner = false;
  if (location.state) {
    console.log("location.state", location.state);
    userInfo = location.state.userInfo;
    isRoomOwner = location.state.isRoomOwner
  }
  let {roomID} = useParams();

  // For Chat
  console.log("location:", location);
  console.log("ChatRoom UserInfo:", userInfo);
  console.log("ChatRoom Params:",useParams());
  
  const pc_config = {
    "iceServers": [
      {
        urls : 'stun:stun.l.google.com:19302'
      }
    ]
  }

  useEffect(() => {
    console.log("char_room, userInfo : ", userInfo);
    if (!userInfo) {
       alert("로그인이 필요합니다.");
       history.push('/Login');
    }

    initSignalingSocket();
    initChatSocket();

    // returned function will be called on component unmount 
    return () => {
      console.log("ChatRoom component will unmount");
      if (gSignalingSocket) {
        gSignalingSocket.disconnect();
        console.log("signalingSocket disconnected");
      }
      if (gChatSocket) {
        gChatSocket.disconnect();
        console.log("Chat socket disconnected");
      }
    }
  }, []);

  const initSignalingSocket = () => {
    gSignalingSocket = io.connect('https://www.novameet.ga:4001', {secure: true});
    let localStream = null;

    // 자신을 제외한 같은 방의 모든 user 목록을 받아온다.
    // 해당 user들에게 offer signal을 보낸다(createOffer() 함수 호출).
    gSignalingSocket.on('all_users', allUsers => {
      let len = allUsers.length;

      for (let i = 0; i < len; i++) {
        createPeerConnection(allUsers[i].id, allUsers[i].email, gSignalingSocket, localStream);
        let pc = pcs[allUsers[i].id];
        if (pc) {
          pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
            .then(sdp => {
              console.log('create offer success');
              pc.setLocalDescription(new RTCSessionDescription(sdp));
              gSignalingSocket.emit('offer', {
                sdp: sdp,
                offerSendID: gSignalingSocket.id,
                offerSendEmail: userInfo.userDisplayName,
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
    gSignalingSocket.on('getOffer', (data) => {
      console.log('get offer');
      createPeerConnection(data.offerSendID, data.offerSendEmail, gSignalingSocket, localStream);
      let pc = pcs[data.offerSendID];
      if (pc) {
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
          console.log('answer set remote description success');
          pc.createAnswer({ offerToReceiveVideo: true, offerToReceiveAudio: true })
            .then(sdp => {

              console.log('create answer success');
              pc.setLocalDescription(new RTCSessionDescription(sdp));
              gSignalingSocket.emit('answer', {
                sdp: sdp,
                answerSendID: gSignalingSocket.id,
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
    gSignalingSocket.on('getAnswer', (data) => {
      console.log('get answer');
      let pc= pcs[data.answerSendID];
      if (pc) {
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }
    });
  
    // 본인 RTCPeerConnection의 IceCandidate로 상대방의 RTCIceCandidate를 설정한다.
    gSignalingSocket.on('getCandidate', (data) => {
      console.log('get candidate');
      let pc = pcs[data.candidateSendID];
      if (pc) {
        pc.addIceCandidate(new RTCIceCandidate(data.candidate)).then(() => {
          console.log('candidate add success');
        })
      }
    });

    gSignalingSocket.on('user_exit', (data) => {
      pcs[data.id].close();
      delete pcs[data.id];
      setSignalingUserInfos(oldUsers => oldUsers.filter(user => user.id !== data.id));
    })

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

      gSignalingSocket.emit('join_room', {room: roomID, email: userInfo.userDisplayName});
    }).catch(error => {
      console.log(`getUserMedia error: ${error}`);
    });
  }

  const initChatSocket = () => {
    console.log("initChatSocket");
    gChatSocket = io.connect("https://www.novameet.ga:5000", {secure: true});
  
    // For Test
    setChatSocket(gChatSocket);

    console.log("newChatSocket : ", gChatSocket);
    gChatSocket.on("roomData", ({ users }) => {
      getUsersCallback(users);
    });

    gChatSocket.on("leave_room", () => {
      console.log("leave_room");
      history.push({
        pathname:'/', 
        state: {from: 'chatRoom', isRoomOwner: isRoomOwner}
      });
    })

    console.log("join to ChatServer");
    gChatSocket.emit("join", { name: userInfo.userDisplayName, imageUrl: userInfo.userImageUrl, room: roomID }, (error) => {
      if (error) {
        alert(error);
      }
    });
  }

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
      setSignalingUserInfos(oldUsers => oldUsers.filter(user => user.id !== socketID));
      setSignalingUserInfos(oldUsers => [...oldUsers, {
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

  const setVideoTrack = (enabled) => {
    console.log(`setVideoTrack(${enabled})`);
    const myStream = localVideoRef.current.srcObject;
    if (myStream) {
      myStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = enabled));
    }
  };

  const setAudioTrack = (enabled) => {
    console.log(`setAudioTrack(${enabled})`);
    const myStream = localVideoRef.current.srcObject;
    if (myStream) {
      myStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = enabled));
    }
  };

  const getUsersCallback = ( newUsers ) => {
    console.log("getUsersCallback, newUsers:", newUsers);
    setUsers(newUsers);
  }

  const deleteRoomCallback = () => {
    console.log("deleteRoomCallback");

    // 1. WAS에게 DB 삭제 요청
    axios.post('/api/deleteRoom', null, {
      params: {
        'roomID': roomID,
        }
    })
    .then(res => {
      console.log(`received deleteRoom. responseCode:${res.data.responseCode}`);
      if (res.data.responseCode === 1) {
        console.log("deleteRoomCallback, 방 제거 성공");
      } else if (res.data.responseCode === 0) {
        console.log("deleteRoomCallback, 방 목록 없음");
      } else {
        console.log("deleteRoomCallback, 예외 케이스. Server Log 확인 필요");
      }
    })
    .catch();

    // 2. Chat Server에게 deleteRoom 요청
    gChatSocket.emit('leave_all');
  }

  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      padding: 10
    },
  }));
  
  const classes = useStyles();

  return (
    <>
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item >
              <video
              className="video"
              muted
              ref={localVideoRef}
              autoPlay></video>      
            <p>{userInfo.userDisplayName}</p>
          </Grid>
          {signalingUserInfos.map((userInfo, index) => {
            return (
              <Grid item>
                <Video
                  key={index}
                  displayName={userInfo.email}
                  stream={userInfo.stream}
                />
              </Grid>
            );
          })}
        </Grid>
      </div>
      <div className={isShowedMember ? undefined : 'hidden'}>
        {
          (userInfo && roomID && users) ? (
            <Members users={users}/>
          ) : (
            <div>
            </div>
          )
        }
      </div>
      <div className={isShowedChat ? undefined : 'hidden'}>
        {
          (chatSocket && userInfo && roomID) ? (
            <Chat
              chatSocket={chatSocket}
              userInfo={userInfo}
              />
          ) : (
            <div>
            </div>
          )
        }
      </div>
      <div className="bottom">
        <ChatRoomBottom
          isRoomOwner={isRoomOwner}
          deleteRoomCallback={deleteRoomCallback}
          setVideoTrack={setVideoTrack}
          setAudioTrack={setAudioTrack} 
          setIsShowedMember={setIsShowedMember}
          setIsShowedChat={setIsShowedChat}
          />
      </div>
    </>
  );
};
export default ChatRoom;

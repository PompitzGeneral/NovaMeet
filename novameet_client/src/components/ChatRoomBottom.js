import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";

import Fab from '@material-ui/core/Fab';
import VideocamOutlinedIcon from '@material-ui/icons/VideocamOutlined';
import VideocamOffOutlinedIcon from '@material-ui/icons/VideocamOffOutlined';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import CallEndIcon from '@material-ui/icons/CallEnd';
import ChatOutlinedIcon from '@material-ui/icons/ChatOutlined';
import ChatBubbleOutlinedIcon from '@material-ui/icons/ChatBubbleOutlined';
import PeopleIcon from '@material-ui/icons/People';
import PeopleOutlineOutlinedIcon from '@material-ui/icons/PeopleOutlineOutlined';

import { makeStyles } from '@material-ui/core/styles';

const ChatRoomBottom = ({ setVideoTrack, setAudioTrack, setIsShowedMember, setIsShowedChat}) => {
  // Camera
  const [isCameraBtnOn, setIsCameraBtnOn] = useState(true);
  // 음소거
  const [isMuteBtnOn, setIsMuteBtnOn] = useState(true);
  // 멤버창
  const [isMemberBtnOn, setIsMemberBtnOn] = useState(false);
  // 채팅창
  const [isChatBtnOn, setIsChatBtnOn] = useState(false);
  
  const history = useHistory();

  const onCameraBtnClicked = () => {
    console.log("onCameraBtnClicked");

    setVideoTrack(!isCameraBtnOn);
    setIsCameraBtnOn(!isCameraBtnOn);
  }

  const onMuteBtnClicked = () => {
    console.log("onMuteBtnClicked");

    setAudioTrack(!isMuteBtnOn);
    setIsMuteBtnOn(!isMuteBtnOn);
  }

  const onMemberBtnClicked = () => {
    console.log("onMemberBtnClicked");
    // 멤버 창 Off -> On 인 경우, 채팅창 닫는다
    if (!isMemberBtnOn) {
      setIsShowedChat(false);
      setIsChatBtnOn(false);
    }
    setIsShowedMember(!isMemberBtnOn);
    setIsMemberBtnOn(!isMemberBtnOn);
  }

  const onChatBtnClicked = () => {
    console.log("onChatBtnClicked");
    // 채팅 창 Off -> On 인 경우, 멤버창 닫는다
    if (!isChatBtnOn) {
      setIsShowedMember(false);
      setIsMemberBtnOn(false);
    }
    setIsShowedChat(!isChatBtnOn);
    setIsChatBtnOn(!isChatBtnOn);
  }

  const onCallEndBtnClicked = () => {
    console.log("onCallEndBtnClicked");
    history.push('/');
  }

  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      textAlign: 'center'
      
    },
    fab: {
      margin: 5
    }
  }));

  const classes = useStyles();

  return (
    <div className={classes.root}>
      {
        isCameraBtnOn ? (
          <Fab className={classes.fab} aria-label="camera" onClick={onCameraBtnClicked}>
            <VideocamOutlinedIcon />
          </Fab>
        ) : (
          <Fab className={classes.fab} color="secondary" aria-label="like" onClick={onCameraBtnClicked}>
            <VideocamOffOutlinedIcon />
          </Fab>
        )
      }
      {
        isMuteBtnOn ? (
          <Fab className={classes.fab} aria-label="mute" onClick={onMuteBtnClicked}>
            <MicIcon />
          </Fab>
        ) : (
          <Fab className={classes.fab} aria-label="mute" color="secondary" onClick={onMuteBtnClicked}>
            <MicOffIcon />
          </Fab>
        )
      }
      {
        isMemberBtnOn ? (
          <Fab className={classes.fab} aria-label="chat" onClick={onMemberBtnClicked}>
            <PeopleIcon />
          </Fab>
        ) : (
          <Fab className={classes.fab} aria-label="chat" onClick={onMemberBtnClicked}>
            <PeopleOutlineOutlinedIcon />
          </Fab>
        )
      }
      {
        isChatBtnOn ? (
          <Fab className={classes.fab} aria-label="chat" onClick={onChatBtnClicked}>
            <ChatBubbleOutlinedIcon />
          </Fab>
        ) : (
          <Fab className={classes.fab} aria-label="chat" onClick={onChatBtnClicked}>
            <ChatOutlinedIcon />
          </Fab>
        )
      }
      <Fab className={classes.fab} color="secondary" variant="extended" onClick={onCallEndBtnClicked}>
        <CallEndIcon />
      </Fab>
    </div>
  );
};

export default ChatRoomBottom
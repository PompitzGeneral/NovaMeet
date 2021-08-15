import React, { useEffect, useState, useReducer } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import "components/Chat/Chat.css"

// 하위 컴포넌트
import Messages from "components/Chat/Messages/Messages";
import RoomInfo from "components/Chat/RoomInfo";
import Input from "components/Chat/Input";

// Material-ui
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

let socket;

const Chat = ({ userInfo, roomID }) => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [users, setUsers] = useState("");

  const ENDPOINT = "https://www.novameet.ga:5000";

  useEffect(() => {

    // const { name, room } = queryString.parse(location.search);
    const name = userInfo.userDisplayName;
    const imageUrl = userInfo.userImageUrl;
    const room = roomID;

    socket = io.connect(ENDPOINT, {secure: true});

    setName(name);
    setRoom(room);

    console.log("useEffect, socket : ", socket); 
    console.log("join, userInfo : ", userInfo); 
    console.log("join, imageUrl : ", imageUrl);
    console.log("join, displayName : ", name); 
    console.log("join, roomID : ", room);

    socket.emit("join", { name, imageUrl, room }, (error) => {
      if (error) {
        alert(error);
      }
    });
    // returned function will be called on component unmount 
    return () => {
      console.log("Chat component will unmount");
      if (socket) {
        socket.disconnect();
        // Todo. rooms table 방에 들어와있는 멤버 수 discount
      }
      console.log("Chat socket disconnected");
    }
  }, []);
 // }, [ENDPOINT, location.search]);
   // 한번만 부른다 // 불필요한 사이드 이펙트를 줄인다

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages([...messages, message]);
    });

    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });
  }, [messages]);

  // 메세지 보내기 함수
  const sendMessage = (e) => {
    e.preventDefault();
    if (message) {
      socket.emit("sendMessage", message, setMessage(""));
    }
  };

  console.log(message, messages);
  console.log(users, "users");

  return (
    <div className="chatScreen">
      <Paper elevation={5} className="chatScreenPaper">
        <Messages messages={messages} name={name} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </Paper>
    </div>
  );
};

export default Chat;

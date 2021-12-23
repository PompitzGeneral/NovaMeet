import React, { useEffect, useState, useReducer } from "react";
import { useHistory } from "react-router-dom";
import "components/Chat/Chat.css"

// 하위 컴포넌트
import Messages from "components/Chat/Messages/Messages";
import Input from "components/Chat/Input";

// Material-ui
import Paper from "@material-ui/core/Paper";

const Chat = ({ chatSocket, userInfo }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const history = useHistory();
  useEffect(() => {

    let localMessages = messages;

    console.log("Chat ChatSocket : ", chatSocket);
    chatSocket.on("message", (message) => {
       console.log("chatSocket.on message", message);
       console.log("test, userInfo:", userInfo);
       localMessages = [...localMessages, message];
       setMessages(localMessages);
    });

    return () => {

    }
  }, []);

  // 메세지 보내기 함수
  const sendMessage = (e) => {
    e.preventDefault();
    if (message) {
      chatSocket.emit("sendMessage", message, setMessage(""));
    }
  };

  return (
    <div className="chatScreen">
      <Paper elevation={5} className="chatScreenPaper">
        <Messages messages={messages} userInfo={userInfo} />
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

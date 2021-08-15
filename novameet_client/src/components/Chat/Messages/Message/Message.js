import React from "react";
import "./Message.css";
import Avatar from '@material-ui/core/Avatar';

// name -> 현재 접속한 유저
// const Message = ({ message: { text, user }, name }) => {
const Message = ({ message: { user, imageUrl, text }, name }) => {
  console.log("In Message, user : ", user);
  console.log("In Message, imageUrl : ", imageUrl);
  console.log("In Message, text : ", text);
  let isSentByCurrentUser = false;
  const trimmedName = name.trim().toLowerCase();
  if (user === trimmedName) {
    isSentByCurrentUser = true;
  }
  return isSentByCurrentUser ? (
    <div className="messageContainer end">
      <div className="messageBox backgroundYellow ">
        <p className="messageText black">{text}</p>
      </div>
    </div>
  ) : (
    <div className="messageContainer start">
        <Avatar alt="Remy Sharp" src={imageUrl} />
        <div>
          <p className="sentMessage ml-10">{user}</p>
          <div className="messageBox backgroundLight ml-10">
            <p className="messageText black">{text}</p>
          </div>
        </div>
    </div>
  );
};

export default Message;

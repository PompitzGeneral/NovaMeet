import React from "react";
import "./Message.css";
import Avatar from '@material-ui/core/Avatar';

// name -> 현재 접속한 유저
// const Message = ({ message: { text, user }, name }) => {
const Message = ({ message: { userID, userDisplayName, userImageUrl, text }, userInfo }) => {
  let isSentByCurrentUser = false;
  console.log("test, loginUserID:", userInfo)
  console.log("message, text:", text)
  const trimmedLoginUserID = userInfo.userID.trim().toLowerCase();
  // const trimmedLoginUserID = loginUserID;
  if (userID === trimmedLoginUserID) {
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
        <Avatar alt="Remy Sharp" src={userImageUrl} />
        <div>
          <p className="sentMessage ml-10">{userDisplayName}</p>
          <div className="messageBox backgroundLight ml-10">
            <p className="messageText black">{text}</p>
          </div>
        </div>
    </div>
  );
};

export default Message;

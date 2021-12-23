import React from "react";

import Message from "./Message/Message";

import "./Messages.css";

const Messages = ({ messages, userInfo }) => (
  <div className="messages">
    {messages.map((message, i) => (
      <div key={i}>
        <Message message={message} userInfo={userInfo} />
      </div>
    ))}
  </div>
);

export default Messages;

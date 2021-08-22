import React from "react";
import "./Input.css";

import Button from "@material-ui/core/Button";

const Input = ({ message, setMessage, sendMessage }) => (
  <div className="inputContainer">
    <input
      className="input"
      type="text"
      placeholder="모든 사용자에게 메시지 보내기"
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyPress={(e) => (e.key === "Enter" ? sendMessage(e) : null)}
    />
    <Button
      variant="outlined" color="primary"
      className="inputButton"
      onClick={(e) => sendMessage(e)}
    >
      <i className="material-icons">send</i>
    </Button>
  </div>
);
export default Input;

import React, { useState } from "react";
import {Link} from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import "components/RoomContainerElement.css";

const RoomContainerElement = ({ roomInfo, onClickCallBack }) => {
    return (
      // <Link to={`/ChatRoom/${roomInfo.roomID}`}>
        <div className="room" onClick={onClickCallBack}>
            <div className="thumbnail">
            {
              roomInfo.roomThumbnailUrl ? (
                <img src={roomInfo.roomThumbnailUrl} alt="" />
              ) : (
              <img src="default_room_thumbnail.jpg" alt="" />
            )
          }
        </div>
        <div className="details">
          {/* <div className="author">
            <Avatar alt="Remy Sharp" src={roomInfo.roomOwnerImageUrl} />
          </div> */}
          {/* alt="Remy Sharp" */}
          <Avatar src={roomInfo.roomOwnerImageUrl} />
          <div className="title">
                <h3>
                  {roomInfo.roomID}
                </h3>
                <span>{roomInfo.roomOwner}</span>
                {console.log(`roomInfo.roomMemberCurrntCount : ${roomInfo.roomMemberCurrentCount}`)}
                <span>참여인원 : {roomInfo.roomMemberCurrentCount}/{roomInfo.roomMemberMaxCount}</span>
              </div>
            </div>
        </div>
      // </Link>
    )
};

export default RoomContainerElement;
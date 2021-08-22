import React, { useState, useEffect } from "react";
import AppRouter from "components/Router";
import axios from 'axios';
import "components/Members.css"
import Avatar from '@material-ui/core/Avatar';

// Material-ui
import Paper from "@material-ui/core/Paper";

function Members({ users }) {

  useEffect(() => {
    console.log("Members, users:", users);
  }, []);

  return (
    <div className="memberScreen">
      <Paper elevation={5} className="memberScreenPaper">
      {/* id, name, imageUrl, room */}
        {users.map((user, index) => {
          return (
            <div key={index} >
              <Avatar alt="Remy Sharp" src={user.imageUrl} />
              {user.name}
            </div>
          );
        })}
      </Paper>
    </div>
  );
}

export default Members;
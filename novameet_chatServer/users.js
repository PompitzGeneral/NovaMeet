const users = [];

const addUser = ({ socketID, userID, userDisplayName, userImageUrl, roomID }) => {

  userID = userID.trim().toLowerCase();
  roomID = roomID.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.roomID === roomID && user.userID === userID
  );

  if (existingUser) {
    return { error: "Username is taken" };
  }

  const user = { socketID, userID, userDisplayName, userImageUrl, roomID };

  users.push(user);
  console.log("addUser_users : ", users);
  return { user };
};

const removeUser = (socketID) => {
  const index = users.findIndex((user) => user.socketID === socketID);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (socketID) => users.find((user) => user.socketID === socketID);

const getUsersInRoom = (roomID) => users.filter((user) => user.roomID === roomID);

// module.exports = { addUser, removeUser, getUser, getUsersInRoom };
export default { addUser, removeUser, getUser, getUsersInRoom };

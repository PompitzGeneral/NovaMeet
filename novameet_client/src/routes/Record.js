import React, { useState, useEffect } from "react";

const Record = () => {

  const [loginID] = useState("");
  useEffect(() => {
      // - ReactHook - 
      // componentDidMount, componentDidUpdate, componentWillDismount 시 일어날 항목 제어
  }, []);
  return (
    <div className="container">
      Record
    </div>
  );
};
export default Record;
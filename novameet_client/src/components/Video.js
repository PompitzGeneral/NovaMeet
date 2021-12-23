import React, { useState, useEffect, useRef } from "react";
import Styled from 'styled-components';
import 'components/Video.css';

import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';

// const Video = ({displayName, stream, muted}) => {
const Video = ({userID, displayName, isVideoEnabled, isAudioEnabled, stream, muted}) => {
    const ref = useRef(null);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        console.log("Video_displayName", displayName);
        console.log("Video_isVideoEnabled", isVideoEnabled);
        console.log("Video_isAudioEnabled", isAudioEnabled);

        if (ref.current) ref.current.srcObject = stream;
        if (muted) setIsMuted(muted);
    })

    return (
        <div>
            <video
            width="240"
            height="240"
            className="video"
                ref={ref}
                muted={isMuted}
                autoPlay>
            </video>
            <div>
            {isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
            {displayName}
            </div>
        </div>
    );
}

export default Video;
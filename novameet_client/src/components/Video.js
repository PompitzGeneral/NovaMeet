import React, { useState, useEffect, useRef } from "react";
import Styled from 'styled-components';
// import 'components/Video.css';

const Video = ({displayName, stream, muted}) => {
    const ref = useRef(null);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (ref.current) ref.current.srcObject = stream;
        if (muted) setIsMuted(muted);
    })

    return (
        <div>
            <video
            className="video"
                ref={ref}
                muted={isMuted}
                autoPlay>
            </video>
            <div>
            <p>{displayName}</p>
            </div>
        </div>
    );
}

export default Video;
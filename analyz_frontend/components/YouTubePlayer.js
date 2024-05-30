import React, { useRef } from 'react';
import YouTube from 'react-youtube';

const YouTubePlayer = ({ videoId, onReady }) => {
    const playerRef = useRef(null);

    const handleReady = (event) => {
        playerRef.current = event.target;
        if (onReady) {
            onReady(event.target);
        }
    };

    const opts = {
        height: '390',
        width: '640',
        playerVars: {
            autoplay: 1,
        },
    };

    return <YouTube videoId={videoId} opts={opts} onReady={handleReady} />;
};

export default YouTubePlayer;

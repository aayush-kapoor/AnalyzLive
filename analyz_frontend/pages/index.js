import React, { useState } from 'react';
import axios from 'axios';
import YouTubePlayer from '../components/YouTubePlayer';

const Home = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [videoId, setVideoId] = useState('');
    const [keyword, setKeyword] = useState('');
    const [timestamps, setTimestamps] = useState([]);
    const [player, setPlayer] = useState(null);

    const handleVideoSubmit = (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams(new URL(videoUrl).search);
        setVideoId(urlParams.get('v') || '');
    };

    const handleKeywordSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/keywords/search/', {
                video_url: videoUrl,
                keyword: keyword,
            });
            setTimestamps(response.data.timestamps);
        } catch (error) {
            console.error('Error fetching timestamps:', error);
        }
    };

    const handleTimestampClick = (timestamp) => {
        if (player) {
            player.seekTo(timestamp);
        }
    };

    return (
        <div>
            <h1>Video Player</h1>
            <form onSubmit={handleVideoSubmit}>
                <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Enter YouTube URL"
                />
                <button type="submit">Load Video</button>
            </form>
            {videoId && (
                <YouTubePlayer
                    videoId={videoId}
                    onReady={(playerInstance) => setPlayer(playerInstance)}
                />
            )}
            <h1>Keyword Search</h1>
            <form onSubmit={handleKeywordSubmit}>
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Enter keyword or phrase"
                />
                <button type="submit">Submit</button>
            </form>
            {timestamps.length > 0 && (
                <div>
                    <h2>Timestamps</h2>
                    <ul>
                        {timestamps.map((timestamp, index) => (
                            <li key={index}>
                                <button onClick={() => handleTimestampClick(timestamp)}>
                                    {timestamp}s
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Home;

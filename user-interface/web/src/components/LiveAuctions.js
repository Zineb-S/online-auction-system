import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

// Connect to the server where Socket.io is running
const socket = io('http://localhost:3003');

const LiveAuctions = () => {
  const [liveAuctions, setLiveAuctions] = useState([]);

  // Function to fetch live auctions
  const fetchLiveAuctions = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/auctions/live');
      setLiveAuctions(response.data);
    } catch (error) {
      console.error('Error fetching live auctions:', error);
    }
  };

  useEffect(() => {
    // Initial fetch of live auctions
    fetchLiveAuctions();

    // Setting up WebSocket listeners
    socket.on('auctionStatusChange', (data) => {
      if (data.status === 'live') {
        fetchLiveAuctions(); // Re-fetch the live auctions if there's a new live auction
      } else if (data.status === 'ended') {
        // Filter out the ended auction
        setLiveAuctions((currentAuctions) =>
          currentAuctions.filter((auction) => auction._id !== data.auctionId)
        );
      }
    });

    // Clean up the listener when the component unmounts
    return () => {
      socket.off('auctionStatusChange');
    };
  }, []);

  return (
    <div>
      <h1>Live Auctions</h1>
      {liveAuctions.map((auction) => (
        <div key={auction._id}>
          <h2>{auction.title}</h2>
          <p>Status: {auction.status}</p>
          {/* Display auction details and bid form */}
        </div>
      ))}
    </div>
  );
};

export default LiveAuctions;

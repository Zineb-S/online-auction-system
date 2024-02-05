import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const socket = io('http://localhost:3003'); // Connect to Socket.io server

const LiveAuctions = () => {
  const [liveAuctions, setLiveAuctions] = useState([]);

  const fetchLiveAuctions = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/auctions/live');
      setLiveAuctions(response.data);
    } catch (error) {
      console.error('Error fetching live auctions:', error);
    }
  };

  useEffect(() => {
    fetchLiveAuctions();
    socket.on('auctionStatusChange', (data) => {
      if (data.status === 'live') {
        fetchLiveAuctions();
      } else if (data.status === 'ended') {
        setLiveAuctions((currentAuctions) =>
          currentAuctions.filter((auction) => auction._id !== data.auctionId)
        );
      }
    });

    return () => {
      socket.off('auctionStatusChange');
    };
  }, []);

  return (
    <Container>
      <h1 className="text-center mt-5">Live Auctions</h1>
      <Row xs={1} md={2} lg={3} className="g-4 mt-3">
        {liveAuctions.map((auction, index) => (
          <Col key={auction._id}>
            <Card>
              <Card.Img variant="top" src="https://images.squarespace-cdn.com/content/v1/613fa0fd3c025158dc164fae/1632859233232-TOMXV3UUI80WH5SQ0DCC/auctionphoto.jpg" />
              <Card.Body>
              <Card.Title>Auction {index + 1}</Card.Title>
                <Card.Text>
                  
                  Status: {auction.status}
                 
                </Card.Text>
                <Link to={`/live-auctions/${auction._id}`}>
                                  <Button variant="success">View Auction</Button>
                              </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default LiveAuctions;

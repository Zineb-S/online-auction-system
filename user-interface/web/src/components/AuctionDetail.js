import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import BidList from './BidList';
import { Card, Button, Container, Row, Col, Accordion } from 'react-bootstrap';

const AuctionDetail = () => {
  const [auction, setAuction] = useState(null);
  const { auctionId } = useParams();

  useEffect(() => {
    const fetchAuctionDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/auctions/${auctionId}`);
        setAuction(response.data);
      } catch (error) {
        console.error('Error fetching auction details:', error);
      }
    };

    fetchAuctionDetail();
  }, [auctionId]);

  if (!auction) return <div>Loading...</div>;

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="mb-4 text-center">Auction Details</h1>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Status: {auction.status}</Card.Title>
              <Card.Text>Start Time: {new Date(auction.startTime).toLocaleString()}</Card.Text>
              <Card.Text>End Time: {new Date(auction.endTime).toLocaleString()}</Card.Text>
            </Card.Body>
          </Card>
          {auction.items.map((item, index) => (
            <Accordion key={index} defaultActiveKey="0" className="mb-3">
              <Accordion.Item eventKey="0">
                <Accordion.Header>{`Item #${index + 1} - ${item.title}`}</Accordion.Header>
                <Accordion.Body>
                  <div>
                    <p>{item.description}</p>
                    {item.images[0] && <img src={item.images[0]} alt={item.title} style={{ maxWidth: '100%' }} />}
                    <BidList itemId={item._id} />
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default AuctionDetail;

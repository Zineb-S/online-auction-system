import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { ToastContainer, toast } from 'react-toastify';
const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/auctions');
        setAuctions(response.data);
      } catch (error) {
        console.error('Error fetching auctions:', error);
      }
    };

    fetchAuctions();
  }, []);
  toast.success("Logged in succcessfully ! ")
  return (
    <><ToastContainer />
    <Container>
          <h1 className="mt-5">Auctions</h1>
          <Row xs={1} md={2} lg={3} className="g-4 mt-3">
              {auctions.map((auction, index) => (
                  <Col key={auction._id}>
                      <Card>
                          {/* Assuming you have images, otherwise you can remove the Card.Img component */}
                          <Card.Img variant="top" src="holder.js/100px180" />
                          <Card.Body>
                              <Card.Title>Auction {index + 1}</Card.Title>
                              <Card.Text>
                                  {/* Here you can add more details about the auction */}
                                  Start Time: {new Date(auction.startTime).toLocaleString()}
                                  <br />
                                  End Time: {new Date(auction.endTime).toLocaleString()}
                                  <br />
                                  Status: {auction.status}
                              </Card.Text>
                              <Link to={`/auctions/${auction._id}`}>
                                  <Button variant="primary">View Auction</Button>
                              </Link>
                          </Card.Body>
                      </Card>
                  </Col>
              ))}
          </Row>
      </Container></>
  );
};

export default AuctionList;

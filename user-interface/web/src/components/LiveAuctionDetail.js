import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Card, Button, Container, Row, Col, Accordion, Form } from 'react-bootstrap';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:3003');

const LiveAuctionDetail = () => {
    const { auctionId } = useParams();
    const [auction, setAuction] = useState(null);
    const [highestBids, setHighestBids] = useState({}); // State to hold the highest bids for each item

    useEffect(() => {
        const fetchAuctionDetailAndBids = async () => {
            try {
                // Fetch auction details
                const auctionResponse = await axios.get(`http://localhost:3001/api/auctions/${auctionId}`);
                setAuction(auctionResponse.data);

                // Fetch highest bids for each item in the auction
                const highestBidsUpdate = {};
                for (let item of auctionResponse.data.items) {
                    try {
                        const highestBidResponse = await axios.get(`http://localhost:3001/api/bids/winning/${item._id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}`}} );
                        // Update with the actual amount, ensure to parse if necessary
                        highestBidsUpdate[item._id] = highestBidResponse.data.amount;
                    } catch (error) {
                        // Log error or handle as needed
                        console.error(`Error fetching highest bid for item ${item._id}:`, error);
                        highestBidsUpdate[item._id] = "Not Available"; // Default text if no bids found
                    }
                }
                setHighestBids(highestBidsUpdate);
            } catch (error) {
                console.error('Error fetching auction details:', error);
            }
        };

        fetchAuctionDetailAndBids();

        socket.on('bidUpdate', (data) => {
            if (data.auctionId === auctionId) {
                setHighestBids(prevBids => ({
                    ...prevBids,
                    [data.itemId]: data.newHighestBid
                }));
            }
        });

        return () => socket.off('bidUpdate');
    }, [auctionId]);
    
    const handleBidSubmit = async (itemId, bidAmount) => {
        console.log('Auction ID:', auctionId); // Debug log
        try {
            const payload = {
                item: itemId,
                amount: bidAmount,
                auctionId: auctionId, // Ensure this is correctly populated
            };
            console.log('Sending payload:', payload); // Debug log
            await axios.post(`http://localhost:3001/api/bids`, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            console.log('Bid placed successfully'); // Debug log
            socket.emit('placeBid', { auctionId, itemId, bid: bidAmount });
        } catch (error) {
            console.error('Error placing bid:', error);
        }
    };
    

    if (!auction) return <div>Loading...</div>;

    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <h1 className="mb-4 text-center">Live Auction Details</h1>
                    {auction.items.map((item, index) => (
                        <Accordion key={item._id} className="mb-3">
                            <Accordion.Item eventKey={index.toString()}>
                                <Accordion.Header>{item.title}</Accordion.Header>
                                <Accordion.Body>
                                    <Card className="mb-3">
                                        <Card.Body>
                                        <Card.Title>Current Highest Bid: ${highestBids[item._id]}</Card.Title>
                                            <Form onSubmit={(e) => {
                                                e.preventDefault();
                                                const bidAmount = e.target[`bidAmount-${item._id}`].value;
                                                handleBidSubmit(item._id, bidAmount);
                                                e.target.reset();
                                            }}>
                                                <Form.Group controlId={`bidAmount-${item._id}`} className="mb-3">
                                                    <Form.Label>Place Your Bid</Form.Label>
                                                    <Form.Control type="number" placeholder="Enter your bid"  />
                                                </Form.Group>
                                                <Button variant="primary" type="submit">Bid</Button>
                                            </Form>
                                        </Card.Body>
                                    </Card>
                                    <p>{item.description}</p>
                                    {item.images && item.images[0] && <img src={item.images[0]} alt={item.title} style={{ maxWidth: '100%', marginBottom: '20px' }} />}
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    ))}
                </Col>
            </Row>
        </Container>
    );
};

export default LiveAuctionDetail;
//min={bids[item._id] + 1} required
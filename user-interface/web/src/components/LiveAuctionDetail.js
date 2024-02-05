// LiveAuctionDetail.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Card, Button, Container, Row, Col, Accordion, Form } from 'react-bootstrap';
import io from 'socket.io-client';

// Assuming your WebSocket server is running on the same server as your auction service
const socket = io.connect('http://localhost:3003');

const LiveAuctionDetail = () => {
    const { auctionId } = useParams();
    const [auction, setAuction] = useState(null);
    const [bids, setBids] = useState({}); // Object to hold bids for each item

    useEffect(() => {
        const fetchAuctionDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/auctions/${auctionId}`);
                setAuction(response.data);

                // Initialize bids state with each item's current highest bid
                const initialBids = {};
                await Promise.all(response.data.items.map(async (item) => {
                    const highestBidResponse = await axios.get(`http://localhost:3001/api/bids/winning/${item._id}`);
                    initialBids[item._id] = highestBidResponse.data.amount || 0;
                }));
                setBids(initialBids);
            } catch (error) {
                console.error('Error fetching auction details:', error);
            }
        };

        fetchAuctionDetail();

        // Setup WebSocket listener for bid updates
        socket.on('bidUpdate', (data) => {
            if (data.auctionId === auctionId) {
                setBids((prevBids) => ({
                    ...prevBids,
                    [data.itemId]: data.newHighestBid,
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
                                            <Card.Title>Current Highest Bid: ${bids[item._id]}</Card.Title>
                                            <Form onSubmit={(e) => {
                                                e.preventDefault();
                                                const bidAmount = e.target[`bidAmount-${item._id}`].value;
                                                handleBidSubmit(item._id, bidAmount);
                                                e.target.reset();
                                            }}>
                                                <Form.Group controlId={`bidAmount-${item._id}`} className="mb-3">
                                                    <Form.Label>Place Your Bid</Form.Label>
                                                    <Form.Control type="number" placeholder="Enter your bid" min={bids[item._id] + 1} required />
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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ListGroup } from 'react-bootstrap';

const BidList = ({ itemId }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      const token = localStorage.getItem('token'); // Retrieve the token from local storage
      try {
        const response = await axios.get(`http://localhost:3001/api/bids/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBids(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bids:', error);
        setLoading(false);
      }
    };

    if (itemId) fetchBids();
  }, [itemId]);

  if (loading) return <div>Loading bids...</div>;

  return (
    <div>
      <h3>Bids for Item {itemId}</h3>
      <ListGroup>
        {bids.length ? (
          bids.map((bid) => (
            <ListGroup.Item key={bid._id}>
              {bid.amount} MAD by {bid.userDetails?.firstName} {bid.userDetails?.lastName} 
            </ListGroup.Item>
          ))
        ) : (
          <p>No bids found for this item.</p>
        )}
      </ListGroup>
    </div>
  );
};

export default BidList;

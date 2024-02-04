import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [bids, setBids] = useState([]);

  useEffect(() => {
    fetchUserProfile();
    fetchUserBids();
  }, []);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:3001/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      toast.error('Error fetching profile information');
    }
  };

  const fetchUserBids = async () => {
    const token = localStorage.getItem('token');
    try {
      const userBidsResponse = await axios.get('http://localhost:3001/api/bids/user-bids', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // this is not a good approach since we will need many requests we should
      const bidsWithWinningStatus = await Promise.all(userBidsResponse.data.map(async (bid) => {
        const winningBidResponse = await axios.get(`http://localhost:3001/api/bids/winning/${bid.item}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return { ...bid, isWinning: winningBidResponse.data._id === bid._id };
      }));
      setBids(bidsWithWinningStatus);
    } catch (error) {
      console.error('Error fetching bids:', error);
      toast.error('Error fetching bids');
    }
  };

  return (
    <div>
      <ToastContainer />
      {user && (
        <div>
          <h2>Profile Information</h2>
          <p>Name: {user.firstName} {user.lastName}</p>
          <p>Email: {user.email}</p>
          {/* Add more user details here */}
        </div>
      )}

<div>
        <h3>Your Bids</h3>
        <ul>
          {bids.map(bid => (
            <li key={bid._id} style={bid.isWinning ? { color: 'green', fontWeight: 'bold' } : null}>
              {`Bid on item ${bid.item} with amount ${bid.amount}`} {bid.isWinning && "(Winning Bid)"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Profile;

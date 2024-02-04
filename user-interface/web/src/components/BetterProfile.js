import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [bids, setBids] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);

  useEffect(() => {
    fetchUserProfile();
    fetchUserBids();
    fetchWonAuctions();
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
      const response = await axios.get('http://localhost:3001/api/bids/user-bids', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBids(response.data);
    } catch (error) {
      toast.error('Error fetching bids');
    }
  };

  const fetchWonAuctions = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:3001/api/auctions/won', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWonAuctions(response.data);
    } catch (error) {
      toast.error('Error fetching won auctions');
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
            <li key={bid._id}>{`Bid on item ${bid.item} with amount ${bid.amount}`}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Won Auctions</h3>
        <ul>
          {wonAuctions.map(auction => (
            <li key={auction._id}>{`Won auction ${auction.title} with bid ${auction.winningBid}`}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Profile;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import NavigationBar from './NavigationBar';
import AuctionList from './AuctionList';
import AuctionDetail from './AuctionDetail';
import BidList from './BidList';
import { ProtectedRoute } from './ProtectedRoute';
import 'react-toastify/dist/ReactToastify.css'; 
import Homepage from './Homepage';
import Profile from './Profile';
import LiveAuctions from './LiveAuctions';
import LiveAuctionDetail from './LiveAuctionDetail';
function App() {
  return (
    <Router>
      <NavigationBar />
      <Routes> 
        <Route path='/' element={<Homepage/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auctions" element={<AuctionList />} />
        <Route path="/live-auctions" element={<LiveAuctions />} />
        <Route path="/auctions/:auctionId" element={<ProtectedRoute><AuctionDetail /></ProtectedRoute>} />
        <Route path="/live-auctions/:auctionId" element={<ProtectedRoute><LiveAuctionDetail /></ProtectedRoute>} />
        <Route path="/items/:itemId/bids" element={<ProtectedRoute><BidList /></ProtectedRoute>} />
       <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;

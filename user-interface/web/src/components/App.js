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
function App() {
  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auctions" element={<AuctionList />} />
        <Route path="/auctions/:auctionId" element={
          <ProtectedRoute>
            <AuctionDetail />
          </ProtectedRoute>
        } />
        <Route path="/items/:itemId/bids" element={
          <ProtectedRoute>
            <BidList />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;

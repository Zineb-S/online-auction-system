export const useAuth = () => {
    const userToken = localStorage.getItem('token');
    return !!userToken; // Returns true if token exists, false otherwise
  };
  
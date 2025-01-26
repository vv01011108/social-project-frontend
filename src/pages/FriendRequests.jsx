import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FriendRequests.css';

const FriendRequests = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [userId, setUserId] = useState(null); // 로그인된 사용자 ID를 저장할 state

  useEffect(() => {
    // 로그인한 사용자 ID를 받아오는 방법에 따라 userId를 설정
    // 예시로 localStorage에서 userId를 가져온다고 가정
    const currentUserId = localStorage.getItem('userId'); 
    setUserId(currentUserId);

    if (currentUserId) {
      const fetchFriendRequests = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/friend-requests/pending/${currentUserId}`, {
            withCredentials: true,
          });
          setFriendRequests(response.data);
        } catch (err) {
          console.error('친구 요청 가져오기 실패:', err);
        }
      };

      fetchFriendRequests();
    }
  }, []);

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/friend-requests/${requestId}/accept`, {}, { withCredentials: true });
      setFriendRequests(friendRequests.filter(request => request.id !== requestId));
    } catch (err) {
      console.error('친구 요청 수락 실패:', err);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/friend-requests/${requestId}/delete`, {}, { withCredentials: true });
      setFriendRequests(friendRequests.filter(request => request.id !== requestId));
    } catch (err) {
      console.error('친구 요청 삭제 실패:', err);
    }
  };

  return (
    <div className="friend-requests-container">
      <h2>친구 요청</h2>
      {friendRequests.length === 0 ? (
        <p>받은 친구 요청이 없습니다.</p>
      ) : (
        <ul>
          {friendRequests.map((request) => (
            <li key={request.id}>
              <p>{request.senderName}</p>
              <button onClick={() => handleAcceptRequest(request.id)}>수락</button>
              <button onClick={() => handleDeleteRequest(request.id)}>삭제</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendRequests;

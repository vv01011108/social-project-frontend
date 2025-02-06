import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FriendRequests.css';
import { useParams } from 'react-router-dom';

const FriendRequests = () => {
  const { userId } = useParams(); // URL 파라미터에서 userId를 받음
  const [friendRequests, setFriendRequests] = useState([]); // 친구 요청 목록 상태
  const [loading, setLoading] = useState(true); // 로딩 상태

  // 친구 요청 목록을 받아오는 useEffect
  useEffect(() => {
    if (userId) {
      const fetchFriendRequests = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/friend-requests/pending/${userId}`, {
            withCredentials: true,
          });
          if (Array.isArray(response.data.data)) {
            setFriendRequests(response.data.data); // 친구 요청 목록 설정
          } else {
            console.error('친구 요청 데이터가 배열이 아닙니다.');
          }
        } catch (err) {
          console.error('친구 요청 가져오기 실패:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchFriendRequests();
    }
  }, [userId]);

  // 친구 요청 수락 함수
  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/friend-requests/${requestId}/accept`, null, {
        withCredentials: true,
      });
      setFriendRequests((prevRequests) => prevRequests.filter(request => request.id !== requestId));
    } catch (err) {
      console.error('친구 요청 수락 실패:', err);
    }
  };

  // 친구 요청 삭제 함수
  const handleDeleteRequest = async (requestId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/friend-requests/${requestId}`, {
        withCredentials: true,
      });
      setFriendRequests((prevRequests) => prevRequests.filter(request => request.id !== requestId));
    } catch (err) {
      console.error('친구 요청 삭제 실패:', err);
    }
  };

  return (
    <div className="friend-requests-container">
      <h2>친구 요청</h2>
      {loading ? (
        <p>로딩 중...</p>
      ) : friendRequests.length === 0 ? (
        <p>받은 친구 요청이 없습니다.</p>
      ) : (
        <ul>
          {friendRequests.map((request) => (
            <li key={request.id}>
              <p>{request.sender.name}님이 친구 요청을 보냈습니다.</p>
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

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState(null); // 상태: PENDING, ACCEPTED, REJECTED
  const [senderId, setSenderId] = useState(null);

  // 초기 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loggedInResponse, userProfileResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}`)
        ]);

        setSenderId(loggedInResponse.data.id);
        setUser(userProfileResponse.data);

        // 친구 요청 상태 가져오기
        const friendRequestResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/friend-requests/status`,
          { params: { senderId: loggedInResponse.data.id, receiverId: userId }, withCredentials: true }
        );
        setRequestStatus(friendRequestResponse.data.status);
      } catch (err) {
        console.error('데이터를 가져오는 중 오류가 발생했습니다:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // 친구 추가 요청 처리
  const handleAddFriend = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/friend-requests`,
        null,
        { params: { senderId, receiverId: userId }, withCredentials: true }
      );
      setRequestStatus('PENDING');
    } catch (err) {
      console.error('친구 추가 요청 중 오류가 발생했습니다:', err);
    }
  };

  // 친구 요청 취소 처리
  const handleCancelRequest = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/friend-requests`,
        { params: { senderId, receiverId: userId }, withCredentials: true }
      );
      setRequestStatus(null);
    } catch (err) {
      console.error('친구 요청 취소 중 오류가 발생했습니다:', err);
    }
  };

  // 친구 요청 수락 처리
  const handleAcceptRequest = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/friend-requests/accept`,
        null,
        { params: { senderId, receiverId: userId }, withCredentials: true }
      );
      setRequestStatus('ACCEPTED');
    } catch (err) {
      console.error('친구 요청 수락 중 오류가 발생했습니다:', err);
    }
  };

  if (loading) {
    return <p>로딩 중...</p>;
  }

  if (!user) {
    return <p>사용자를 찾을 수 없습니다.</p>;
  }

  return (
    <div className="user-profile-container">
      <h2>{user.name}님의 프로필</h2>
      <img src={user.photo} alt={`${user.name}의 프로필 사진`} className="profile-picture" />
      <p><strong>이름:</strong> {user.name}</p>
      <p><strong>이메일:</strong> {user.email}</p>
      <p><strong>관심 분야:</strong> {user.interest}</p>
      <p><strong>직장/학교:</strong> {user.workplace}</p>
      <p><strong>전화번호:</strong> {user.phoneNumber}</p>

      {/* 친구 상태 표시 및 버튼 */}
      {requestStatus === 'PENDING' && (
        <>
          <p>친구 요청 대기 중...</p>
          <button onClick={handleCancelRequest} className="cancel-friend-request-button">
            요청 취소
          </button>
        </>
      )}

      {requestStatus === 'ACCEPTED' && <p>이미 친구입니다!</p>}

      {requestStatus === 'REJECTED' && (
        <p>
          친구 요청이 거절되었습니다. 
          <button onClick={handleAddFriend} className="add-friend-button">
            다시 요청
          </button>
        </p>
      )}

      {!requestStatus && (
        <button onClick={handleAddFriend} className="add-friend-button">
          친구 추가
        </button>
      )}

      {requestStatus === 'RECEIVED' && (
        <button onClick={handleAcceptRequest} className="accept-friend-request-button">
          친구 요청 수락
        </button>
      )}
    </div>
  );
};

export default UserProfilePage;
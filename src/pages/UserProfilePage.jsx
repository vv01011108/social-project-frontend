import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState(null); // 상태: PENDING, ACCEPTED, REJECTED, RECEIVED
  const [senderId, setSenderId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // 초기 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loggedInResponse, userProfileResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, { withCredentials: true })
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
        setErrorMessage('데이터를 가져오는 중 문제가 발생했습니다. 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // 친구 추가 요청 처리
  const handleAddFriend = async () => {
    try {
      setErrorMessage(null); // 오류 메시지 초기화
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/friend-requests`,
        null,
        { params: { senderId, receiverId: userId }, withCredentials: true }
      );
      setRequestStatus('PENDING');
    } catch (err) {
      console.error('친구 추가 요청 중 오류가 발생했습니다:', err);
      setErrorMessage(
        err.response?.data?.message || '친구 추가 요청 중 문제가 발생했습니다. 다시 시도해주세요.'
      );
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

      {/* 오류 메시지 표시 */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* 버튼을 모든 상태에서 띄우도록 수정 */}
      <button onClick={handleAddFriend} className="add-friend-button">
        친구 추가
      </button>

      {requestStatus === 'PENDING' && <p>친구 요청 대기 중...</p>}

      {requestStatus === 'ACCEPTED' && <p>이미 친구입니다!</p>}

      {requestStatus === 'REJECTED' && (
        <p>
          친구 요청이 거절되었습니다. 
          <button onClick={handleAddFriend} className="add-friend-button">
            다시 요청
          </button>
        </p>
      )}
    </div>
  );
};

export default UserProfilePage;

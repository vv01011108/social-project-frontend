import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserProfilePage.css';
import { useParams } from 'react-router-dom';

const UserProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState(null); // 상태: PENDING, ACCEPTED, REJECTED, NONE
  const [senderId, setSenderId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [requestId, setRequestId] = useState(null); // 요청 ID를 저장

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

        // 로컬 스토리지에서 상태 및 요청 ID 가져오기
        const storedStatus = localStorage.getItem(`friendRequestStatus-${userId}`);
        const storedRequestId = localStorage.getItem(`friendRequestId-${userId}`);

        if (storedStatus) {
          setRequestStatus(storedStatus);
        } else {
          const checkRequestStatus = async (senderId, receiverId) => {
            try {
              const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/friend-requests/status`,
                { params: { senderId, receiverId } }
              );
              return response.data.status;
            } catch (err) {
              return null;
            }
          };

          let status = await checkRequestStatus(loggedInResponse.data.id, userId);
          if (!status) {
            status = await checkRequestStatus(userId, loggedInResponse.data.id);
          }

          setRequestStatus(status);
        }

        if (storedRequestId) {
          setRequestId(storedRequestId); // ✅ 로컬 스토리지에서 요청 ID 불러오기 추가
        }
      } catch (err) {
        console.error('사용자 데이터를 가져오는 중 오류가 발생했습니다:', err);
        setErrorMessage('사용자 데이터를 가져오는 중 문제가 발생했습니다. 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // 친구 추가 요청 처리
  const handleAddFriend = async () => {
    if (isProcessing || senderId === null || requestStatus === 'ACCEPTED') return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/friend-requests`,
        { senderId: senderId, receiverId: userId },
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        setRequestStatus('PENDING');
        setRequestId(response.data.data.id); // ✅ 친구 요청 ID 저장
        localStorage.setItem(`friendRequestStatus-${userId}`, 'PENDING');
        localStorage.setItem(`friendRequestId-${userId}`, response.data.data.id);
      }
    } catch (err) {
      console.error('친구 추가 요청 중 오류가 발생했습니다:', err);
      setErrorMessage(err.response?.data?.message || '친구 추가 요청 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 친구 요청 취소 처리
  const handleCancelFriendship = async () => {
    if (isProcessing || senderId === null || requestStatus !== 'PENDING' || requestId === null) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/friend-requests/${requestId}`, {
        withCredentials: true,
      });

      // 친구 취소 후 상태 초기화 및 UI 갱신
      setRequestStatus(null);
      setRequestId(null);
      localStorage.removeItem(`friendRequestStatus-${userId}`);
      localStorage.removeItem(`friendRequestId-${userId}`); // ✅ 친구 요청 ID도 삭제

    } catch (err) {
      console.error('친구 취소 중 오류가 발생했습니다:', err);
      setErrorMessage('친구 취소 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsProcessing(false);
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

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {requestStatus === 'ACCEPTED' ? (
        <div>
          <p>서로 친구입니다.</p>
          <button onClick={handleCancelFriendship} className="cancel-friend-button" disabled={isProcessing}>
            친구 취소
          </button>
        </div>
      ) : requestStatus === 'PENDING' ? (
        <div>
          <button className="add-friend-button" disabled>
            친구 요청 대기 중...
          </button>
          <button onClick={handleCancelFriendship} className="cancel-friend-button" disabled={isProcessing}>
            친구 요청 취소
          </button>
        </div>
      ) : (
        <button onClick={handleAddFriend} className="add-friend-button" disabled={isProcessing}>
          친구 추가
        </button>
      )}
    </div>
  );
};

export default UserProfilePage;
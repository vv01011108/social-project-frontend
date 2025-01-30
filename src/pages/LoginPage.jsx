import React, { useState } from 'react';
import './LoginPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 useNavigate 훅

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/login`, // 환경변수를 사용하여 주소 설정
        {
          email,
          password,
        },
        {
          withCredentials: true, // 세션 쿠키 포함
        }
      );

      // 로그인 성공 시 메인 페이지로 리디렉션
      console.log('로그인 성공여부:', response.data);
      navigate('/main'); // 로그인 성공 후 메인 페이지로 이동
    } catch (err) {
      setError('로그인 실패. 이메일 또는 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h2>로그인</h2>

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <div className="error-message">{error}</div>}

        <button type="submit">로그인</button>

        <a href="/signup" className="toggle-link">회원가입</a>
      </form>
    </div>
  );
};

export default LoginPage;

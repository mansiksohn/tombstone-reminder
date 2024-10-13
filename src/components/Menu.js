import React, { useState } from 'react'; // useState 포함하여 React를 임포트
import '../styles/index.scss'; // 모든 스타일을 한 곳에서 import
import LogoutButton from '../components/LogoutButton'; // LogoutButton을 가져오기
import { getCurrentUserId } from '../utils/supabaseService';
import { deleteAccount } from '../utils/supabaseService'; // 계정 삭제 함수 가져오기
import { signOut } from '../utils/authService'; // 로그아웃 함수 추가

function Menu({ menuOpen, setMenuOpen, userName }) {
  const [isDeleting, setIsDeleting] = useState(false); // 삭제 진행 상태

  const handleConfirmDelete = async () => {
    const confirmed = window.confirm('🕳️정말로 계정을 삭제할까요? 다시 되돌릴 수 없습니다.');
    if (confirmed) {
      try {
        setIsDeleting(true); // 삭제 진행 중 상태 설정
        const userId = await getCurrentUserId();
  
        // 성공 여부와 상관없이 계정 삭제 요청을 시도
        await deleteAccount(userId);
  
        // 삭제 성공 여부 확인하지 않고 바로 로그아웃 및 리디렉션 처리
        await signOut();
        window.location.href = '/'; // 홈 화면으로 리디렉션
  
      } catch (error) {
        // 오류 메시지 표시
        console.error("계정 삭제 중 오류 발생:", error);
        alert('계정 삭제 중 문제가 발생했습니다. 하지만 로그아웃됩니다.');
        
        // 오류가 발생해도 로그아웃 및 리디렉션
        await signOut();
        window.location.href = '/'; // 홈 화면으로 리디렉션
      } finally {
        setIsDeleting(false); // 삭제 완료 후 상태 초기화
      }
    }
  };
  

  return (
    <>
      {menuOpen && <div className="menu-background" onClick={() => setMenuOpen(false)}></div>}
      <div className={`menu-overlay ${menuOpen ? 'open' : ''}`}>
        <button onClick={() => setMenuOpen(false)} className="menu-close-button">✖</button>
        <div className="menu-content">
          <div className="user-name-container">
            <div className="user-name text-xl font-bold text-soul-green-500">
              {userName ? `${userName}` : '신원미상'}
              <span className="text-white">님</span>
            </div>
            </div>
          <a href="https://airtable.com/appOhndwisYFELv3L/pagJhR86TzB19yBbA/form" target="_blank" rel="noopener noreferrer" className="mb-4">
            문의 및 신고
          </a>
          <LogoutButton />
          {/* 계정 삭제 버튼 추가 */}
          <button 
            onClick={handleConfirmDelete} 
            className="account-delete-button text-red-500 mt-4"
            disabled={isDeleting} // 삭제 중에는 버튼 비활성화
          >
            {isDeleting ? '계정 삭제 중...' : '계정 삭제'}
          </button>
        </div>
      </div>
    </>
  );
}

export default Menu;

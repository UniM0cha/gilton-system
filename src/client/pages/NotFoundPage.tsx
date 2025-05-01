import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-6">404</h1>
      <p className="text-xl mb-8">페이지를 찾을 수 없습니다.</p>
      
      <Link 
        to="/" 
        className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg text-lg font-medium"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
};

export default NotFoundPage;

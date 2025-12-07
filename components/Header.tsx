
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m-5.22-6.22l-1.06-1.06a8.5 8.5 0 0112.56 0l-1.06 1.06M12 21.747a8.5 8.5 0 01-5.28-15.494l1.06-1.06a8.5 8.5 0 0110.44 0l1.06 1.06A8.5 8.5 0 0112 21.747z"></path></svg>
          <h1 className="text-xl font-bold text-white">Gerador de E-book com IA</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;

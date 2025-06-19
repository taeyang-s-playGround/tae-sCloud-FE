import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Upload, Radio, Cloud } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Streaming from './components/Streaming';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
        <nav className="bg-white shadow-lg border-b border-teal-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex items-center space-x-2 text-teal-600 mr-8">
                  <Cloud className="w-8 h-8" />
                  <span className="text-xl font-bold">CloudShare</span>
                </div>
                <div className="flex space-x-8">
                  <Link 
                    to="/" 
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-teal-600 transition-colors"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    파일 업로드
                  </Link>
                  <Link 
                    to="/streaming" 
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-teal-600 transition-colors"
                  >
                    <Radio className="w-5 h-5 mr-2" />
                    실시간 스트리밍
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<FileUpload />} />
            <Route path="/streaming" element={<Streaming />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
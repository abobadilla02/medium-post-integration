import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import CreatePost from './components/CreatePost';
import PostList from './components/PostList';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <nav>
          <h1>Medium Scheduler</h1>
          <ul>
            <li><Link to="/">Create Post</Link></li>
            <li><Link to="/posts">View Posts</Link></li>
          </ul>
        </nav>
      </header>
      
      <main className="container">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<CreatePost />} />
            <Route path="/posts" element={<PostList />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App; 
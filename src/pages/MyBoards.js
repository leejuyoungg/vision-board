import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserBoards, deleteBoard } from '../utils/api';
import '../styles/MyBoards.css';

function MyBoards() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load boards from MongoDB when component mounts
  useEffect(() => {
    if (user) {
      loadBoards();
    }
  }, [user]);

  const loadBoards = async () => {
    try {
      const response = await getUserBoards(user.id);
      setBoards(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading boards:', error);
      setLoading(false);
    }
  };

  const handleBoardClick = (boardId) => {
    navigate(`/editor?boardId=${boardId}`);
  };

  const handleNewBoard = () => {
    navigate('/editor');
  };

  const handleDeleteBoard = async (boardId, event) => {
    event.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this board?')) {
      try {
        await deleteBoard(boardId);
        setBoards(boards.filter(b => b._id !== boardId));
        alert('✅ Board deleted!');
      } catch (error) {
        console.error('Error deleting board:', error);
        alert('❌ Failed to delete board');
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '24px'
      }}>
        Loading your boards... ✨
      </div>
    );
  }

  return (
    <div className="my-boards-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-logo" onClick={() => navigate('/')}>
          Vision Board
        </div>
        <h1 className="nav-title">My Vision Boards</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {user && (
            <span style={{ fontSize: '14px', color: '#666' }}>
              {user.username}
            </span>
          )}
          <button className="new-board-btn" onClick={handleNewBoard}>
            + New Board
          </button>
          <button 
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#666',
              background: 'white',
              border: '2px solid black',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Gallery Header */}
      <div className="gallery-header">
        <h2 className="gallery-title">All Boards</h2>
        <div className="sort-dropdown">
          <select>
            <option>Recent First</option>
            <option>Oldest First</option>
            <option>Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Board Grid */}
      <div className="board-grid">
        {boards.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">📋✨</p>
            <h3>No vision boards yet!</h3>
            <p>Click the + button to create your first board</p>
            <button className="create-first-btn" onClick={handleNewBoard}>
              Create Your First Board
            </button>
          </div>
        ) : (
          boards.map((board, index) => (
            <div
              key={board._id}
              className={`board-card rotation-${index % 6}`}
              onClick={() => handleBoardClick(board._id)}
            >
              <div className="board-image">
                {board.thumbnail ? (
                  <img src={board.thumbnail} alt={board.name} />
                ) : (
                  <div className="placeholder-content">
                    <span className="placeholder-icon">🎨</span>
                    <p className="placeholder-text">Vision Board</p>
                  </div>
                )}
              </div>
              <div className="board-label">
                <p className="board-name">{board.name}</p>
                <button 
                  className="delete-btn"
                  onClick={(e) => handleDeleteBoard(board._id, e)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <button className="fab" onClick={handleNewBoard}>
        <span className="fab-icon">+</span>
      </button>

      {/* Background Decorations */}
      <div className="bg-decoration circle bg-circle-1"></div>
      <div className="bg-decoration circle bg-circle-2"></div>
      <div className="bg-decoration circle bg-circle-3"></div>
      <div className="bg-decoration circle bg-circle-4"></div>
      <div className="bg-decoration circle bg-circle-5"></div>
      <div className="bg-decoration star bg-star-1">⭐</div>
      <div className="bg-decoration star bg-star-2">⭐</div>
      <div className="bg-decoration star bg-star-3">⭐</div>
      <div className="bg-decoration heart bg-heart-1">❤️</div>
      <div className="bg-decoration heart bg-heart-2">❤️</div>
    </div>
  );
}

export default MyBoards;
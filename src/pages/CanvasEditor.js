import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as fabric from 'fabric';
import { searchImages, createBoard, updateBoard, getBoard } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import '../styles/CanvasEditor.css';

function CanvasEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  const [activeTab, setActiveTab] = useState('text');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [selectedColor, setSelectedColor] = useState('#FF69B4');
  const [fontSize, setFontSize] = useState(24);
  const [boardName, setBoardName] = useState('My Vision Board');
  const [isSaving, setIsSaving] = useState(false);
  const [currentBoardId, setCurrentBoardId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [showGrid, setShowGrid] = useState(false);

// Initialize canvas
useEffect(() => {
  if (canvasRef.current && !fabricCanvasRef.current) {
    // Set canvas element size first
    canvasRef.current.width = 800;
    canvasRef.current.height = 800;
    
    fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 800,
      backgroundColor: '#ffffff',
    });

    // Add placeholder text
    const placeholderText = new fabric.IText('Drag images here to start! ✨', {
      left: 400,
      top: 400,
      fontSize: 24,
      fill: '#cccccc',
      fontFamily: 'Arial',
      originX: 'center',
      originY: 'center',
      selectable: false,
    });
    fabricCanvasRef.current.add(placeholderText);

    // Initial history state
    setTimeout(() => {
      if (fabricCanvasRef.current) {
        const initialState = fabricCanvasRef.current.toJSON();
        setHistory([initialState]);
        setHistoryStep(0);
      }
    }, 100);
  }

  return () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }
  };
}, []);

  // Load board if boardId is in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const boardId = params.get('boardId');
    
    if (boardId && fabricCanvasRef.current) {
      loadBoard(boardId);
    }
  }, [location.search]);

  const loadBoard = async (boardId) => {
    try {
      const response = await getBoard(boardId);
      const board = response.data;
      
      // Set board name
      setBoardName(board.name);
      
      // Set current board ID
      setCurrentBoardId(board._id);
      
      // Load canvas data
      if (board.canvasData && fabricCanvasRef.current) {
        // Clear canvas first
        fabricCanvasRef.current.clear();
        
        // Load with proper image handling
        fabricCanvasRef.current.loadFromJSON(board.canvasData, () => {
          fabricCanvasRef.current.renderAll();
          
          // Force re-render all images
          const objects = fabricCanvasRef.current.getObjects();
          objects.forEach(obj => {
            if (obj.type === 'image') {
              obj.set({ dirty: true });
            }
          });
          fabricCanvasRef.current.renderAll();
        }, (o, object) => {
          // This callback is called for each object
          if (o.type === 'image') {
            // Ensure crossOrigin is set
            object.crossOrigin = 'anonymous';
          }
        });
      }
      
      console.log('Board loaded:', board);
    } catch (error) {
      console.error('Error loading board:', error);
      alert('Failed to load board');
    }
  };

  // Search for images
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If no search query, show mock data for testing
      const mockResults = [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
        'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400',
        'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400',
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400',
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
      ];
      setSearchResults(mockResults);
      return;
    }
    
    try {
      const response = await searchImages(searchQuery);
      const images = response.data.map(img => img.url);
      setSearchResults(images);
    } catch (error) {
      console.error('Error searching images:', error);
      
      // Fallback to mock Unsplash images if API fails
      const mockResults = [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
        'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400',
      ];
      setSearchResults(mockResults);
      alert('Using demo images. Backend might not be running.');
    }
  };

  // Add image to canvas
  const addImageToCanvas = (imageUrl) => {
    if (!fabricCanvasRef.current) return;

    // Create a temporary image element to handle CORS
    const imgElement = new Image();
    imgElement.crossOrigin = 'anonymous';
    
    imgElement.onload = () => {
      fabric.FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
        // Scale image to fit nicely on canvas
        const maxWidth = 300;
        const maxHeight = 300;
        
        if (img.width > maxWidth || img.height > maxHeight) {
          const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
          img.scale(scale);
        }
        
        img.set({
          left: Math.random() * 400 + 100,
          top: Math.random() * 400 + 100,
        });
        
        fabricCanvasRef.current.add(img);
        fabricCanvasRef.current.setActiveObject(img);
        fabricCanvasRef.current.renderAll();
      }).catch((error) => {
        console.error('Error loading image:', error);
        alert('Failed to load image. Try another one!');
      });
    };
    
    imgElement.onerror = () => {
      console.error('Failed to load image from:', imageUrl);
      alert('Could not load this image. Try searching for different images!');
    };
    
    imgElement.src = imageUrl;
  };

  // Add text to canvas
  const addTextToCanvas = () => {
    if (!fabricCanvasRef.current) return;

    const text = new fabric.IText('Double click to edit', {
      left: 400,
      top: 400,
      fontSize: fontSize,
      fill: selectedColor,
      fontFamily: selectedFont,
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  };

  // Add sticker to canvas
  const addStickerToCanvas = (emoji) => {
    if (!fabricCanvasRef.current) return;

    const sticker = new fabric.IText(emoji, {
      left: Math.random() * 600 + 100,
      top: Math.random() * 600 + 100,
      fontSize: 60,
    });

    fabricCanvasRef.current.add(sticker);
    fabricCanvasRef.current.renderAll();
  };

  // Save current state to history
const saveToHistory = () => {
  if (!fabricCanvasRef.current) return;
  
  const json = fabricCanvasRef.current.toJSON();
  
  setHistory(prevHistory => {
    const newHistory = prevHistory.slice(0, historyStep + 1);
    newHistory.push(json);
    setHistoryStep(newHistory.length - 1);
    return newHistory;
  });
};

// Undo
const handleUndo = () => {
  if (historyStep > 0 && history.length > 0) {
    const previousState = history[historyStep - 1];
    if (previousState) {
      fabricCanvasRef.current.loadFromJSON(previousState, () => {
        fabricCanvasRef.current.renderAll();
        setHistoryStep(historyStep - 1);
      });
    }
  } else {
    alert('Nothing to undo!');
  }
};

// Redo
const handleRedo = () => {
  if (historyStep < history.length - 1 && history.length > 0) {
    const nextState = history[historyStep + 1];
    if (nextState) {
      fabricCanvasRef.current.loadFromJSON(nextState, () => {
        fabricCanvasRef.current.renderAll();
        setHistoryStep(historyStep + 1);
      });
    }
  } else {
    alert('Nothing to redo!');
  }
};

// Delete selected object
const deleteSelected = () => {
  if (!fabricCanvasRef.current) return;

  const activeObject = fabricCanvasRef.current.getActiveObject();
  if (activeObject) {
    fabricCanvasRef.current.remove(activeObject);
    fabricCanvasRef.current.renderAll();
    saveToHistory();
  } else {
    alert('Please select an object first!');
  }
};

// Bring Forward
const bringForward = () => {
  if (!fabricCanvasRef.current) return;
  const activeObject = fabricCanvasRef.current.getActiveObject();
  if (activeObject) {
    fabricCanvasRef.current.bringObjectForward(activeObject);
    fabricCanvasRef.current.renderAll();
    saveToHistory();
  } else {
    alert('Please select an object first!');
  }
};

// Send Backward
const sendBackward = () => {
  if (!fabricCanvasRef.current) return;
  const activeObject = fabricCanvasRef.current.getActiveObject();
  if (activeObject) {
    fabricCanvasRef.current.sendObjectBackwards(activeObject);
    fabricCanvasRef.current.renderAll();
    saveToHistory();
  } else {
    alert('Please select an object first!');
  }
};

// Toggle Grid
const toggleGrid = () => {
  if (!fabricCanvasRef.current) return;
  
  setShowGrid(!showGrid);
  
  if (!showGrid) {
    // Add grid
    const gridSize = 50;
    const canvasWidth = 800;
    const canvasHeight = 800;
    
    for (let i = 0; i < (canvasWidth / gridSize); i++) {
      // Vertical lines
      const lineV = new fabric.Line(
        [i * gridSize, 0, i * gridSize, canvasHeight],
        {
          stroke: '#ccc',
          strokeWidth: 1,
          selectable: false,
          evented: false,
          id: 'grid-line'
        }
      );
      fabricCanvasRef.current.add(lineV);
      fabricCanvasRef.current.sendObjectToBack(lineV);
      
      // Horizontal lines
      const lineH = new fabric.Line(
        [0, i * gridSize, canvasWidth, i * gridSize],
        {
          stroke: '#ccc',
          strokeWidth: 1,
          selectable: false,
          evented: false,
          id: 'grid-line'
        }
      );
      fabricCanvasRef.current.add(lineH);
      fabricCanvasRef.current.sendObjectToBack(lineH);
    }
    fabricCanvasRef.current.renderAll();
  } else {
    // Remove grid
    const objects = fabricCanvasRef.current.getObjects();
    const gridLines = objects.filter(obj => obj.id === 'grid-line');
    gridLines.forEach(line => {
      fabricCanvasRef.current.remove(line);
    });
    fabricCanvasRef.current.renderAll();
  }
};

// Zoom In
const zoomIn = () => {
  if (!fabricCanvasRef.current) return;
  const currentZoom = fabricCanvasRef.current.getZoom();
  fabricCanvasRef.current.setZoom(currentZoom * 1.1);
  fabricCanvasRef.current.renderAll();
};

// Zoom Out
const zoomOut = () => {
  if (!fabricCanvasRef.current) return;
  const currentZoom = fabricCanvasRef.current.getZoom();
  fabricCanvasRef.current.setZoom(currentZoom * 0.9);
  fabricCanvasRef.current.renderAll();
};

  // Save board to MongoDB
  const handleSave = async () => {
    if (!fabricCanvasRef.current) return;

    setIsSaving(true);

    try {
      // Get canvas data as JSON
      const canvasData = fabricCanvasRef.current.toJSON();
      
      // Generate thumbnail
      const thumbnail = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 0.5,
        multiplier: 0.2,
      });

      const boardData = {
        name: boardName,
        thumbnail: thumbnail,
        canvasData: canvasData,
      };

      let response;
      
      if (currentBoardId) {
        // Update existing board
        response = await updateBoard(currentBoardId, boardData);
        alert('✅ Board updated!');
      } else {
        // Create new board
        response = await createBoard(boardData);
        setCurrentBoardId(response.data._id);
        alert('✅ Board saved!');
      }
      
      console.log('Saved board:', response.data);
      
    } catch (error) {
      console.error('Error saving board:', error);
      alert('❌ Failed to save board: ' + (error.response?.data?.msg || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  // Export canvas as image
  const handleExport = () => {
    if (!fabricCanvasRef.current) return;

    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
    });

    const link = document.createElement('a');
    link.download = 'my-vision-board.png';
    link.href = dataURL;
    link.click();

    alert('✅ Vision board exported!');
  };

  const stickers = ['⭐', '❤️', '✨', '😊', '🌸', '☁️', '🌈', '☀️', '🌙', '🔥', '💎', '👑'];

  return (
    <div className="canvas-editor-page">
      {/* Top Navigation */}
      <nav className="navbar">
        <div className="nav-logo" onClick={() => navigate('/boards')}>
          Vision Board
        </div>
        
        <input 
          type="text"
          className="board-name-input"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          placeholder="Board name..."
        />
        
        <div className="nav-buttons">
          <button className="save-btn" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button className="export-btn" onClick={handleExport}>
            Export
          </button>
        </div>
      </nav>

      <div className="editor-container">
        {/* Left Sidebar - Image Search */}
        <aside className="left-sidebar">
          <h2 className="sidebar-title">Search Images</h2>
          
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search for inspiration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch}>
              🔍
            </button>
          </div>

          <div className="quick-search-buttons">
            <button onClick={() => { setSearchQuery('All'); handleSearch(); }}>All</button>
            <button onClick={() => { setSearchQuery('Nature'); handleSearch(); }}>Nature</button>
            <button onClick={() => { setSearchQuery('Fashion'); handleSearch(); }}>Fashion</button>
            <button onClick={() => { setSearchQuery('Quotes'); handleSearch(); }}>Quotes</button>
          </div>

          <div className="search-results">
            {searchResults.length === 0 ? (
              <p className="no-results">Search for images to get started!</p>
            ) : (
              searchResults.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Result ${index + 1}`}
                  className="result-image"
                  onClick={() => addImageToCanvas(imageUrl)}
                />
              ))
            )}
          </div>
        </aside>

        {/* Center Canvas */}
        <main className="canvas-area">
          <canvas ref={canvasRef} width="800" height="800" />
        </main>

        {/* Right Sidebar - Tools */}
        <aside className="right-sidebar">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'text' ? 'active' : ''}`}
              onClick={() => setActiveTab('text')}
            >
              Text
            </button>
            <button
              className={`tab ${activeTab === 'stickers' ? 'active' : ''}`}
              onClick={() => setActiveTab('stickers')}
            >
              Stickers
            </button>
            <button
              className={`tab ${activeTab === 'filters' ? 'active' : ''}`}
              onClick={() => setActiveTab('filters')}
            >
              Filters
            </button>
          </div>

          <div className="tools-panel">
            {activeTab === 'text' && (
              <div className="text-tools">
                <div className="tool-group">
                  <label>Font</label>
                  <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)}>
                    <option value="Arial">Arial</option>
                    <option value="Impact">Impact</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Comic Sans MS">Comic Sans</option>
                  </select>
                </div>

                <div className="tool-group">
                  <label>Size</label>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                  />
                  <span className="size-value">{fontSize}px</span>
                </div>

                <div className="tool-group">
                  <label>Color</label>
                  <div className="color-swatches">
                    {['#FF69B4', '#FFD700', '#40E0D0', '#9370DB', '#FF6347', '#2C3E50', '#FFFFFF', '#000000'].map(color => (
                      <div
                        key={color}
                        className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <button className="add-text-btn" onClick={addTextToCanvas}>
                  + Add Text
                </button>
              </div>
            )}

            {activeTab === 'stickers' && (
              <div className="sticker-grid">
                {stickers.map((emoji, index) => (
                  <div
                    key={index}
                    className="sticker-item"
                    onClick={() => addStickerToCanvas(emoji)}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'filters' && (
              <div className="filters-panel">
                <p className="coming-soon">Filters coming soon! ✨</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom Toolbar */}
      <div className="bottom-toolbar">
        <button className="toolbar-btn" onClick={handleUndo} title="Undo">↶</button>
        <button className="toolbar-btn" onClick={handleRedo} title="Redo">↷</button>
        <button className="toolbar-btn" onClick={deleteSelected} title="Delete">🗑️</button>
        <button className="toolbar-btn" onClick={bringForward} title="Bring Forward">⬆️</button>
        <button className="toolbar-btn" onClick={sendBackward} title="Send Backward">⬇️</button>
        <button className="toolbar-btn" onClick={toggleGrid} title="Toggle Grid">#</button>
        <button className="toolbar-btn" onClick={zoomIn} title="Zoom In">🔍+</button>
        <button className="toolbar-btn" onClick={zoomOut} title="Zoom Out">🔍-</button>
      </div>
    </div>
  );
}

export default CanvasEditor;
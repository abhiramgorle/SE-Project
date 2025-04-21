import React from 'react';
import { cx } from '@linaria/core';
import './FloatingActions.css'; // We'll create this CSS file

const FloatingActions = ({ onDrawClick, onClearClick }) => {
  return (
    <div className="floating-actions-container">
      <div className="tooltip-wrapper">
        <button 
          className="action-button content-btn" 
          onClick={() => window.location.replace("http://localhost:5173/")}
          aria-label="Content"
        >
          <i className="fas fa-user-circle"></i>
        </button>
        <div className="tooltip">Content</div>
      </div>
      <div className="tooltip-wrapper">
        <button 
          className="action-button draw-btn" 
          onClick={onDrawClick}
          aria-label="Draw search area"
        >
          <i className="fas fa-draw-polygon"></i>
        </button>
        <div className="tooltip">Draw Area</div>
      </div>
      
      <div className="tooltip-wrapper">
        <button 
          className="action-button clear-btn" 
          onClick={onClearClick}
          aria-label="Clear map"
        >
          <i className="fas fa-trash-alt"></i>
        </button>
        <div className="tooltip">Clear All</div>
      </div>
    </div>
  );
};

export default FloatingActions;
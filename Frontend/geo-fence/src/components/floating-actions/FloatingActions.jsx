import PropTypes from 'prop-types';
import './FloatingActions.css';

const FloatingActions = ({ onDrawClick, onClearClick }) => (
  <div className="floating-actions">
    <button type="button" className="action-btn draw-btn" aria-label="Draw" data-tooltip="Draw" onClick={onDrawClick}>
    <i class="fa-solid fa-draw-polygon"></i>
    </button>
    <button type="button" className="action-btn clear-btn" aria-label="Clear" data-tooltip="Clear" onClick={onClearClick}>
      <i className="fa-solid fa-undo" />
    </button>
    <button type="button" className="action-btn" aria-hidden="true" />
  </div>
);

FloatingActions.propTypes = {
  onDrawClick: PropTypes.func.isRequired,
  onClearClick: PropTypes.func.isRequired,
};

export default FloatingActions;

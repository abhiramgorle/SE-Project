import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { cx } from '@linaria/core';
import { CSSTransition } from 'react-transition-group';
import './Sidebar.css';

const Sidebar = forwardRef((_, ref) => {
  const [isOpen, setOpen] = useState(false);
  const animatedRef = useRef(null);
  const contentRef = useRef(null);

  const openSidebar = useCallback(() => {
    setOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setOpen(false);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      open() {
        openSidebar();
      },
      close() {
        closeSidebar();
      },
      getContentRef() {
        return contentRef;
      },
    }),
    [openSidebar, closeSidebar]
  );

  return (
    <>
      <button
        type="button"
        className={cx(
          'sidebar-open-btn',
          'animate__animated',
          'animate__slideInLeft',
          'animate__faster'
        )}
        title="Directions"
        onClick={openSidebar}
        aria-label="Open directions"
      >
        <i className="fas fa-directions"></i>
      </button>
      
      <CSSTransition
        nodeRef={animatedRef}
        in={isOpen}
        classNames={{
          enter: 'd-block',
          enterActive: 'animate__animated animate__slideInLeft animate__faster',
          exit: 'd-block',
          exitActive: 'animate__animated animate__slideOutLeft animate__faster',
        }}
        timeout={500}
        unmountOnExit
      >
        <div ref={animatedRef} className="sidebar-container">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Directions</h2>
            <button 
              type="button" 
              className="sidebar-close-btn" 
              onClick={closeSidebar} 
              aria-label="Close sidebar"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div ref={contentRef} className="sidebar-content">
            <div className="sidebar-empty-state">
              <i className="fas fa-directions"></i>
              <p>Select a place and route to display directions</p>
              <small>First select a place, then click "Show Route" to see turn-by-turn directions</small>
            </div>
          </div>
        </div>
      </CSSTransition>
    </>
  );
});

export default Sidebar;
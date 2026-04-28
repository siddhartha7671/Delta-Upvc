import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const TaskActionMenu = ({ onEdit, onDelete, onCancel, onShare, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <StyledWrapper ref={menuRef}>
      <div className="card">
        <ul className="list">
          <li className="element" onClick={() => { onShare(); onClose(); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7e8590" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            <p className="label">Share Log</p>
          </li>
          <li className="element" onClick={() => { onEdit(); onClose(); }}>
            <svg className="lucide lucide-pencil" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#7e8590" fill="none" viewBox="0 0 24 24" height={25} width={25} xmlns="http://www.w3.org/2000/svg">
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
              <path d="m15 5 4 4" />
            </svg>
            <p className="label">Edit Task</p>
          </li>
          <li className="element delete" onClick={() => { onDelete(); onClose(); }}>
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#7e8590" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1={10} x2={10} y1={11} y2={17} />
              <line x1={14} x2={14} y1={11} y2={17} />
            </svg>
            <p className="label">Delete Task</p>
          </li>
          <li className="element cancel" onClick={() => { onCancel(); onClose(); }}>
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#7e8590" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-circle">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p className="label">Cancel Task</p>
          </li>
        </ul>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  border-radius: 10px;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .card {
    width: 200px;
    background-color: rgb(255, 255, 255);
    background-image: linear-gradient(
      139deg,
      rgb(255, 255, 255) 0%,
      rgb(255, 255, 255) 50%,
      rgb(255, 255, 255) 100%
    );

    border-radius: 10px;
    padding: 15px 0px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border: 1px solid #e5e7eb;
  }

  .card .separator {
    border-top: 1.5px solid #e5e7eb;
    margin: 0 10px;
  }

  .card .list {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0px 10px;
    margin: 0;
  }

  .card .list .element {
    display: flex;
    align-items: center;
    color: #141414;
    gap: 10px;
    transition: all 0.3s ease-out;
    padding: 8px 7px;
    border-radius: 6px;
    cursor: pointer;
  }

  .card .list .element svg {
    width: 19px;
    height: 19px;
    transition: all 0.3s ease-out;
  }

  .card .list .element .label {
    font-weight: 600;
    margin: 0;
    font-size: 0.9rem;
  }

  .card .list .element:hover {
    background-color: #10b981;
    color: #fff;
    transform: translate(1px, -1px);
  }
  
  .card .list .element:hover svg {
    stroke: #fff;
  }

  .card .list .delete:hover {
    background-color: #ef4444;
  }
  
  .card .list .cancel:hover {
    background-color: #f59e0b;
  }

  .card .list .element:active {
    transform: scale(0.99);
  }
`;

export default TaskActionMenu;

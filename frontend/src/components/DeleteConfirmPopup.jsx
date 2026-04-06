import React from 'react';
import styled from 'styled-components';

const DeleteConfirmPopup = ({ onConfirm, onCancel, title = "Delete file?", description = "Are you sure you want to delete this log? This action cannot be undone." }) => {
  return (
    <ModalOverlay>
      <StyledWrapper>
        <div className="card">
          <div className="card-content">
            <p className="card-heading">{title}</p>
            <p className="card-description">{description}</p>
          </div>
          <div className="card-button-wrapper">
            <button className="card-button secondary" onClick={onCancel}>Cancel</button>
            <button className="card-button primary" onClick={onConfirm}>Delete</button>
          </div>
          <button className="exit-button" onClick={onCancel}>
            <svg height="20px" viewBox="0 0 384 512">
              <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
            </svg>
          </button>
        </div>
      </StyledWrapper>
    </ModalOverlay>
  );
}

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.2s ease;
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

const StyledWrapper = styled.div`
  .card {
    width: 320px;
    height: fit-content;
    background: rgb(255, 255, 255);
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 40px 30px 30px 30px;
    position: relative;
    box-shadow: 20px 20px 30px rgba(0, 0, 0, 0.068);
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @keyframes popIn { 
    from { transform: scale(0.8); opacity: 0; } 
    to { transform: scale(1); opacity: 1; } 
  }

  .card-content {
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  .card-heading {
    font-size: 20px;
    font-weight: 700;
    color: rgb(27, 27, 27);
    margin: 0;
  }
  .card-description {
    font-size: 0.9rem;
    font-weight: 400;
    color: rgb(102, 102, 102);
    line-height: 1.5;
    margin: 0;
  }
  .card-button-wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
  }
  .card-button {
    width: 50%;
    height: 40px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
  }
  .primary {
    background-color: rgb(255, 114, 109);
    color: white;
  }
  .primary:hover {
    background-color: rgb(255, 73, 66);
    transform: translateY(-2px);
  }
  .secondary {
    background-color: #f3f4f6;
    color: #4b5563;
  }
  .secondary:hover {
    background-color: #e5e7eb;
    transform: translateY(-2px);
  }
  .exit-button {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background-color: transparent;
    position: absolute;
    top: 20px;
    right: 20px;
    cursor: pointer;
    padding: 5px;
  }
  .exit-button:hover svg {
    fill: black;
  }
  .exit-button svg {
    fill: rgb(175, 175, 175);
    transition: fill 0.2s;
  }
`;

export default DeleteConfirmPopup;

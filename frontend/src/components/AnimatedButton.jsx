import React from 'react';
import styled from 'styled-components';

const AnimatedButton = ({ text, onClick, className, iconDirection = "right" }) => {
  return (
    <StyledButton className={`animated-button ${className}`} onClick={onClick} $iconDirection={iconDirection}>
      <svg xmlns="http://www.w3.org/2000/svg" className="arr-2" viewBox="0 0 24 24">
        <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
      </svg>
      <span className="text">{text}</span>
      <span className="circle" />
      <svg xmlns="http://www.w3.org/2000/svg" className="arr-1" viewBox="0 0 24 24">
        <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
      </svg>
    </StyledButton>
  );
};

const StyledButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 36px;
  border: 2px solid transparent;
  font-size: 14px;
  background-color: transparent;
  border-radius: 100px;
  font-weight: 700;
  color: #10b981;
  box-shadow: 0 0 0 1.5px #10b981;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  text-transform: uppercase;
  letter-spacing: 1px;
  width: fit-content;

  svg {
    position: absolute;
    width: 18px;
    fill: #10b981;
    z-index: 9;
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
    transform: ${props => props.$iconDirection === 'left' ? 'rotate(180deg)' : 'none'};
  }

  .arr-1 { 
    right: 16px; 
  }

  .arr-2 { 
    left: -25%; 
  }

  .circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background-color: #10b981;
    border-radius: 50%;
    opacity: 0;
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .text {
    position: relative;
    z-index: 10;
    transform: translateX(-12px);
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  }

  &:hover {
    box-shadow: 0 0 0 12px transparent;
    color: #ffffff;
    border-radius: 12px;
  }

  &:hover .arr-1 { right: -25%; }
  &:hover .arr-2 { left: 16px; }
  &:hover .text { transform: translateX(12px); }
  &:hover svg { fill: #ffffff; }
  &:hover .circle {
    width: 500px;
    height: 500px;
    opacity: 1;
  }

  &:active {
    scale: 0.95;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3);
  }
`;

export default AnimatedButton;

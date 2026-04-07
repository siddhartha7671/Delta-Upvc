import React from 'react';
import styled from 'styled-components';
import AnimatedButton from './AnimatedButton';

const Card = ({ services, onSelect }) => {
  return (
    <StyledWrapper>
      <div className="container-items">
        {services.map((service, index) => (
          <button 
            key={index} 
            className="item-color" 
            style={{ "--color": service.color }} 
            aria-label={`Explore ${service.title}`}
            onClick={() => onSelect(service)}
          >
            <div className="card-content">
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
              <div className="btn-wrapper">
                <AnimatedButton text="E N T R Y" className="card-btn" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 4.5rem 0;

  @keyframes cardPopup {
    0% { transform: scale(0.6) translateY(100px); opacity: 0; }
    70% { transform: scale(1.08) translateY(-10px); opacity: 1; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }

  .container-items {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 40px; 
    max-width: 1280px;
    padding: 40px;
    width: 100%;
    justify-items: center;

    @media (max-width: 1200px) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: 650px) {
      grid-template-columns: 1fr;
    }
  }

  .item-color {
    position: relative;
    flex-shrink: 0;
    width: 100%;
    max-width: 320px;
    height: 420px;
    margin-bottom: 0px;
    border: none;
    outline: none;
    background: transparent;
    cursor: pointer;
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    will-change: transform;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    overflow: visible;
    display: flex;
    flex-direction: column;
    animation: cardPopup 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards;

    ${[...Array(6)].map((_, i) => `
      &:nth-child(${i + 1}) { animation-delay: ${i * 0.15}s; }
    `).join('')}

    &::after {
      position: absolute;
      content: "";
      inset: 0;
      width: 100%;
      height: 100%;
      background-color: #ffffff;
      border: 3px solid var(--color);
      border-radius: 24px;
      transform: scale(1);
      pointer-events: none;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 10px 40px rgba(16, 185, 129, 0.08);
      z-index: -1; 
      will-change: transform, box-shadow;
      backface-visibility: hidden;
    }

    /* Glass Shine Effect on Popup */
    &::before {
      position: absolute;
      content: "";
      top: -150%;
      left: -150%;
      width: 300%;
      height: 300%;
      background: linear-gradient(135deg, 
        rgba(255,255,255,0) 0%, 
        rgba(255,255,255,0.4) 50%, 
        rgba(255,255,255,0) 100%);
      transform: rotate(45deg);
      transition: all 0.7s ease;
      z-index: 1;
      pointer-events: none;
      opacity: 0;
    }

    .card-content {
      position: relative;
      z-index: 2;
      padding: 1.8rem;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      color: #064e3b;
      text-align: left;
      opacity: 1;
      transition: 0.3s ease;
    }

    .card-content h3 {
      color: #059669; 
      font-size: 1.4rem;
      margin-top: 0.5rem;
      margin-bottom: 0.8rem;
      line-height: 1.25;
      font-weight: 800;
      word-wrap: break-word;
    }

    .card-content p {
      color: #047857; 
      font-size: 0.95rem; 
      line-height: 1.5;
      margin-bottom: 1.5rem;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: visible; 
    }

    .btn-wrapper {
        margin-top: auto;
    }

    /* Tooltip */
    &::before {
      position: absolute;
      content: "View Product Detail";
      left: 50%;
      bottom: -45px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      transform: translateX(-50%);
      padding: 6px 14px;
      background-color: #059669;
      color: #ffffff;
      border-radius: 6px;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: 0.3s ease-out;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
      white-space: nowrap;
      z-index: 999999;
    }

    &:hover {
      transform: translate3d(0, -25px, 80px) scale(1.08);
      z-index: 20;

      &::after {
        box-shadow: 0 30px 60px rgba(16, 185, 129, 0.25);
        transform: scale(1.04);
        background: #ffffff;
      }

      &::before {
        top: 150%;
        left: 150%;
        opacity: 1;
      }
    }
  }

  .item-color:hover + .item-color {
    transform: translate3d(20px, 0, -40px) scale(0.92);
  }

  .item-color:has(+ .item-color:hover) {
    transform: translate3d(-20px, 0, -40px) scale(0.92);
  }

  /* Override internal hover for the generic component when inside a card hover */
  .item-color:hover .card-btn {
     box-shadow: 0 0 0 12px transparent;
     color: #ffffff;
     border-radius: 12px;

     .arr-1 { right: -25%; }
     .arr-2 { left: 16px; }
     .text { transform: translateX(12px); }
     svg { fill: #ffffff; }
     .circle {
        width: 500px;
        height: 500px;
        opacity: 1;
     }
  }
`;

export default Card;

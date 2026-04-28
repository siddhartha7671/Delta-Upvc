import React from 'react';
import styled from 'styled-components';

const TaskDetailView = ({ task, onBack }) => {
  if (!task) return null;

  let steps = [
    { title: "Order Placed", status: "Completed", key: "Pending" },
    { title: "Processing", status: "In Progress", key: "Processing" },
    { title: "Delivered", status: "Pending", key: "Delivered" },
  ];

  if (task.status === "Cancelled") {
    steps = [
      { title: "Order Placed", status: "Completed", key: "Pending" },
      { title: "Cancelled", status: "Terminated", key: "Cancelled" }
    ];
  }

  // Determine current step index based on task status
  const getStatusIndex = (status) => {
    if (status === "Delivered") return 2;
    if (status === "Processing" || status === "Cancelled") return 1;
    return 0; // Pending
  };

  const currentIndex = getStatusIndex(task.status);

  const handleShare = async () => {
    const customer = (task.deadline || "").split(' - ')[0] || "N/A";
    const phone = (task.deadline || "").split(' - ')[1] || "N/A";
    const locLink = task.location ? `\n*Location*: https://www.google.com/maps?q=${task.location.lat},${task.location.lng}` : '';
    const shareText = `*Delta UPVC - Site Visit Log*\n\n*Customer*: ${customer}\n*Phone*: ${phone}\n*Task Details*: ${task.task}\n*Status*: ${task.status}\n*Assigned to*: @${task.assignee}\n*Submission Date*: ${task.submission_date}${locLink}\n\n*System*: Delta UPVC Enterprise Portal`;

    let filesArray = [];
    const photos = task.site_photos || (task.site_photo ? [task.site_photo] : []);
    
    if (photos.length > 0) {
      try {
        for (let i = 0; i < photos.length; i++) {
          const base64Data = photos[i];
          if (base64Data && base64Data.startsWith('data:image')) {
            const arr = base64Data.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while(n--){
              u8arr[n] = bstr.charCodeAt(n);
            }
            const file = new File([u8arr], `site_photo_${i+1}.jpg`, {type: mime});
            filesArray.push(file);
          }
        }
      } catch (e) {
        console.error("Error processing images for share", e);
      }
    }

    if (navigator.share) {
      try {
        const shareData = {
          title: 'Delta UPVC Visit Log',
          text: shareText
        };
        
        if (filesArray.length > 0 && navigator.canShare && navigator.canShare({ files: filesArray })) {
          shareData.files = filesArray;
        }
        
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Log details copied to clipboard!");
    }
  };

  return (
    <Container>
      <header className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to list
        </button>
        <h1>Task Activity Detail</h1>
        <button className="share-btn" onClick={handleShare} style={{ marginLeft: 'auto' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Share Log
        </button>
      </header>

      <ContentGrid>
        <div className="info-card">
          <div className="card-section">
            <label>Customer Name</label>
            <p>{(task.deadline || "").split(' - ')[0] || "N/A"}</p>
          </div>
          <div className="card-section">
            <label>Contact Phone</label>
            <p>{(task.deadline || "").split(' - ')[1] || "N/A"}</p>
          </div>

          <div className="card-section">
            <label>Activity Description</label>
            <p className="bold-desc">{task.task}</p>
          </div>
          
          {task.status === 'Cancelled' && task.cancel_reason && (
            <div className="card-section">
              <label>Cancellation Reason</label>
              <p className="bold-desc" style={{ color: '#ef4444' }}>{task.cancel_reason}</p>
            </div>
          )}

          
          {(task.site_photos || task.site_photo) && (
            <div className="card-section">
              <label>Site Proof (Mandatory Photos • {task.site_photos ? task.site_photos.length : 1} Captured)</label>
              <div className="site-photos-grid">
                {task.site_photos ? (
                  task.site_photos.map((img, idx) => (
                    <div className="site-image-container" key={idx}>
                      <img src={img} alt={`Site Visit ${idx + 1}`} />
                    </div>
                  ))
                ) : (
                  <div className="site-image-container">
                    <img src={task.site_photo} alt="Site Visit" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="card-section split">
            <div>
               <label>Assigned Staff</label>
               <p>@{task.assignee}</p>
            </div>
            <div>
               <label>Submission Date</label>
               <p>{task.submission_date}</p>
            </div>
          </div>

          {task.location && (
            <div className="card-section">
              <label>Verified Site Location (GPS)</label>
              <a 
                href={`https://www.google.com/maps?q=${task.location.lat},${task.location.lng}`} 
                target="_blank" 
                rel="noreferrer"
                className="loc-link"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                View Exact Site on Map
              </a>
            </div>
          )}
        </div>


        <StyledWrapper>
          <div className="stepper-box">
             <h3 style={{marginBottom: '1.5rem', fontSize: '1.1rem'}}>Track Progress</h3>
            {steps.map((step, index) => {
              const isCompleted = index < currentIndex;
              const isActive = index === currentIndex;
              const isPending = index > currentIndex;

              let statusText = step.status;
              if (isCompleted) statusText = "Completed";
              if (isActive) statusText = task.status === "Delivered" ? "Completed" : "In Progress";
              if (isPending) statusText = "Pending";

              let statusClass = isCompleted ? 'stepper-completed' : isActive ? 'stepper-active' : 'stepper-pending';
              if (isActive && task.status === 'Cancelled') {
                  statusClass = 'stepper-cancelled';
              }

              return (
                <div key={index} className={`stepper-step ${statusClass}`}>
                  <div className="stepper-circle">
                    {isCompleted || (isActive && task.status === "Delivered") ? (
                      <svg viewBox="0 0 16 16" className="bi bi-check-lg" fill="currentColor" height={16} width={16} xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                      </svg>
                    ) : (isActive && task.status === "Cancelled") ? (
                      <svg viewBox="0 0 16 16" fill="currentColor" height={16} width={16} xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                      </svg>
                    ) : (index + 1)}
                  </div>
                  <div className="stepper-line" />
                  <div className="stepper-content">
                    <div className="stepper-title">{step.title}</div>
                    <div className="stepper-status">{statusText}</div>
                    <div className="stepper-time">
                        {isActive && task.status === "Cancelled" ? "Terminated" : isActive ? "Currently Active" : isCompleted ? "Processed" : "Awaiting Action"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </StyledWrapper>
      </ContentGrid>
    </Container>
  );
}

const Container = styled.div`
  padding: 1rem;
  animation: slideUp 0.4s ease-out;

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .detail-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    
    h1 { font-size: 1.5rem; color: #111827; }
    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #10b981;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      &:hover { background: #059669; }
    }
    
    .share-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f3f4f6;
      color: #111827;
      border: 1px solid #e5e7eb;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      &:hover { background: #e5e7eb; }
    }
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }

  .info-card {
    background: white;
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    .card-section {
      label { display: block; font-size: 0.8rem; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; margin-bottom: 0.4rem; }
      p { font-size: 1.1rem; color: #111827; font-weight: 500; }
      .bold-desc { font-size: 1.3rem; font-weight: 700; color: #059669; }
    }
    
    .split {
        display: flex;
        gap: 3rem;
    }
    
    .site-photos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .site-image-container {
      margin-top: 0.5rem;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      max-width: 400px;
      img { width: 100%; height: auto; display: block; transition: transform 0.3s; }
      &:hover img { transform: scale(1.02); }
    }

    .loc-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      background: #111827;
      color: white;
      padding: 0.6rem 1rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background 0.2s;
      svg { color: #10b981; }
      &:hover { background: #10b981; }
    }
  }
`;

const StyledWrapper = styled.div`
  .stepper-box {
    background-color: white;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .stepper-step {
    display: flex;
    margin-bottom: 32px;
    position: relative;
  }

  .stepper-step:last-child {
    margin-bottom: 0;
  }

  .stepper-line {
    position: absolute;
    left: 19px;
    top: 40px;
    bottom: -32px;
    width: 2px;
    background-color: #e2e8f0;
    z-index: 1;
  }

  .stepper-step:last-child .stepper-line {
    display: none;
  }

  .stepper-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    z-index: 2;
    font-weight: bold;
    transition: all 0.3s;
  }

  .stepper-completed .stepper-circle {
    background-color: #10b981;
    color: white;
  }

  .stepper-active .stepper-circle {
    border: 2px solid #10b981;
    color: #10b981;
    box-shadow: 0 0 0 4px #ecfdf5;
  }

  .stepper-pending .stepper-circle {
    border: 2px solid #e2e8f0;
    color: #94a3b8;
  }

  .stepper-cancelled .stepper-circle {
    border: 2px solid #ef4444;
    color: #ef4444;
    box-shadow: 0 0 0 4px #fef2f2;
  }

  .stepper-content {
    flex: 1;
  }

  .stepper-title {
    font-weight: 600;
    margin-bottom: 4px;
    font-size: 1rem;
  }

  .stepper-completed .stepper-title { color: #111827; }
  .stepper-active .stepper-title { color: #10b981; }
  .stepper-pending .stepper-title { color: #94a3b8; }
  .stepper-cancelled .stepper-title { color: #ef4444; }

  .stepper-status {
    font-size: 13px;
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    margin-top: 4px;
    font-weight: 500;
  }

  .stepper-completed .stepper-status {
    background-color: #dcfce7;
    color: #166534;
  }

  .stepper-active .stepper-status {
    background-color: #dbeafe;
    color: #1d4ed8;
  }

  .stepper-pending .stepper-status {
    background-color: #f1f5f9;
    color: #64748b;
  }

  .stepper-cancelled .stepper-status {
    background-color: #fee2e2;
    color: #b91c1c;
  }

  .stepper-time {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 4px;
  }
`;

export default TaskDetailView;

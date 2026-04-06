import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import TaskActionMenu from './TaskActionMenu';
import DeleteConfirmPopup from './DeleteConfirmPopup';
import TaskDetailView from './TaskDetailView';
import EmployeeTracker from './EmployeeTracker';

// --- ICONS ---
const EyeIcon = ({ show }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {show ? (
      <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
    ) : (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
    )}
  </svg>
);

const StaffTracker = () => {
   const [locations, setLocations] = useState([]);
   
   useEffect(() => {
       fetch(`${API_BASE_URL}/admin/locations`)
         .then(r => r.json())
         .then(data => setLocations(data || []));
   }, []);

   return (
      <div className="tracker-view">
         <h1 style={{marginBottom:'2rem', fontSize:'1.8rem', color:'#111827'}}>Field Staff Locator</h1>
         <div className="staff-tracker-grid">
            {locations.length === 0 ? <p className="empty-txt">No staff signals found. Waiting for updates...</p> : locations.map((staff, i) => (
               <div key={i} className="staff-loc-card">
                  <div className="sl-avatar">{staff.name?.[0] || staff.username[0]}</div>
                  <div className="sl-info">
                     <h3>{staff.name || staff.username}</h3>
                     <p>Role: <strong>{staff.role}</strong></p>
                     <p className="last-seen">Last Seen: {new Date(staff.last_seen).toLocaleTimeString()}</p>
                  </div>
                  <a 
                     href={`https://www.google.com/maps?q=${staff.location?.lat},${staff.location?.lng}`} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="btn-gmaps"
                  >
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                     See on Google Maps
                  </a>
               </div>
            ))}
         </div>
      </div>
   );
};

const ToastPopup = ({ title, message, onClose }) => {
  return (
    <ToastPopupWrapper>
      <div className="toast-card z-50">
        <div className="toast-left">
          <div className="toast-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <div className="toast-content">
            <p className="toast-title">{title}</p>
            <p className="toast-desc">{message}</p>
          </div>
        </div>
        <button className="toast-close" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </ToastPopupWrapper>
  );
};

import { API_BASE_URL } from '../apiConfig';

const Dashboard = ({ user, onLogout, onHomeNav }) => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Navigation State
  const [currentView, setCurrentView] = useState('Overview'); // 'Overview', 'Analytics', 'Profile'
  const [selectedProfile, setSelectedProfile] = useState(null);
  
  const [chartMode, setChartMode] = useState('7Days'); // '7Days', 'Yearly', 'Custom'
  const [chartYear, setChartYear] = useState('2026');
  const [chartStartDate, setChartStartDate] = useState('');
  const [chartEndDate, setChartEndDate] = useState('');

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [passVisible, setPassVisible] = useState(false);
  
  // Task Logic States
  const [activeTaskMenu, setActiveTaskMenu] = useState(null); // task._id
  const [editingTask, setEditingTask] = useState(null); // Full task object
  const [itemToDelete, setItemToDelete] = useState(null); // task._id for confirmation
  const [focusedTask, setFocusedTask] = useState(null); // Task object to view details

  useEffect(() => {
    if (showAddTaskModal) {
      const today = new Date().toLocaleString('sv-SE').split(' ')[0];
      setSubmissionDate(today);
      setTaskCreatedDate(today);
    }
  }, [showAddTaskModal]);
  
  // User Form State
  const [editingUser, setEditingUser] = useState(null);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Employe');
  const [newGender, setNewGender] = useState('');
  const [newDob, setNewDob] = useState('');
  const [newProfilePic, setNewProfilePic] = useState('');

  // Site Tracking State
  const [siteName, setSiteName] = useState('');
  const [sitePhone, setSitePhone] = useState('');
  const [siteDesc, setSiteDesc] = useState('');
  const [submissionDate, setSubmissionDate] = useState('');
  const [taskCreatedDate, setTaskCreatedDate] = useState('');
  
  const [toast, setToast] = useState({ visible: false, title: "", message: "" });
  
  const showToast = (title, message) => {
    setToast({ visible: true, title, message });
    setTimeout(() => setToast({ visible: false, title: "", message: "" }), 3000);
  };

  useEffect(() => fetchData(), [user.role]);

  const fetchData = () => {
    fetch(`${API_BASE_URL}/admin/tasks`).then(r => r.json()).then(data => setTasks(data || []));
    fetch(`${API_BASE_URL}/admin/users`).then(r => r.json()).then(data => setUsers(data || []));
  };
  
  const fetchUserPoints = (uname) => {
    return tasks.filter(t => t.assignee === uname).reduce((acc, t) => {
      if(t.status === 'Processing') return acc + 10;
      if(t.status === 'Delivered') return acc + 20;
      return acc + 5;
    }, 0);
  };

  // Top Employee Calculation (Memoized for high performance rendering)
  const topEmp = useMemo(() => {
    if (!users || !tasks) return null;
    const activeEmps = users.filter(u => u.role !== 'CEO').map(u => ({ ...u, pts: tasks.filter(t => t.assignee === u.username).reduce((acc, t) => {
      if(t.status === 'Processing') return acc + 10;
      if(t.status === 'Delivered') return acc + 20;
      return acc + 5;
    }, 0) }));
    return activeEmps.reduce((prev, curr) => (prev && prev.pts > curr.pts) ? prev : curr, null);
  }, [users, tasks]);

  const calculateLevel = (pts) => Math.floor(pts / 70) + 1;
  const getProgress = (pts) => ((pts % 70) / 70) * 100;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if(file) {
      if(file.size > 8 * 1024 * 1024) {
        showToast("Error", "Image must be under 8MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setNewProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const me = users.find(u => u.username === (user.admin || user.username)) || {};
  const currentPoints = fetchUserPoints(me.username);
  
  const handleAddUser = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/admin/add_user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, phone: newPhone, email: newEmail, username: newUsername, password: newPassword, role: newRole, gender: newGender, dob: newDob, profile_pic: newProfilePic })
    }).then(r => r.json()).then(res => {
      if (res.status === 'success') { showToast("done successfully :)", `Data saved for ${newName}`); setShowAddUserModal(false); fetchData(); clearForm();
      } else showToast("Error", res.message);
    });
  };

  const handleAddSiteLog = (e) => {
    e.preventDefault();
    const isEdit = !!editingTask;
    const url = isEdit ? `${API_BASE_URL}/admin/edit_task` : `${API_BASE_URL}/admin/add_task`;
    const bodyData = { 
      task: siteDesc, 
      deadline: `${siteName} - ${sitePhone}`, 
      submission_date: submissionDate,
      created_at_date: taskCreatedDate 
    };
    
    if (isEdit) bodyData.task_id = editingTask._id;
    else bodyData.assignee = user.admin || user.username;

    fetch(url, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(bodyData)
    }).then(r => r.json()).then(res => {
       showToast("done successfully :)", res.message); 
       setShowAddTaskModal(false); 
       setEditingTask(null);
       fetchData();
       setSiteName(''); setSitePhone(''); setSiteDesc(''); setSubmissionDate(''); setTaskCreatedDate('');
    });
  };

  const handleEditTaskInit = (t) => {
    setEditingTask(t);
    const [name, phone] = (t.deadline || "").split(" - ");
    setSiteName(name || "");
    setSitePhone(phone || "");
    setSiteDesc(t.task || "");
    setSubmissionDate(t.submission_date || "");
    setTaskCreatedDate(t.created_at_date || "");
    setShowAddTaskModal(true);
  };

  const handleDeleteTask = (taskId) => {
    setItemToDelete(taskId);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    fetch(`${API_BASE_URL}/admin/delete_task`, {
       method: 'DELETE',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ task_id: itemToDelete })
    }).then(r => r.json()).then(res => {
       showToast("Removed", res.message);
       setItemToDelete(null);
       fetchData();
    });
  };

  const handleUpdateTaskStatus = (taskId, newStatus) => {
    fetch(`${API_BASE_URL}/admin/update_task_status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task_id: taskId, status: newStatus })
    }).then(r => r.json()).then(res => { if(res.status === 'success') fetchData(); });
  };

  const clearForm = () => {
    setNewName(''); setNewPhone(''); setNewEmail(''); setNewUsername(''); setNewPassword('');
    setNewRole('Employe'); setPassVisible(false); setNewGender(''); setNewDob(''); setNewProfilePic('');
  };

  const handleEditInit = (u) => {
    setEditingUser(u); setNewName(u.name || ''); setNewPhone(u.phone || ''); setNewEmail(u.email || ''); 
    setNewUsername(u.username); setNewPassword(''); setNewRole(u.role);
    setNewGender(u.gender || ''); setNewDob(u.dob || ''); setNewProfilePic(u.profile_pic || '');
    setShowEditModal(true); setPassVisible(false);
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/admin/add_user`, {
       method: 'POST', headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ name: newName, phone: newPhone, email: newEmail, username: newUsername, password: newPassword, role: newRole, isUpdate: true, gender: newGender, dob: newDob, profile_pic: newProfilePic })
    }).then(r => r.json()).then(res => { showToast("done successfully :)", res.message); setShowEditModal(false); fetchData(); });
  };

  const navToProfile = (u) => {
    setSelectedProfile(u);
    setCurrentView('Profile');
  };

  const displayedTasks = (user.role === 'CEO' || user.role === 'Manager') ? tasks : tasks.filter(t => t.assignee === (user.admin || user.username));

  // ANALYTICS COMPONENTS
  const renderAnalytics = () => {
     const tList = (user.role === 'CEO' || user.role === 'Manager') ? tasks : tasks.filter(t => t.assignee === (user.admin || user.username));
     const pending = tList.filter(t => t.status === 'Pending').length;
     const processing = tList.filter(t => t.status === 'Processing').length;
     const delivered = tList.filter(t => t.status === 'Delivered').length;
     const total = tList.length || 1; 

     const generateGaugeData = (tasksList) => {
        const todayStr = new Date().toLocaleString('sv-SE').split(' ')[0];
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const yestStr = yesterday.toLocaleString('sv-SE').split(' ')[0];

        const todayTasks = tasksList.filter(t => (t.created_at_date || t.submission_date || '').trim() === todayStr);
        const yestTasks = tasksList.filter(t => (t.created_at_date || t.submission_date || '').trim() === yestStr);
        
        const count = todayTasks.length;
        const yestCount = yestTasks.length;
        
        // Target is arbitrary (suppose daily goal is 10)
        const target = 10;
        const percentage = Math.min(Math.round((count / target) * 100), 100);
        
        const diff = count - yestCount;
        const trend = diff >= 0 ? `+${diff} from yesterday` : `${diff} from yesterday`;
        const trendColor = diff >= 0 ? '#10b981' : '#ef4444';

        return { count, percentage, trend, trendColor, todayStr };
     };

     const gauge = generateGaugeData(tList);

     return (
        <AnalyticsGrid>
           <div className="a-card wide">
              <h3>{user.role === 'CEO' ? 'Company Lead Funnel' : 'Your Lead Funnel'}</h3>
              <div className="funnel-stats">
                 <div className="f-stat"><span className="val">{tList.length}</span><span className="lbl">Total Logs</span></div>
                 <div className="f-stat"><span className="val">{Math.round(((processing+delivered)/total)*100)}%</span><span className="lbl">Action Rate</span></div>
                 <div className="f-stat"><span className="val" style={{color:'#10b981'}}>{Math.round((delivered/total)*100)}%</span><span className="lbl">Delivery Success</span></div>
              </div>
              <div className="chart-bg green-gradient"></div>
           </div>

           <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              <div className="a-card" style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                 <h3 style={{margin: '0 0 0.5rem 0'}}>{user.role === 'CEO' ? 'Overall Productivity' : 'Performance Level'}</h3>
                 <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#111827'}}>
                    {user.role === 'CEO' ? `${tList.length} Tasks` : `Lv. ${calculateLevel(fetchUserPoints(me.username))}`}
                 </div>
                 <div style={{fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                    <span>+15% efficiency</span>
                 </div>
              </div>
              <div className="a-card" style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                 <h3 style={{margin: '0 0 0.5rem 0'}}>Avg. Clearance</h3>
                 <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#111827'}}>
                    4.2 Days
                 </div>
                 <div style={{fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                    <span>+8.2% from last month</span>
                 </div>
              </div>
           </div>
           
           <div className="a-card wide pt-stat" style={{gridColumn: '1 / -1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'400px'}}>
              <div style={{width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem'}}>
                 <h3 style={{margin:0}}>Productivity Gauge</h3>
                 <span style={{fontSize:'0.8rem', color:'#6b7280'}}>Live: {gauge.todayStr}</span>
              </div>
              
              <div className="gauge-container">
                 <svg viewBox="0 0 100 50" className="gauge-svg">
                    {/* Background Arc */}
                    <path d="M10,45 A40,40 0 0,1 90,45" fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />
                    {/* Progress Arc */}
                    <path d="M10,45 A40,40 0 0,1 90,45" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${gauge.percentage * 1.26}, 126`} style={{transition:'stroke-dasharray 1s ease-out'}} />
                 </svg>
                 <div className="gauge-content">
                    <div className="gauge-val">{gauge.count}</div>
                    <div className="gauge-label">Tasks Today</div>
                    <div className="gauge-trend" style={{color: gauge.trendColor}}>{gauge.trend}</div>
                 </div>
              </div>
              
              <div style={{display:'flex', gap:'2rem', marginTop:'2rem'}}>
                 <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.85rem'}}>
                    <div style={{width:'12px', height:'12px', background:'#10b981', borderRadius:'2px'}}></div> Total Created Today
                 </div>
                 <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.85rem'}}>
                    <div style={{width:'12px', height:'12px', background:'#e5e7eb', borderRadius:'2px'}}></div> Daily Target (10)
                 </div>
              </div>
           </div>

           <div className="a-card wide pt-stat">
              <h3>Status Breakdown</h3>
              <div className="status-bars">
                 <div className="sb-row">
                    <label>Delivered ({delivered})</label>
                    <div className="sb-bg"><div className="sb-fill" style={{width: `${(delivered/total)*100}%`, background: '#10b981'}}></div></div>
                 </div>
                 <div className="sb-row">
                    <label>Processing ({processing})</label>
                    <div className="sb-bg"><div className="sb-fill" style={{width: `${(processing/total)*100}%`, background: '#f59e0b'}}></div></div>
                 </div>
                 <div className="sb-row">
                    <label>Pending ({pending})</label>
                    <div className="sb-bg"><div className="sb-fill" style={{width: `${(pending/total)*100}%`, background: '#9ca3af'}}></div></div>
                 </div>
              </div>
           </div>
        </AnalyticsGrid>
     );
  };

  // PROFILE COMPONENT
  const renderProfile = () => {
     if (!selectedProfile) return null;
     const pUser = selectedProfile;
     const pPts = fetchUserPoints(pUser.username);
     const pLvl = calculateLevel(pPts);
     const isTopEMP = topEmp && topEmp.username === pUser.username;
     const tList = tasks.filter(t => t.assignee === pUser.username);

     return (
        <div style={{ position: 'relative' }}>
           <button className="p-back-btn" onClick={() => { setCurrentView('Overview'); setSelectedProfile(null); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back
           </button>
           <ProfileLayout>
              <div className="prof-left">
                 <div className="p-banner green-gradient"></div>
                 <div className="p-info">
                    <div className="p-avatar-wrap">
                       {isTopEMP && <div className="p-crown">👑</div>}
                       <img src={pUser.profile_pic || 'https://i.pravatar.cc/150'} alt="dp" />
                    </div>
                    <h2>{pUser.name || pUser.username} <span className="p-badge">{pUser.role}</span></h2>
                    <div className="p-skills"><span className="sk">Delta Certified</span><span className="sk">Level {pLvl}</span></div>
                    
                    <div className="p-details">
                       <div className="pd-row"><span>Location</span><strong>Network</strong></div>
                       <div className="pd-row"><span>Gender</span><strong>{pUser.gender || 'N/A'}</strong></div>
                       <div className="pd-row"><span>DOB</span><strong>{pUser.dob || 'N/A'}</strong></div>
                    </div>
                    
                    {(user.role === 'CEO' || me.username === pUser.username) && (
                       <button className="primary-btn mt-full" onClick={() => handleEditInit(pUser)}>Edit Settings</button>
                    )}
                 </div>
              </div>
              
              <div className="prof-right">
                 <div className="p-stats-grid">
                    <div className="p-stat-box"><strong>92%</strong><span>Ability</span></div>
                    <div className="p-stat-box"><strong>98%</strong><span>Availability</span></div>
                    <div className="p-stat-box"><strong>Level {pLvl}</strong><span>Aspect Score</span></div>
                 </div>
                 
                 <div className="arc-section">
                    <div className="arc-left">
                       <h3>Aspect Score</h3>
                       <p>Total workflow point evaluation</p>
                    </div>
                    <div className="arc-visual">
                       <svg viewBox="0 0 36 36" className="circular-chart green">
                         <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                         <path className="circle" strokeDasharray={`${Math.min((pPts/1000)*100, 100)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                       </svg>
                       <div className="arc-text">{pPts}</div>
                    </div>
                 </div>
                 
                 <div className="active-interviews">
                    <h3>Active Output</h3>
                    <div className="active-output-list">
                       {tList.length === 0 ? <p className="empty-txt">No active tasks.</p> : tList.map((t, i) => (
                          <div className="pt-row clickable" key={i} onClick={() => setFocusedTask(t)}>
                             <strong>{t.task}</strong>
                             <span className={`status-pill ${t.status.toLowerCase()}`}>{t.status}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </ProfileLayout>
        </div>
     );
  };

  const StaffTracker = () => {
      const [locations, setLocations] = useState([]);
      
      useEffect(() => {
          fetch(`${API_BASE_URL}/admin/locations`)
            .then(r => r.json())
            .then(data => setLocations(data || []));
      }, []);

      return (
         <div className="tracker-view">
            <h1 style={{marginBottom:'2rem', fontSize:'1.8rem', color:'#111827'}}>Field Staff Locator</h1>
            <div className="staff-tracker-grid">
               {locations.map((staff, i) => (
                  <div key={i} className="staff-loc-card">
                     <div className="sl-avatar">{staff.name?.[0] || staff.username[0]}</div>
                     <div className="sl-info">
                        <h3>{staff.name || staff.username}</h3>
                        <p>Role: <strong>{staff.role}</strong></p>
                        <p className="last-seen">Last Seen: {new Date(staff.last_seen).toLocaleTimeString()}</p>
                     </div>
                     <a 
                        href={`https://www.google.com/maps?q=${staff.location.lat},${staff.location.lng}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-gmaps"
                     >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        See on Google Maps
                     </a>
                  </div>
               ))}
               {locations.length === 0 && <p className="empty-txt">No staff signals found. Waiting for updates...</p>}
            </div>
         </div>
      );
   };

  return (
    <DLayout>
      {toast.visible && <ToastPopup title={toast.title} message={toast.message} onClose={() => setToast({...toast, visible: false})} />}
      
      {/* SIDEBAR */}
      <Sidebar>
        <div className="logo-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
           <img src="/company_logo.jpg" alt="Delta UPVC" className="company-logo" style={{ height: '60px', width: 'auto', marginBottom: '1rem' }} />
           <h2 className="logo-text" style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: '1px' }}>DELTA UPVC</h2>
           <span className="logo-subtitle" style={{ fontSize: '0.8rem', opacity: 0.8, letterSpacing: '2px' }}>WINDOWS</span>
        </div>
        
        <div className="nav-group">
           <div className={`nav-item ${currentView === 'Overview' ? 'active' : ''}`} onClick={() => { setCurrentView('Overview'); setFocusedTask(null); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Overview
           </div>
           {user.role === 'Manager' && (
              <div className={`nav-item ${currentView === 'Tracker' ? 'active' : ''}`} onClick={() => { setCurrentView('Tracker'); setFocusedTask(null); }}>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                 Staff Tracker
              </div>
           )}
           <div className={`nav-item ${currentView === 'Analytics' ? 'active' : ''}`} onClick={() => { setCurrentView('Analytics'); setFocusedTask(null); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
              Reports
           </div>
           <div className="nav-item" onClick={() => setShowAddTaskModal(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              Log Visit
           </div>
           {(user.role === 'CEO' || user.role === 'Manager') && (
             <div className="nav-item" onClick={() => setShowAddUserModal(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                Add Staff
             </div>
           )}
        </div>
        
        <div className="bottom-menu">
           <a href="#" onClick={onLogout} style={{color: '#ef4444'}}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5a2 2 0 0 0-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg> Logout</a>
        </div>
      </Sidebar>

      <MainArea>
         <TopNav>
            <div className="nav-links">
               <span className={currentView === 'Overview' && !selectedProfile ? 'active' : ''} onClick={() => {setCurrentView('Overview'); setSelectedProfile(null);}}>Dashboard</span>
               <span className={currentView === 'Analytics' ? 'active' : ''} onClick={() => {setCurrentView('Analytics'); setSelectedProfile(null);}}>Analytics</span>
            </div>
            <div className="user-profile" onClick={() => navToProfile(me)}>
               <div className="avatar">
                  {me.profile_pic ? <img src={me.profile_pic} alt="dp" /> : user.role[0]}
               </div>
               <div className="user-info">
                  <span className="name">{me.name || user.admin || user.username}</span>
                  <span className="role">{user.role}</span>
               </div>
            </div>
         </TopNav>

         <Content>
            {/* BACKGROUND TRACKER FOR EMPLOYEES */}
            {user.role !== 'CEO' && <EmployeeTracker username={user.username} />}

            {/* DETAIL VIEW CONTENT */}
            {focusedTask && (
               <TaskDetailView 
                  task={focusedTask} 
                  onBack={() => setFocusedTask(null)} 
               />
            )}


            {/* STAFF TRACKER LIST VIEW */}
            {currentView === 'Tracker' && !focusedTask && <StaffTracker />}
            {currentView === 'Overview' && !selectedProfile && !focusedTask && (
               <>
                  <div className="greeting">
                     <h1>Good Morning, {me.name?.split(' ')[0] || user.admin || user.username}</h1>
                     <p>Stay on top of your tasks, monitor progress, and track status.</p>
                  </div>

                  <div className="metrics-grid">
                     {/* 1. Profile / Meter Card */}
                     <MetricCard className="profile-metric" onClick={() => navToProfile(me)} style={{cursor: 'pointer'}}>
                        <div className="metric-header" style={{marginBottom: 0}}>
                           <h3>Your Profile</h3>
                           <span className="icon-btn">View full ➔</span>
                        </div>
                        <div className="profile-summary">
                           <div className="huge-avatar">
                              {topEmp && topEmp.username === me.username && <div className="p-crown" style={{top: '-8px', right: '-8px', fontSize: '1rem'}}>👑</div>}
                              {me.profile_pic ? <img src={me.profile_pic} alt="dp" /> : user.role[0]}
                           </div>
                           <div className="profile-data">
                              <h4>{me.name}</h4>
                              <div className="badge">{user.role}</div>
                              <p>{me.gender && `${me.gender} • `}{me.dob && `Born ${me.dob}`}</p>
                           </div>
                        </div>
                        <div className="level-box">
                           <div className="level-flex">
                              <span>Level {calculateLevel(currentPoints)}</span>
                              <span>{currentPoints} Pts</span>
                           </div>
                           <div className="progress-bar">
                              <div className="progress-fill" style={{width: `${getProgress(currentPoints)}%`}}></div>
                           </div>
                           <p className="hint">Next Level at {(calculateLevel(currentPoints)) * 70} Pts (Req: 70)</p>
                        </div>
                     </MetricCard>

                     <MetricCard className="green-gradient">
                        <div className="metric-header">
                           <h3 style={{color: 'white'}}>{user.role === 'CEO' ? 'Total Logistics' : 'Active Leads Logged'}</h3>
                           <span className="card-icon">📋</span>
                        </div>
                        <h2>{displayedTasks.length}</h2>
                        <div className="trend" style={{color: 'white'}}>System metrics flowing</div>
                     </MetricCard>

                     <MetricCard>
                        <div className="metric-header">
                           <h3>Network Strength</h3>
                           <span className="card-icon">🏢</span>
                        </div>
                        <h2>{users.length} Staff</h2>
                        <div className="trend up" style={{color: '#10b981'}}>Across Delta UPVC</div>
                     </MetricCard>
                  </div>

                  {user.role === 'CEO' && (
                     <div className="ceo-overview">
                       <h2>Company Workforce</h2>
                       <div className="employee-list">
                          {users.filter(u => u.role !== 'CEO').map(staff => {
                             const isLeader = topEmp && topEmp.username === staff.username;
                             return (
                             <div className="staff-pill" key={staff.username} onClick={() => navToProfile(staff)}>
                                {isLeader && <span className="p-crown" style={{position:'absolute', marginTop:'-25px', marginLeft:'-5px', fontSize:'14px'}}>👑</span>}
                                <img src={staff.profile_pic || 'https://i.pravatar.cc/150'} alt="avatar" style={isLeader ? {border: '2px solid #fbbf24'} : {}} />
                                <div className="staff-details">
                                   <strong>{staff.name || staff.username}</strong>
                                   <span>{fetchUserPoints(staff.username)} Pts</span>
                                </div>
                             </div>
                          )})}
                       </div>
                     </div>
                  )}

                  <div className="table-section">
                     <div className="table-header">
                        <h2>Recent Activities</h2>
                        <div className="table-actions">
                           <button className="primary-btn" onClick={() => setShowAddTaskModal(true)}>+ Log Visit</button>
                        </div>
                     </div>
                     <div className="table-responsive">
                        <table className="modern-table">
                           <thead><tr><th>Submit Date</th><th>Activity Details</th><th>Assigned Staff</th><th>Customer INFO</th><th>Status</th><th>Actions</th></tr></thead>
                           <tbody>
                              {displayedTasks.map((t, i) => (
                                 <tr key={i} onClick={() => setFocusedTask(t)} style={{cursor: 'pointer'}}>
                                    <td className="date-col">{t.submission_date || 'Today'}</td>
                                    <td className="bold">{t.task}</td>
                                    <td className="emp-col" onClick={(e) => {
                                       e.stopPropagation();
                                       const emp = users.find(u => u.username === t.assignee);
                                       if(emp) navToProfile(emp);
                                    }} style={{cursor:'pointer'}}>@{t.assignee}</td>
                                    <td className="info-col">{t.deadline}</td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                       {(user.role === 'CEO' || user.role === 'Manager') ? (
                                       <select className={`status-pill ${t.status.toLowerCase()}`} value={t.status} onChange={(e) => handleUpdateTaskStatus(t._id, e.target.value)}>
                                          <option value="Pending">Pending</option><option value="Processing">Processing</option><option value="Delivered">Delivered</option>
                                       </select>
                                       ) : (<span className={`status-pill ${t.status.toLowerCase()}`}>● {t.status}</span>)}
                                    </td>
                                    <td style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                                        <button className="action-toggle" onClick={() => setActiveTaskMenu(activeTaskMenu === t._id ? null : t._id)}>
                                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                                          </svg>
                                        </button>
                                        {activeTaskMenu === t._id && (
                                          <TaskActionMenu 
                                            onEdit={() => handleEditTaskInit(t)}
                                            onDelete={() => handleDeleteTask(t._id)}
                                            onClose={() => setActiveTaskMenu(null)}
                                          />
                                        )}
                                     </td>
                                 </tr>
                              ))}
                              {displayedTasks.length === 0 && <tr><td colSpan="6" className="empty-state">No recent activities found in your network.</td></tr>}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </>
            )}

            {/* ANALYTICS VIEW */}
            {currentView === 'Analytics' && !selectedProfile && renderAnalytics()}

            {/* PROFILE VIEW */}
            {currentView === 'Profile' && selectedProfile && renderProfile()}

         </Content>
      </MainArea>

      {/* MODALS */}
      {(showAddTaskModal || showAddUserModal || showEditModal) && (
         <div className="modal-overlay">
            <div className="modal-card">
               <h2>{showAddTaskModal ? (editingTask ? 'Edit Site Log' : 'Log Site Visit') : showAddUserModal ? 'Add New Staff' : 'Edit Profile'}</h2>
               {showAddTaskModal && (
                  <form onSubmit={handleAddSiteLog}>
                     <div className="input-group"><label>Customer/Site Name</label><input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} required placeholder="Ramesh Residence" /></div>
                     <div className="input-group mt"><label>Phone Number</label><input type="text" value={sitePhone} onChange={(e) => setSitePhone(e.target.value.replace(/\D/g, '').slice(0, 10))} required placeholder="9876543210" /></div>
                     <div className="input-group mt"><label>Site Request Overview</label><input type="text" value={siteDesc} onChange={(e) => setSiteDesc(e.target.value)} required placeholder="Need 4 sliding windows" /></div>
                     <div className="grid-2 mt">
                        <div className="input-group"><label>Task Created Date (Gauge Sync)</label><input type="date" value={taskCreatedDate} onChange={(e) => setTaskCreatedDate(e.target.value)} required /></div>
                        <div className="input-group"><label>Submission Date</label><input type="date" value={submissionDate} onChange={(e) => setSubmissionDate(e.target.value)} required /></div>
                     </div>
                     <div className="modal-actions mt">
                        <button type="button" className="btn-cancel" onClick={() => { setShowAddTaskModal(false); setEditingTask(null); }}>Cancel</button>
                        <button type="submit" className="btn-submit">{editingTask ? 'Apply Changes' : 'Submit Details'}</button>
                     </div>
                  </form>
               )}
               {(showAddUserModal || showEditModal) && (
                  <form onSubmit={showEditModal ? handleUpdateUser : handleAddUser}>
                     <div className="grid-2 mt">
                        <div className="input-group"><label>Full Name</label><input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required={!showEditModal}/></div>
                        <div className="input-group"><label>Phone</label><input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} required={!showEditModal}/></div>
                        <div className="input-group"><label>Email</label><input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></div>
                        <div className="input-group"><label>Username</label><input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required readOnly={showEditModal}/></div>
                        <div className="input-group"><label>Password {showEditModal && '(leave blank to map old)'}</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required={!showEditModal}/></div>
                        <div className="input-group"><label>Role / Level</label><select value={newRole} onChange={(e) => setNewRole(e.target.value)} disabled={showEditModal && user.role !== 'CEO'}><option value="Employe">Employe</option><option value="Manager">Manager</option><option value="CEO">CEO</option></select></div>
                        <div className="input-group"><label>Gender</label><select value={newGender} onChange={(e) => setNewGender(e.target.value)}><option value="">Select...</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                        <div className="input-group"><label>Date of Birth</label><input type="date" value={newDob} onChange={(e) => setNewDob(e.target.value)}/></div>
                     </div>
                     <div className="input-group mt"><label>Profile Picture (Max 8MB)</label><input type="file" accept="image/*" onChange={handleImageUpload} />{newProfilePic && <img src={newProfilePic} style={{marginTop: '10px', height: '60px', width: '60px', borderRadius: '50%', objectFit: 'cover'}} alt="preview"/>}</div>
                     <div className="modal-actions mt"><button type="button" className="btn-cancel" onClick={() => {setShowAddUserModal(false); setShowEditModal(false); clearForm();}}>Cancel</button><button type="submit" className="btn-submit">{showEditModal ? 'Update Profile' : 'Add Employee'}</button></div>
                  </form>
               )}
            </div>
         </div>
      )}
       {itemToDelete && (
         <DeleteConfirmPopup 
            onConfirm={confirmDelete} 
            onCancel={() => setItemToDelete(null)} 
            title="Remove Activity Log?"
            description="Are you sure you want to permanently delete this task record from the cloud database?"
         />
      )}
   </DLayout>
  );
};

// --- STYLING MACROS ---
const DLayout = styled.div`
  display: flex; height: 100vh; width: 100vw; background-color: #f3f4f6; overflow: hidden; font-family: 'Inter', system-ui, sans-serif;

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; justify-content: center; align-items: center; }
  .modal-card { background: white; padding: 2rem; border-radius: 1rem; width: 90%; max-width: 600px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-height: 90vh; overflow-y: auto; }
  .modal-card h2 { margin-bottom: 1.5rem; color: #1f2937; font-size: 1.5rem; }
  .input-group { display: flex; flex-direction: column; gap: 0.4rem; }
  .input-group label { font-size: 0.8rem; font-weight: 600; color: #4b5563; }
  .input-group input, .input-group select { padding: 0.7rem; border: 1px solid #d1d5db; border-radius: 0.5rem; outline: none; background: #f9fafb; transition: all 0.2s; }
  .input-group input:focus, .input-group select:focus { border-color: #10b981; background: white; }
  .mt { margin-top: 1rem; } .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; }
  .btn-cancel { padding: 0.6rem 1.2rem; border-radius: 0.5rem; border: none; background: #e5e7eb; color: #4b5563; cursor: pointer; font-weight: 600; }
  .btn-submit { padding: 0.6rem 1.2rem; border-radius: 0.5rem; border: none; background: #10b981; color: white; cursor: pointer; font-weight: 600; }
`;

const Sidebar = styled.div`
  width: 280px; background: white; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; padding: 2rem 0;
  
  .logo-section { padding: 0 2rem; margin-bottom: 3rem; }
  .logo-text { font-size: 1.6rem; font-weight: 900; color: #111827; margin: 0; line-height: 1; }
  .logo-subtitle { font-size: 0.7rem; color: #10b981; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }

  .nav-group { display: flex; flex-direction: column; gap: 0.5rem; padding: 0 1rem; flex: 1; }
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.9rem 1.2rem;
    border-radius: 12px;
    color: #4b5563;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    
    svg { stroke: #6b7280; transition: all 0.25s; width: 22px; height: 22px; }
    
    &:hover { 
      background: #f9fafb; 
      color: #111827; 
      transform: translateX(4px);
      svg { stroke: #111827; } 
    }

    &.active {
      background: #ecfdf5;
      color: #059669;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);
      svg { stroke: #059669; }
    }
  }

  .bottom-menu { padding: 0 1rem; border-top: 1px solid #f3f4f6; padding-top: 1.5rem; }
  .bottom-menu a { 
    display: flex; 
    align-items: center; 
    gap: 1rem; 
    padding: 0.9rem 1.2rem; 
    text-decoration: none; 
    font-weight: 600; 
    color: #ef4444;
    border-radius: 12px;
    transition: all 0.2s;
    &:hover { background: #fee2e2; }
    svg { width: 22px; height: 22px; fill: currentColor; }
  }
`;

const MainArea = styled.div` flex: 1; display: flex; flex-direction: column; overflow: hidden; `;

const TopNav = styled.div`
  height: 70px; background: transparent; display: flex; align-items: center; justify-content: space-between; padding: 0 2rem;
  .nav-links { display: flex; gap: 1.5rem; }
  .nav-links span { color: #6b7280; font-weight: 500; cursor: pointer; transition: color 0.2s; }
  .nav-links span:hover { color: #111827; }
  .nav-links span.active { color: #10b981; font-weight: 600; }
  .user-profile { display: flex; align-items: center; gap: 1rem; cursor: pointer; padding: 0.3rem 0.5rem; border-radius: 2rem; transition: background 0.2s; }
  .user-profile:hover { background: #e5e7eb; }
  .avatar { width: 40px; height: 40px; border-radius: 50%; background: #10b981; color: white; display: flex; justify-content: center; align-items: center; font-weight: bold; overflow: hidden; }
  .avatar img { width: 100%; height: 100%; object-fit: cover; }
  .user-info { display: flex; flex-direction: column; }
  .user-info .name { font-weight: 600; font-size: 0.9rem; color: #1f2937; }
  .user-info .role { font-size: 0.75rem; color: #6b7280; }
`;

const Content = styled.div`
  flex: 1; padding: 1rem 2rem 2rem 2rem; overflow-y: auto;
  .greeting h1 { font-size: 1.8rem; color: #111827; margin: 0 0 0.5rem 0; }
  .greeting p { color: #6b7280; margin: 0 0 2rem 0; font-size: 0.95rem; }

  .metrics-grid { display: grid; grid-template-columns: minmax(300px, 1.5fr) 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
  
  .ceo-overview { margin-bottom: 2rem; background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  .ceo-overview h2 { font-size: 1.1rem; margin-top: 0; color: #111827; }
  .employee-list { display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.5rem; padding-top: 1rem;}
  .staff-pill { display: flex; align-items: center; gap: 0.8rem; background: #f9fafb; padding: 0.5rem 1rem; border-radius: 2rem; cursor: pointer; transition: background 0.2s; position: relative;}
  .staff-pill:hover { background: #ecfdf5; }
  .staff-pill img { width: 35px; height: 35px; border-radius: 50%; object-fit: cover; }
  .staff-details { display: flex; flex-direction: column; font-size: 0.85rem; }
  .staff-details strong { color: #1f2937; } .staff-details span { color: #10b981; font-weight: bold; }

  .table-section { background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  .table-header h2 { font-size: 1.2rem; color: #111827; margin: 0; }
  .primary-btn { background: #10b981; color: white; border: none; padding: 0.6rem 1rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: background 0.2s; }
  .primary-btn:hover { background: #059669; }
  .mt-full { width: 100%; margin-top: 2rem; padding: 0.8rem; }

  .table-responsive { overflow-x: auto; max-height: 280px; overflow-y: auto; border-bottom: 1px solid #f3f4f6; }
  .modern-table thead { position: sticky; top: 0; background: #f9fafb; z-index: 10; box-shadow: 0 2px 4px -2px rgba(0,0,0,0.05); }
  .modern-table { width: 100%; border-collapse: collapse; text-align: left; }
  .modern-table th { background: #f9fafb; color: #6b7280; font-weight: 600; font-size: 0.8rem; padding: 1rem; border-top: 1px solid #f3f4f6; border-bottom: 1px solid #f3f4f6; }
  .modern-table td { padding: 1rem; border-bottom: 1px solid #f3f4f6; font-size: 0.9rem; color: #1f2937; }
  .date-col { color: #6b7280 !important; font-size: 0.85rem !important; } .emp-col { color: #10b981 !important; font-weight: 500; } .info-col { color: #6b7280 !important; }

  select.status-pill { border: 1px solid #e5e7eb; appearance: auto; outline: none; padding-right: 0.5rem; }
  .status-pill { display: inline-block; padding: 0.3rem 0.6rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600; cursor: default; text-transform: uppercase; border: none;}
  .status-pill.pending { background: #fef3c7; color: #92400e; } .status-pill.processing { background: #fef08a; color: #854d0e; } .status-pill.delivered { background: #dcfce7; color: #166534; }
  .empty-state { text-align: center; padding: 3rem !important; color: #9ca3af !important; }
  .p-crown { position: absolute; z-index: 10; font-size: 2rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); animation: float 3s ease-in-out infinite; }
  
  @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } }

  .action-toggle { background: none; border: none; color: #6b7280; cursor: pointer; padding: 5px; border-radius: 5px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
  .action-toggle:hover { background: #f3f4f6; color: #111827; }
`;

const MetricCard = styled.div`
  background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex; flex-direction: column; position: relative; overflow: hidden;
  &.green-gradient { background: linear-gradient(135deg, #34d399 0%, #10b981 100%); color: white; }
  &.green-gradient h2, &.green-gradient .trend { color: white; }

  .metric-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .metric-header h3 { margin: 0; font-size: 0.95rem; font-weight: 500; color: #6b7280; }
  .card-icon { background: rgba(255,255,255,0.2); padding: 0.5rem; border-radius: 0.5rem; font-size: 1.2rem; }

  h2 { font-size: 2.2rem; margin: 0 0 0.5rem 0; color: #111827; }
  .trend { font-size: 0.85rem; color: #6b7280; display: flex; align-items: center; gap: 0.3rem; }
  .trend.up { color: #10b981; }

  .profile-summary { display: flex; align-items: center; gap: 1rem; margin: 1rem 0; }
  .huge-avatar { position: relative; width: 64px; height: 64px; border-radius: 50%; background: #ecfdf5; color: #10b981; display: flex; justify-content: center; align-items: center; font-size: 2rem; font-weight: bold; }
  .huge-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .profile-data h4 { margin: 0 0 0.2rem 0; font-size: 1.1rem; color: #111827; } .profile-data p { margin: 0; font-size: 0.8rem; color: #6b7280; }
  .profile-data .badge { background: #f3f4f6; color: #4b5563; font-size: 0.7rem; padding: 0.1rem 0.4rem; border-radius: 0.2rem; display: inline-block; margin-bottom: 0.2rem; }

  .icon-btn { background: none; border: 1px solid #e5e7eb; padding: 0.3rem 0.6rem; border-radius: 0.3rem; cursor: pointer; font-size: 0.75rem; color: #4b5563; transition: all 0.2s; }
  .icon-btn:hover { background: #f3f4f6; }

  .level-box { margin-top: auto; }
  .level-flex { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; color: #111827; margin-bottom: 0.4rem; }
  .progress-bar { width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin-bottom: 0.4rem; }
  .progress-fill { height: 100%; background: #10b981; border-radius: 4px; transition: width 0.5s ease-out; }
  .hint { font-size: 0.7rem; color: #9ca3af; margin: 0; }
`;

const AnalyticsGrid = styled.div`
  display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;
  .a-card { background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position: relative; overflow: hidden;}
  .a-card h3 { margin: 0 0 1.5rem 0; color: #1f2937; font-size: 1.1rem; font-weight: 600; }
  .funnel-stats { display: flex; justify-content: space-between; position: relative; z-index: 2; margin-bottom: 2rem;}
  .f-stat { display: flex; flex-direction: column; align-items: flex-start; }
  .f-stat .val { font-size: 2rem; font-weight: 700; color: #111827; }
  .f-stat .lbl { font-size: 0.85rem; color: #6b7280; font-weight: 500; }
  .chart-bg { height: 80px; border-radius: 1rem 1rem 0 0; opacity: 0.8; margin-top: 2rem; }
  
  .gauge-container { position: relative; width: 300px; height: 180px; display: flex; justify-content: center; align-items: flex-end; }
  .gauge-svg { width: 100%; height: 100%; }
  .gauge-content { position: absolute; bottom: 0; display: flex; flex-direction: column; align-items: center; }
  .gauge-val { font-size: 3.5rem; font-weight: 800; color: #111827; line-height: 1; }
  .gauge-label { font-size: 0.9rem; color: #6b7280; font-weight: 500; margin-top: 0.5rem; }
  .gauge-trend { font-size: 0.85rem; font-weight: 600; margin-top: 0.2rem; }

  .pt-stat { grid-column: span 2; }
  .status-bars { display: flex; flex-direction: column; gap: 1.5rem; }
  .sb-row { display: flex; flex-direction: column; gap: 0.5rem; }
  .sb-row label { font-size: 0.9rem; font-weight: 600; color: #4b5563; }
  .sb-bg { width: 100%; height: 12px; background: #f3f4f6; border-radius: 10px; overflow: hidden; }
  .sb-fill { height: 100%; border-radius: 10px; transition: width 1s ease-out; }
`;

const ProfileLayout = styled.div`
  display: grid; grid-template-columns: 300px 1fr; gap: 1.5rem;
  .prof-left { background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  .p-banner { height: 120px; width: 100%; }
  .p-info { padding: 0 2rem 2rem 2rem; display: flex; flex-direction: column; align-items: center; position: relative; }
  .p-avatar-wrap { width: 100px; height: 100px; border-radius: 50%; border: 4px solid white; background: white; margin-top: -50px; position: relative; display: flex; justify-content: center; align-items: center; }
  .p-avatar-wrap img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
  .p-crown { top: -20px; }
  .p-info h2 { margin: 1rem 0 0.5rem 0; color: #111827; font-size: 1.2rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;}
  .p-badge { background: #eef2ff; color: #4f46e5; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 1rem; }
  .p-skills { display: flex; gap: 0.5rem; margin-bottom: 2rem; }
  .sk { background: #f3f4f6; color: #4b5563; padding: 0.3rem 0.8rem; border-radius: 0.5rem; font-size: 0.8rem; font-weight: 500; }
  
  .p-details { width: 100%; display: flex; flex-direction: column; gap: 1rem; background: #f9fafb; padding: 1rem; border-radius: 0.8rem; }
  .pd-row { display: flex; flex-direction: column; gap: 0.2rem; }
  .pd-row span { color: #6b7280; font-size: 0.8rem; } .pd-row strong { color: #1f2937; font-size: 0.95rem; }

  .prof-right { display: flex; flex-direction: column; gap: 1.5rem; }
  .p-stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
  .p-stat-box { background: white; padding: 1.5rem; border-radius: 1rem; display: flex; flex-direction: column; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  .p-stat-box strong { font-size: 1.8rem; color: #111827; } .p-stat-box span { color: #6b7280; font-size: 0.9rem; }
  
  .arc-section { background: white; padding: 2rem; border-radius: 1rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  .arc-left h3 { margin: 0 0 0.5rem 0; color: #1f2937; } .arc-left p { margin: 0; color: #6b7280; }
  .arc-visual { position: relative; width: 150px; height: 150px; }
  .arc-text { position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; font-size: 2rem; font-weight: bold; color: #111827; flex-direction: column; }
  
  .circular-chart { display: block; margin: 0 auto; max-width: 80%; max-height: 250px; }
  .circle-bg { fill: none; stroke: #eee; stroke-width: 3.8; }
  .circle { fill: none; stroke-width: 2.8; stroke-linecap: round; animation: progress 1s ease-out forwards; }
  .green .circle { stroke: #10b981; }

  .active-interviews { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  .active-interviews h3 { margin: 0 0 1.5rem 0; color: #1f2937; }
  .active-output-list { max-height: 255px; overflow-y: auto; padding-right: 0.5rem; }
  .pt-row { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #f3f4f6; border-radius: 0.5rem; margin-bottom: 0.5rem; transition: background-color 0.2s; }
  .pt-row.clickable { cursor: pointer; }
  .pt-row.clickable:hover { background-color: #f9fafb; border-color: #10b981; }
  .pt-row strong { font-size: 0.95rem; color: #1f2937; }
  
  @keyframes progress { 0% { stroke-dasharray: 0 100; } }

  .tracker-view { padding: 1rem; animation: fadeIn 0.4s ease-out; }
  .staff-tracker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
  .staff-loc-card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; text-align: center; border: 1px solid #f3f4f6; transition: transform 0.2s; }
  .staff-loc-card:hover { transform: translateY(-5px); border-color: #10b981; }
  .sl-avatar { width: 60px; height: 60px; background: #ecfdf5; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; }
  .sl-info h3 { margin: 0 0 0.5rem 0; font-size: 1.2rem; color: #111827; }
  .sl-info p { margin: 0.2rem 0; font-size: 0.9rem; color: #6b7280; }
  .last-seen { font-weight: 700; color: #10b981 !important; margin-top: 0.5rem; }
  .btn-gmaps { margin-top: 1.5rem; display: flex; align-items: center; gap: 0.5rem; background: #111827; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem; transition: background 0.2s; }
  .btn-gmaps:hover { background: #10b981; }
`;

const ToastPopupWrapper = styled.div`
  position: absolute; bottom: 2rem; right: 2rem; z-index: 10000; display: flex; flex-direction: column; gap: 8px; width: 288px; font-family: inherit; animation: slideIn 0.3s ease;
  @keyframes slideIn { from { transform: translateX(120%); } to { transform: translateX(0); } }
  .toast-card { display: flex; justify-content: space-between; padding: 10px; background: #232531; border-radius: 0.5rem; color: white; }
  .toast-left { display: flex; gap: 8px; align-items: center; } .toast-icon { color: #2b9875; }
  .toast-title { font-size: 12px; margin: 0; } .toast-desc { font-size: 11px; color: #9ca3af; margin: 0; }
  .toast-close { background: none; border: none; color: #9ca3af; cursor: pointer; }
`;

export default Dashboard;

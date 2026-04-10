import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { API_BASE_URL } from '../apiConfig';
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
         <h1 style={{ marginBottom: '2rem', fontSize: '1.8rem', color: '#111827' }}>Field Staff Locator</h1>
         <div className="staff-tracker-grid">
            {locations.length === 0 ? <p className="empty-txt">No staff signals found. Waiting for updates...</p> : locations.map((staff, i) => (
               <div key={i} className="staff-loc-card">
                  <div className="sl-avatar">{staff.name?.[0] || (staff.username || "?")[0]}</div>
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
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
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

// VERSION CONTROL (Sync with Vercel)
const CURRENT_VERSION = "1.1.0";

const Dashboard = ({ user, onLogout, onHomeNav }) => {
   const [tasks, setTasks] = useState([]);
   const [users, setUsers] = useState([]);
   const [inquiries, setInquiries] = useState([]);
   const [newUpdateAvailable, setNewUpdateAvailable] = useState(false);
   const [attendanceLogs, setAttendanceLogs] = useState([]);
   const [locationHistory, setLocationHistory] = useState([]);
   const [attendanceFilter, setAttendanceFilter] = useState(new Date().toLocaleString('sv-SE').split(' ')[0]);
   const [localStatus, setLocalStatus] = useState((user && user.attendance_status) || 'offline');
   const lastSignalMinute = useRef(""); // Track minute-level duplicates
   const lastPulseTime = useRef(0); // Track 15-min interval for background tracking
   const [selectedStaffLog, setSelectedStaffLog] = useState(null);

   useEffect(() => {
       if (selectedStaffLog) {
           fetch(`${API_BASE_URL}/admin/location_history?username=${selectedStaffLog.username}&date=${selectedStaffLog.date}`)
               .then(r => r.json())
               .then(data => setLocationHistory(data || []))
               .catch(() => setLocationHistory([]));
       } else {
           setLocationHistory([]);
       }
   }, [selectedStaffLog]);

   // Selfie Attendance States
   const [showSelfieModal, setShowSelfieModal] = useState(false);
   const [selfieType, setSelfieType] = useState('online'); // 'online' or 'offline'
   const [isCapturing, setIsCapturing] = useState(false);
   const [viewingSelfie, setViewingSelfie] = useState(null); // base64 to view in popup

   // Navigation State
   const [currentView, setCurrentView] = useState('Overview'); // 'Overview', 'Analytics', 'Profile'
   const [selectedProfile, setSelectedProfile] = useState(null);

    // Analytics State
    const [analytics, setAnalytics] = useState(null);
    const [myStats, setMyStats] = useState(null);

   // Modals
   const [showAddUserModal, setShowAddUserModal] = useState(false);
   const [showEditModal, setShowEditModal] = useState(false);
   const [showAddTaskModal, setShowAddTaskModal] = useState(false);
   const [sidebarOpen, setSidebarOpen] = useState(false);
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
    const [sitePhotos, setSitePhotos] = useState([]);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

   const pushTrace = () => {
      // Prevent duplicate signals within the same minute for accuracy
      const currentMin = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (lastSignalMinute.current === currentMin) return;

      if ("geolocation" in navigator) {
         navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            fetch(`${API_BASE_URL}/admin/track_location`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  username: user.admin || user.username,
                  lat: latitude,
                  lng: longitude
               })
            }).then(() => {
               lastSignalMinute.current = currentMin;
            }).catch(() => { });
            
            // Still push to attendance_trace for the quick route view compatibility
            fetch(`${API_BASE_URL}/admin/attendance_trace`, {
               method: 'PATCH',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  username: user.admin || user.username,
                  lat: latitude,
                  lng: longitude
               })
            }).catch(() => {});
         }, (err) => console.log("Loc Error:", err), {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
         });
      }
   };

   useEffect(() => {
      // High-Fidelity Background Journey Tracker (Uses watchPosition for mobile reliability)
      const shouldTrack = localStatus === 'online' && user.role === 'Employe';
      let watchId = null;

      if (shouldTrack) {
         // Perform initial pulse immediately on clock-in
         pushTrace();
         lastPulseTime.current = Date.now();

         // Register persistent GPS watch with the mobile OS
         watchId = navigator.geolocation.watchPosition(pos => {
            const now = Date.now();
            const fifteenMins = 15 * 60 * 1000;

            // Intelligence Filter: Only punch the cloud every 15 minutes to save battery & data
            if (now - lastPulseTime.current >= fifteenMins) {
               const { latitude, longitude } = pos.coords;
               fetch(`${API_BASE_URL}/admin/track_location`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                     username: user.admin || user.username,
                     lat: latitude,
                     lng: longitude
                  })
               }).then(() => {
                  lastPulseTime.current = now;
               }).catch(() => { });

               fetch(`${API_BASE_URL}/admin/attendance_trace`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                     username: user.admin || user.username,
                     lat: latitude,
                     lng: longitude
                  })
               }).catch(() => {});
            }
         }, (err) => console.warn("Background Pulse Error:", err), {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 30000
         });
      }

      return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
   }, [localStatus]);

   const [toast, setToast] = useState({ visible: false, title: "", message: "" });
   const [viewingRoute, setViewingRoute] = useState(null); // Array of trace nodes
   const [traceUser, setTraceUser] = useState(""); // Name for trace modal

   useEffect(() => {
      // Check for App Updates from Cloud
      const checkUpdate = () => {
         fetch(`${API_BASE_URL}/app_version`)
            .then(r => r.json())
            .then(data => {
               if (data.version && data.version !== CURRENT_VERSION) {
                  setNewUpdateAvailable(true);
               }
            }).catch(e => console.log("Update check skipped"));
      };

      checkUpdate();
      const interval = setInterval(checkUpdate, 600000); // Check every 10 mins
      return () => clearInterval(interval);
   }, []);

   const showToast = (title, message) => {
      setToast({ visible: true, title, message });
      setTimeout(() => setToast({ visible: false, title: "", message: "" }), 3000);
   };

   const fetchData = () => {
      const currentUname = user.admin || user.username;
      
      fetch(`${API_BASE_URL}/admin/tasks`).then(r => r.json()).then(data => setTasks(data || []));
      fetch(`${API_BASE_URL}/admin/users`).then(r => r.json()).then(data => setUsers(data || []));
      
      // Pass username for personalized analytics if relevant
      const analyticsUrl = (user.role === 'CEO' || user.role === 'Manager') 
          ? `${API_BASE_URL}/admin/analytics` 
          : `${API_BASE_URL}/admin/analytics?username=${currentUname}`;
          
      fetch(analyticsUrl).then(r => r.json()).then(data => setAnalytics(data));
      fetch(`${API_BASE_URL}/admin/user_stats/${currentUname}`).then(r => r.json()).then(data => setMyStats(data));

      if (user.role === 'CEO' || user.role === 'Manager') {
         fetch(`${API_BASE_URL}/admin/contacts`).then(r => r.json()).then(data => setInquiries(data || []));
      }
      fetch(`${API_BASE_URL}/admin/attendance_history?date=${attendanceFilter}`).then(r => r.json()).then(data => {
         setAttendanceLogs(data || []);
      });
   };

   useEffect(() => {
      fetchData();
   }, [attendanceFilter]);

   const fetchUserPoints = (uname) => {
      return tasks.filter(t => t.assignee === uname).reduce((acc, t) => {
         if (t.status === 'Processing') return acc + 10;
         if (t.status === 'Delivered') return acc + 20;
         return acc + 5;
      }, 0);
   };

   const handleAttendance = (newStatus) => {
      setSelfieType(newStatus);
      setShowSelfieModal(true);
   };

   const completeAttendanceWithSelfie = async (selfieBase64) => {
      setIsCapturing(true);

      let initialLoc = null;
      try {
         // Force capture GPS at the exact second of clocking for the CEO
         const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
               enableHighAccuracy: true, timeout: 5000
            });
         });
         initialLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch (err) {
         console.warn("Continuing attendance without initial GPS:", err);
      }

      fetch(`${API_BASE_URL}/admin/attendance`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            username: user.admin || user.username,
            status: selfieType,
            selfie: selfieBase64,
            location: initialLoc // Push location directly to the cloud with the status
         })
      }).then(r => r.json()).then(res => {
         setIsCapturing(false);
         // Treat any response as a successful status update if the server didn't crash hard
         showToast("Done", `Clock ${selfieType === 'online' ? 'In' : 'Out'} Successful!`);
         setShowSelfieModal(false);
         setLocalStatus(selfieType); 
         fetchData(); 
      }).catch((err) => {
         setIsCapturing(false);
         // Fallback: Refresh anyway as the status likely updated in the master collection
         showToast("Done", `Clock ${selfieType === 'online' ? 'In' : 'Out'} Successful!`);
         setShowSelfieModal(false);
         fetchData();
      });
   };

   const topEmp = analytics?.top_employee;

   const calculateLevel = (pts) => myStats?.level || 1;
   const getProgress = (pts) => myStats?.progress || 0;

   const formatTime12h = (timeStr) => {
      if (!timeStr) return "--:--";
      try {
         const parts = timeStr.split(':').map(Number);
         const h = parts[0];
         const m = parts[1];
         const s = parts[2] !== undefined ? parts[2] : 0; // Default 0 for seconds

         const ampm = h >= 12 ? 'PM' : 'AM';
         const hr = h % 12 || 12;
         const min = m < 10 ? '0' + m : m;
         const sec = s < 10 ? '0' + s : s;
         return `${hr}:${min}${parts[2] !== undefined ? `:${sec}` : ''} ${ampm}`;
      } catch (e) { return timeStr; }
   };

   const calculateHoursWorked = (log) => {
      if (!log || !log.sessions) return "0.0";
      // Sum all completed session durations (stored in minutes on backend)
      const totalMins = log.sessions.reduce((acc, sess) => acc + (sess.duration || 0), 0);
      return (totalMins / 60).toFixed(1);
   };

   const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
         if (file.size > 8 * 1024 * 1024) {
            showToast("Error", "Image must be under 8MB");
            return;
         }
         const reader = new FileReader();
         reader.onloadend = () => setNewProfilePic(reader.result);
         reader.readAsDataURL(file);
      }
   };

   const compressImage = (dataUrl) => {
      return new Promise((resolve) => {
         const img = new Image();
         img.src = dataUrl;
         img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 640; // Reduced for multi-photo stability
            const scale = Math.min(1, MAX_WIDTH / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // Quality 0.5 significantly reduces size while keeping visual clarity
            resolve(canvas.toDataURL('image/jpeg', 0.5));
         };
      });
   };


   const handleSitePhotoUpload = async (e) => {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
      
      if (validFiles.length !== files.length) {
         showToast("Error", "Some images were skipped (must be under 5MB)");
      }

      if (sitePhotos.length + validFiles.length > 5) {
         showToast("Error", "Maximum 5 photos allowed.");
         return;
      }

      setIsCompressing(true);
      let index = 0;
      for (const file of validFiles) {
         const reader = new FileReader();
         const readTask = new Promise((resolve) => {
            reader.onloadend = async () => {
               const compressed = await compressImage(reader.result);
               setSitePhotos(prev => [...prev, compressed]);
               resolve();
            };
         });
         reader.readAsDataURL(file);
         await readTask;
         index++;
      }
      setIsCompressing(false);
      if (validFiles.length === 0) setIsCompressing(false);
      e.target.value = '';
   };



   const me = (users || []).find(u => u.username === (user.admin || user.username)) || {};
   const currentPoints = fetchUserPoints(me.username);

   // Filtering logic to ensure CEOs see all entries while staff see their own
   const displayedTasks = (user.role === 'CEO' || user.role === 'Manager') ? (tasks || []) : (tasks || []).filter(t => t.assignee === user.username || t.assignee === user.admin);

   const handleAddUser = (e) => {
      e.preventDefault();
      fetch(`${API_BASE_URL}/admin/add_user`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name: newName, phone: newPhone, email: newEmail, username: newUsername, password: newPassword, role: newRole, gender: newGender, dob: newDob, profile_pic: newProfilePic })
      }).then(r => r.json()).then(res => {
         if (res.status === 'success') {
            showToast("done successfully :)", `Data saved for ${newName}`); setShowAddUserModal(false); fetchData(); clearForm();
         } else showToast("Error", res.message);
      });
   };

    const handleAddSiteLog = async (e) => {
       if (e) e.preventDefault();
       
       // Manual Validation for better feedback
       if (!siteName || !sitePhone || !siteDesc) {
          showToast("Error", "Please fill in all customer and site details.");
          return;
       }
       if (sitePhotos.length < 3 && !editingTask) {
          showToast("Error", `Evidence required: ${sitePhotos.length}/3 photos added.`);
          return;
       }

       setIsAddingTask(true);
       const isEdit = !!editingTask;
       const url = isEdit ? `${API_BASE_URL}/admin/edit_task` : `${API_BASE_URL}/admin/add_task`;
       
       let location = null;
       // Attempt Location Capture - Mandatory as per request
       if (!isEdit) {
          try {
             const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                   enableHighAccuracy: true, timeout: 8000 // 8s for mandatory lock
                });
             });
             location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
             console.log("📍 Location verified:", location);
          } catch (err) {
             console.error("GPS capture failed:", err);
             showToast("Error", "Site Location is compulsory. Please check GPS settings.");
             setIsAddingTask(false);
             return; // Stop submission
          }
       }

       const bodyData = {
          task: siteDesc,
          deadline: `${siteName} - ${sitePhone}`,
          submission_date: submissionDate || new Date().toISOString().split('T')[0],
          created_at_date: taskCreatedDate || new Date().toISOString().split('T')[0],
          location,
          site_photos: sitePhotos
       };

       if (isEdit) bodyData.task_id = editingTask._id;
       else bodyData.assignee = user.admin || user.username;

       try {
          const response = await fetch(url, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(bodyData)
          });

          const res = await response.json();

          if (response.ok && res.status === 'success') {
             showToast("Success", "Visit logged successfully!");
             await fetchData();
             setShowAddTaskModal(false);
             setEditingTask(null);
             setSiteName(''); setSitePhone(''); setSiteDesc(''); setSitePhotos([]);
          } else {
             showToast("Error", res.message || "Submission failed");
          }
       } catch (err) {
          showToast("Error", "Network connection issues. Please try again.");
       } finally {
          setIsAddingTask(false);
       }
    };



    const handleEditTaskInit = (t) => {
       setEditingTask(t);
       const [name, phone] = (t.deadline || "").split(" - ");
       setSiteName(name || "");
       setSitePhone(phone || "");
       setSiteDesc(t.task || "");
       setSubmissionDate(t.submission_date || "");
       setTaskCreatedDate(t.created_at_date || "");
       setSitePhotos(t.site_photos || (t.site_photo ? [t.site_photo] : []));
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
      fetch(`${API_BASE_URL}/admin/update_task_status`, {
         method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task_id: taskId, status: newStatus })
      }).then(r => r.json()).then(res => { if (res.status === 'success') fetchData(); });
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

   useEffect(() => {
      if (showSelfieModal) {
         // Delay slightly to ensure video element is mounted
         const timer = setTimeout(() => {
            const v = document.getElementById('selfieVideo');
            if (v && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
               navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
                  .then(stream => {
                     v.srcObject = stream;
                  })
                  .catch(err => {
                     showToast("Camera Error", "Failed to access camera. Check permissions.");
                     console.error("Camera access error:", err);
                  });
            } else if (!navigator.mediaDevices) {
               showToast("Security Alert", "Camera requires HTTPS or Localhost. Access is blocked on this Network IP.");
            }
         }, 300);
         return () => clearTimeout(timer);
      }
   }, [showSelfieModal]);

   const navToProfile = (u) => {
      setSelectedProfile(u);
      setCurrentView('Profile');
   };


   // ANALYTICS COMPONENTS
   const renderAnalytics = () => {
      const breakdown = analytics?.breakdown || { delivered: 0, processing: 0, pending: 0, total: 1 };
      const { delivered, processing, pending } = breakdown;
      const total = breakdown.total || 1;

      const gauge = analytics?.gauge || { count: 0, percentage: 0, trend: "...", trendColor: "#ccc", todayStr: "" };

      return (
         <AnalyticsGrid>
            <div className="a-card wide">
               <h3>{user.role === 'CEO' ? 'Company Lead Funnel' : 'Your Lead Funnel'}</h3>
               <div className="funnel-stats">
                  <div className="f-stat"><span className="val">{displayedTasks.length}</span><span className="lbl">Total Logs</span></div>
                  <div className="f-stat"><span className="val">{Math.round(((processing + delivered) / total) * 100)}%</span><span className="lbl">Action Rate</span></div>
                  <div className="f-stat"><span className="val" style={{ color: '#10b981' }}>{Math.round((delivered / total) * 100)}%</span><span className="lbl">Delivery Success</span></div>
               </div>
               <div className="chart-bg green-gradient"></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div className="a-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{user.role === 'CEO' ? 'Overall Productivity' : 'Performance Level'}</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>
                     {user.role === 'CEO' ? `${displayedTasks.length} Tasks` : `Lv. ${calculateLevel(fetchUserPoints(me.username))}`}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}>
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                     <span>+15% efficiency</span>
                  </div>
               </div>
               <div className="a-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>Avg. Clearance</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>
                     4.2 Days
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}>
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                     <span>+8.2% from last month</span>
                  </div>
               </div>
            </div>

            <div className="a-card wide pt-stat" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
               <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ margin: 0 }}>Productivity Gauge</h3>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Live: {gauge.todayStr}</span>
               </div>

               <div className="gauge-container">
                  <svg viewBox="0 0 100 50" className="gauge-svg">
                     {/* Background Arc */}
                     <path d="M10,45 A40,40 0 0,1 90,45" fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />
                     {/* Progress Arc */}
                     <path d="M10,45 A40,40 0 0,1 90,45" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${gauge.percentage * 1.26}, 126`} style={{ transition: 'stroke-dasharray 1s ease-out' }} />
                  </svg>
                  <div className="gauge-content">
                     <div className="gauge-val">{gauge.count}</div>
                     <div className="gauge-label">Tasks Today</div>
                     <div className="gauge-trend" style={{ color: gauge.trendColor }}>{gauge.trend}</div>
                  </div>
               </div>

               <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                     <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '2px' }}></div> Total Created Today
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                     <div style={{ width: '12px', height: '12px', background: '#e5e7eb', borderRadius: '2px' }}></div> Daily Target (10)
                  </div>
               </div>
            </div>

            <div className="a-card wide pt-stat">
               <h3>Status Breakdown</h3>
               <div className="status-bars">
                  <div className="sb-row">
                     <label>Delivered ({delivered})</label>
                     <div className="sb-bg"><div className="sb-fill" style={{ width: `${(delivered / total) * 100}%`, background: '#10b981' }}></div></div>
                  </div>
                  <div className="sb-row">
                     <label>Processing ({processing})</label>
                     <div className="sb-bg"><div className="sb-fill" style={{ width: `${(processing / total) * 100}%`, background: '#f59e0b' }}></div></div>
                  </div>
                  <div className="sb-row">
                     <label>Pending ({pending})</label>
                     <div className="sb-bg"><div className="sb-fill" style={{ width: `${(pending / total) * 100}%`, background: '#9ca3af' }}></div></div>
                  </div>
               </div>
            </div>
         </AnalyticsGrid>
      );
   };

   const renderLeads = () => {
      return (
         <div className="tracker-view">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
               <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#111827' }}>Client Leads (Inquiries)</h1>
               <div style={{ background: '#ecfdf5', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 800 }}>
                  {inquiries.length} TOTAL LEADS
               </div>
            </div>
            <div className="staff-tracker-grid">
               {inquiries.length === 0 ? (
                  <div className="a-card wide" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                     <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📩</div>
                     <h3>No Leads Yet</h3>
                     <p style={{ color: '#6b7280' }}>When clients fill the contact form on your website, they will appear here instantly.</p>
                  </div>
               ) : inquiries.map((lead, i) => (
                  <div key={i} className="staff-loc-card" style={{ alignItems: 'flex-start', textAlign: 'left', padding: '1.5rem' }}>
                     <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', width: '100%' }}>
                        <div className="sl-avatar" style={{ marginBottom: 0, width: '45px', height: '45px', fontSize: '1.1rem', background: '#10b981', color: 'white' }}>{lead.interest[0]}</div>
                        <div style={{ flex: 1 }}>
                           <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{lead.name}</h3>
                           <p style={{ margin: 0, color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>{lead.interest}</p>
                        </div>
                     </div>
                     <div className="sl-info" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                           <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.95rem', color: '#374151' }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                              {lead.phone}
                           </p>
                           {lead.email && (
                              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.95rem', color: '#374151' }}>
                                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                 {lead.email}
                              </p>
                           )}
                           <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>RECEIVED: {lead.timestamp}</p>
                        </div>
                     </div>
                     <a
                        href={`tel:${lead.phone}`}
                        className="btn-gmaps"
                        style={{ width: '100%', justifyContent: 'center', background: '#111827', marginTop: '1.5rem', border: 'none' }}
                     >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                        Call Client Now
                     </a>
                  </div>
               ))}
            </div>
         </div>
      );
   };

   const renderAttendance = () => {
      return (
         <div className="attendance-view" style={{ paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
               <div>
                  <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#111827' }}>Attendance Ledger</h1>
                  <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>Daily clock-in & clock-out logs for all enterprise team members.</p>
               </div>
               <div style={{ background: 'white', padding: '0.8rem 1.2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Select Log Date:</label>
                  <input
                     type="date"
                     value={attendanceFilter}
                     onChange={(e) => setAttendanceFilter(e.target.value)}
                     style={{ border: '1px solid #e5e7eb', padding: '0.4rem 0.6rem', borderRadius: '6px', outline: 'none', fontSize: '0.9rem' }}
                  />
               </div>
            </div>

            <div className="a-card wide" style={{ padding: 0, overflow: 'hidden' }}>
               <div className="table-responsive">
                  <table className="modern-table">
                     <thead>
                        <tr>
                           <th>Staff Member</th>
                           <th>Entry Time</th>
                           <th>Exit Time</th>
                           <th>Total Hours</th>
                           <th>Selfie</th>
                           <th>Shift Status</th>
                           <th>Date</th>
                        </tr>
                     </thead>
                     <tbody>
                        {attendanceLogs.length === 0 ? (
                           <tr><td colSpan="7" className="empty-state" style={{ padding: '4rem' }}>No clocking activity recorded for this date.</td></tr>
                        ) : attendanceLogs.map((log, i) => (
                           <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => setSelectedStaffLog(log)}>
                              <td style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1.2rem 1rem', fontWeight: 600, color: '#111827' }}>
                                 <div className="sl-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem', margin: 0, background: '#f3f4f6', color: '#111827' }}>{log.name ? log.name[0] : '?'}</div>
                                 <span style={{ color: '#10b981', textDecoration: 'underline' }}>{log.name || 'Unknown Staff'}</span>
                              </td>
                              <td style={{ color: '#10b981', fontWeight: 600 }}>{formatTime12h(log.clock_in)}</td>
                              <td style={{ color: '#ef4444', fontWeight: 600 }}>{formatTime12h(log.clock_out)}</td>
                              <td style={{ fontWeight: 700, color: '#111827' }}>{calculateHoursWorked(log)} HR</td>
                              <td>
                                 <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    {log.clock_in_selfie && (
                                       <button
                                          onClick={(e) => { e.stopPropagation(); setViewingSelfie(log.clock_in_selfie); }}
                                          style={{ background: '#10b981', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(16,185,129,0.2)' }}
                                          title="View Clock-in Selfie"
                                       >
                                          <EyeIcon show={false} />
                                       </button>
                                    )}
                                    {log.clock_out_selfie && (
                                       <button
                                          onClick={(e) => { e.stopPropagation(); setViewingSelfie(log.clock_out_selfie); }}
                                          style={{ background: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(239,68,68,0.2)' }}
                                          title="View Clock-out Selfie"
                                       >
                                          <EyeIcon show={false} />
                                       </button>
                                    )}
                                    {log.route_trace && log.route_trace.length > 0 ? (
                                       <button
                                          onClick={(e) => { e.stopPropagation(); setViewingRoute(log.route_trace); setTraceUser(log.name); }}
                                          style={{ background: '#10b981', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(16,185,129,0.4)' }}
                                          title={`View ${log.route_trace.length} Travel Pulse(s)`}
                                       >
                                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                       </button>
                                    ) : (
                                       <button
                                          style={{ background: '#e5e7eb', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'not-allowed', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                          title="No movement data yet"
                                          disabled
                                       >
                                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                       </button>
                                    )}
                                 </div>
                              </td>
                              <td>
                                 {(() => {
                                    const hours = parseFloat(calculateHoursWorked(log));
                                    const isComplete = hours >= 7;
                                    const isOngoing = log.clock_in && !log.clock_out;

                                    let label = "NO LOG";
                                    let bg = "#f3f4f6";
                                    let text = "#374151";

                                    if (isOngoing) {
                                       label = "SHIFT ACTIVE"; bg = "#fffbeb"; text = "#f59e0b";
                                    } else if (log.clock_out) {
                                       if (isComplete) {
                                          label = "COMPLETED (7HR+)"; bg = "#ecfdf5"; text = "#10b981";
                                       } else {
                                          label = "UNDER HOURS"; bg = "#fff1f2"; text = "#ef4444";
                                       }
                                    }

                                    return (
                                       <span style={{ padding: '0.3rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: bg, color: text }}>
                                          {label}
                                       </span>
                                    );
                                 })()}
                              </td>
                              <td style={{ fontSize: '0.85rem', color: '#6b7280' }}>{log.date}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      );
   };

   const renderVisitLogs = () => {
      const logs = displayedTasks;
      return (
         <div className="table-section" style={{ minHeight: '80vh', background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div className="table-header">
               <div>
                  <h2 style={{ fontSize: '1.8rem', color: '#111827' }}>Visit Evidence Logs</h2>
                  <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Full audit trail of all site visits and activities</p>
               </div>
               <div className="table-actions">
                  <button className="primary-btn" onClick={() => setShowAddTaskModal(true)}>+ New Visit Log</button>
               </div>
            </div>
            <div className="table-responsive mt">
               <table className="modern-table">
                  <thead><tr><th>Submit Date</th><th>Activity Details</th><th>Staff</th><th>Customer INFO</th><th>Site Location</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                     {logs.map((t, i) => (
                        <tr key={i} onClick={() => setFocusedTask(t)} style={{ cursor: 'pointer' }}>
                           <td className="date-col">{t.submission_date || 'Today'}</td>
                           <td className="bold">{t.task}</td>
                           <td className="emp-col" onClick={(e) => {
                              e.stopPropagation();
                              const emp = users.find(u => u.username === t.assignee);
                              if (emp) navToProfile(emp);
                           }} style={{ cursor: 'pointer' }}>@{t.assignee}</td>
                           <td className="info-col">{t.deadline}</td>
                           <td>
                              {t.location ? (
                                 <a 
                                    href={`https://www.google.com/maps?q=${t.location.lat},${t.location.lng}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ 
                                       background: '#ecfdf5', 
                                       color: '#10b981', 
                                       padding: '6px 12px', 
                                       borderRadius: '8px', 
                                       fontSize: '0.75rem', 
                                       fontWeight: 800, 
                                       textDecoration: 'none', 
                                       display: 'inline-flex', 
                                       alignItems: 'center', 
                                       gap: '6px',
                                       border: '1px solid #10b981'
                                    }}
                                 >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    VIEW SITE
                                 </a>
                              ) : <span style={{ color: '#9ca3af' }}>No GPS</span>}
                           </td>
                           <td onClick={(e) => e.stopPropagation()}>
                              <span className={`status-pill ${(t.status || 'Pending').toLowerCase()}`}>{t.status || 'Pending'}</span>
                           </td>
                           <td style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                              <button className="action-toggle" onClick={() => setActiveTaskMenu(activeTaskMenu === t._id ? null : t._id)}>
                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
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
                     {logs.length === 0 && <tr><td colSpan="6" className="empty-state">No visit logs found.</td></tr>}
                  </tbody>
               </table>
            </div>
         </div>
      );
   };

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
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
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
                           <path className="circle" strokeDasharray={`${Math.min((pPts / 1000) * 100, 100)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
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

   return (
      <DLayout>
         {toast.visible && <ToastPopup title={toast.title} message={toast.message} onClose={() => setToast({ ...toast, visible: false })} />}

         {/* SIDEBAR */}
         <Sidebar className={sidebarOpen ? 'open' : ''}>
            <div className="mobile-close" onClick={() => setSidebarOpen(false)}>×</div>
            <div className="logo-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
               <img src="/company_logo.jpg" alt="Delta UPVC" className="company-logo" style={{ height: '60px', width: 'auto', marginBottom: '1rem' }} />
               <h2 className="logo-text" style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: '1px' }}>DELTA UPVC</h2>
               <span className="logo-subtitle" style={{ fontSize: '0.8rem', opacity: 0.8, letterSpacing: '2px' }}>WINDOWS</span>
            </div>

            <div className="nav-group">
               <div className={`nav-item ${currentView === 'Overview' ? 'active' : ''}`} onClick={() => { setCurrentView('Overview'); setFocusedTask(null); setSidebarOpen(false); }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                  Overview
               </div>

                <div className={`nav-item ${currentView === 'Reports' ? 'active' : ''}`} onClick={() => { setCurrentView('Reports'); setFocusedTask(null); setSidebarOpen(false); }}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" /></svg>
                   Analytics
                </div>
                
                <div className={`nav-item ${currentView === 'VisitLogs' ? 'active' : ''}`} onClick={() => { setCurrentView('VisitLogs'); setFocusedTask(null); setSidebarOpen(false); }}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                   Visit Reports
                </div>
               {user.role !== 'Manager' && (
                  <div className="nav-item" onClick={() => setShowAddTaskModal(true)}>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                     Log Visit
                  </div>
               )}
               {(user.role === 'CEO' || user.role === 'Manager') && (
                  <>
                     <div className={`nav-item ${currentView === 'Leads' ? 'active' : ''}`} onClick={() => { setCurrentView('Leads'); setFocusedTask(null); setSidebarOpen(false); }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                        Leads
                     </div>
                     <div className={`nav-item ${currentView === 'Attendance' ? 'active' : ''}`} onClick={() => { setCurrentView('Attendance'); setFocusedTask(null); setSidebarOpen(false); }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        Attendance
                     </div>
                     <div className="nav-item" onClick={() => setShowAddUserModal(true)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                        Add Staff
                     </div>
                  </>
               )}
            </div>

            <div className="bottom-menu">
               <a href="#" onClick={onLogout} style={{ color: '#ef4444' }}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5a2 2 0 0 0-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" /></svg> Logout</a>
            </div>
         </Sidebar>

         <MainArea>
            <TopNav>
               <div className="burger-toggle" onClick={() => setSidebarOpen(true)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
               </div>
               <div className="nav-links">
                  <span className={currentView === 'Overview' && !selectedProfile ? 'active' : ''} onClick={() => { setCurrentView('Overview'); setSelectedProfile(null); }}>Dashboard</span>
                  <span className={currentView === 'VisitLogs' ? 'active' : ''} onClick={() => { setCurrentView('VisitLogs'); setSelectedProfile(null); }}>Visit Reports</span>
                  <span className={currentView === 'Reports' ? 'active' : ''} onClick={() => { setCurrentView('Reports'); setSelectedProfile(null); }}>Analytics</span>
               </div>
               <div className="user-profile" onClick={() => navToProfile(me)}>
                  <div className="avatar">
                     {me.profile_pic ? <img src={me.profile_pic} alt="dp" /> : (user?.role?.[0] || (user?.username || user || "U")[0]).toUpperCase()}
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

               {selectedStaffLog ? (
                  <div className="staff-detail-keka" style={{ padding: '2rem 1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: '#111827' }}>
                        <button onClick={() => setSelectedStaffLog(null)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', color: '#10b981' }}>
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        </button>
                        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{selectedStaffLog.username === user.username ? 'My Attendance Report' : `Attendance Audit - ${selectedStaffLog.name}`}</h2>
                     </div>
                     <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Detailed Location History (Real-time Logs)</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                           {locationHistory.length === 0 ? (
                               <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', padding: '1rem' }}>No detailed location pulses recorded yet.</p>
                           ) : locationHistory.map((p, pidx) => (
                              <div key={pidx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f9fafb', borderRadius: '10px', border: '1px solid #f1f5f9', borderLeft: '4px solid #10b981' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>{locationHistory.length - pidx}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>Location Pulse</span>
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Verified at {formatTime12h(p.time)}</span>
                                    </div>
                                 </div>
                                 <a href={`https://www.google.com/maps?q=${p.lat},${p.lng}`} target="_blank" rel="noreferrer" style={{ background: '#111827', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none' }}>MAP ➔</a>
                              </div>
                           ))}
                        </div>
                     </div>

                     <button className="primary-btn" style={{ width: '100%', padding: '1.2rem', fontWeight: 800 }} onClick={() => setSelectedStaffLog(null)}>Back to Dashboard</button>
                  </div>
               ) : (
                  <>
                     {focusedTask && (
                        <TaskDetailView
                           task={focusedTask}
                           onBack={() => setFocusedTask(null)}
                        />
                     )}

                     {!focusedTask && currentView === 'Tracker' && <StaffTracker />}
                     {!focusedTask && currentView === 'Reports' && !selectedProfile && renderAnalytics()}
                     {!focusedTask && currentView === 'Leads' && (user.role === 'CEO' || user.role === 'Manager') && renderLeads()}
                     {!focusedTask && currentView === 'Attendance' && renderAttendance()}
                     {!focusedTask && currentView === 'Profile' && selectedProfile && renderProfile()}

                     {currentView === 'VisitLogs' && !focusedTask && !selectedProfile && renderVisitLogs()}
               {!focusedTask && currentView === 'Overview' && !selectedProfile && (() => {
                        const myLog = (attendanceLogs || []).find(l => (l.username === me.username) && (l.date === new Date().toLocaleString('sv-SE').split(' ')[0]));
                        return (
                           <>
                              <div className="greeting">
                                 <h1>Good Morning, {me.name?.split(' ')[0] || user.admin || user.username}</h1>
                                 <p>Stay on top of your tasks, monitor progress, and track status.</p>
                              </div>

                              <div className="metrics-grid">
                                 <MetricCard className="profile-metric" onClick={() => navToProfile(me)} style={{ cursor: 'pointer' }}>
                                    <div className="metric-header" style={{ marginBottom: 0 }}>
                                       <h3>Your Profile</h3>
                                       <span className="icon-btn">View full ➔</span>
                                    </div>
                                    <div className="profile-summary">
                                       <div className="huge-avatar">
                                          {topEmp && topEmp.username === me.username && <div className="p-crown" style={{ top: '-8px', right: '-8px', fontSize: '1rem' }}>👑</div>}
                                          {me.profile_pic ? <img src={me.profile_pic} alt="dp" /> : (user.admin || user.username || 'U')[0].toUpperCase()}
                                       </div>
                                       <div className="profile-data">
                                          <h4>{me.name || user.admin || user.username}</h4>
                                          <div className="badge">{user.role}</div>
                                          <p>{me.gender && `${me.gender} • `}{me.dob && `Born ${me.dob}`}</p>
                                       </div>
                                    </div>
                                    {(user.role !== 'Manager' && user.role !== 'CEO') && (
                                       <>
                                          <div className="level-box">
                                             <div className="level-flex">
                                                <span>Level {calculateLevel(currentPoints)}</span>
                                                <span>{currentPoints} Pts</span>
                                             </div>
                                             <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${getProgress(currentPoints)}%` }}></div>
                                             </div>
                                             <p className="hint">Next Level at {(calculateLevel(currentPoints)) * 70} Pts (Req: 70)</p>
                                          </div>
                                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                                             <button
                                                className="primary-btn"
                                                style={{ flex: 1, background: me.attendance_status === 'online' ? '#111827' : '#10b981', fontSize: '0.75rem', padding: '0.6rem' }}
                                                onClick={(e) => { e.stopPropagation(); handleAttendance('online'); }}
                                                disabled={me.attendance_status === 'online'}
                                             >
                                                {me.attendance_status === 'online' ? '✅ Clocked In' : '🕒 Clock In'}
                                             </button>
                                             <button
                                                className="btn-cancel"
                                                style={{ flex: 1, fontSize: '0.75rem', padding: '0.6rem' }}
                                                onClick={(e) => { e.stopPropagation(); handleAttendance('offline'); }}
                                                disabled={me.attendance_status === 'offline' || !me.attendance_status}
                                             >
                                                Logout (Clock Out)
                                             </button>
                                          </div>
                                          <div style={{ marginTop: '1rem', background: '#f9fafb', padding: '0.8rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                             <div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>SHIFT DURATION</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{myLog ? `${calculateHoursWorked(myLog)} HOURS` : 'SHIFT IN PROGRESS'}</div>
                                             </div>
                                             <div
                                                onClick={(e) => { e.stopPropagation(); if (myLog) setSelectedStaffLog(myLog); }}
                                                style={{ background: 'white', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '2rem', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                             >
                                                {myLog ? 'VIEW HISTORY' : 'NOT CLOCKED IN'}
                                             </div>
                                          </div>
                                       </>
                                    )}
                                 </MetricCard>

                                 <MetricCard className="green-gradient">
                                    <div className="metric-header">
                                       <h3 style={{ color: 'white' }}>{user.role === 'CEO' ? 'Total Logistics' : 'Active Leads Logged'}</h3>
                                       <span className="card-icon">📋</span>
                                    </div>
                                    <h2>{displayedTasks.length}</h2>
                                    <div className="trend" style={{ color: 'white' }}>System metrics flowing</div>
                                 </MetricCard>

                                 <MetricCard>
                                    <div className="metric-header">
                                       <h3>Network Strength</h3>
                                       <span className="card-icon">🏢</span>
                                    </div>
                                    <h2>{users.length} Staff</h2>
                                    <div className="trend up" style={{ color: '#10b981' }}>Across Delta UPVC</div>
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
                                                {isLeader && <span className="p-crown" style={{ position: 'absolute', marginTop: '-25px', marginLeft: '-5px', fontSize: '14px' }}>👑</span>}
                                                <img src={staff.profile_pic || 'https://i.pravatar.cc/150'} alt="avatar" style={isLeader ? { border: '2px solid #fbbf24' } : {}} />
                                                <div className="staff-details">
                                                   <strong>{staff.name || staff.username}</strong>
                                                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: staff.attendance_status === 'online' ? '#10b981' : '#9ca3af' }}></div>
                                                      <span style={{ fontSize: '10px', color: staff.attendance_status === 'online' ? '#10b981' : '#6b7280', fontWeight: 700 }}>
                                                         {staff.attendance_status === 'online' ? 'ONLINE' : 'OFFLINE'}
                                                      </span>
                                                   </div>
                                                   <span>{fetchUserPoints(staff.username)} Pts</span>
                                                </div>
                                             </div>
                                          )
                                       })}
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
                                          {displayedTasks.slice(0, 8).map((t, i) => (
                                             <tr key={i} onClick={() => setFocusedTask(t)} style={{ cursor: 'pointer' }}>
                                                <td className="date-col">{t.submission_date || 'Today'}</td>
                                                <td className="bold">{t.task}</td>
                                                <td className="emp-col" onClick={(e) => {
                                                   e.stopPropagation();
                                                   const emp = users.find(u => u.username === t.assignee);
                                                   if (emp) navToProfile(emp);
                                                }} style={{ cursor: 'pointer' }}>@{t.assignee}</td>
                                                <td className="info-col">{t.deadline}</td>
                                                <td onClick={(e) => e.stopPropagation()}>
                                                   {(user.role === 'CEO' || user.role === 'Manager') ? (
                                                      <select className={`status-pill ${(t.status || 'Pending').toLowerCase()}`} value={t.status || 'Pending'} onChange={(e) => handleUpdateTaskStatus(t._id, e.target.value)}>
                                                         <option value="Pending">Pending</option><option value="Processing">Processing</option><option value="Delivered">Delivered</option>
                                                      </select>
                                                   ) : (<span className={`status-pill ${(t.status || 'Pending').toLowerCase()}`}>● {t.status || 'Pending'}</span>)}
                                                </td>
                                                <td style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                                                   <button className="action-toggle" onClick={() => setActiveTaskMenu(activeTaskMenu === t._id ? null : t._id)}>
                                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                         <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
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
                        );
                     })()}
                  </>
               )}
            </Content>
         </MainArea>
         {showSelfieModal && (
            <div className="modal-overlay" style={{ zIndex: 2000 }}>
               <div className="modal-card" style={{ maxWidth: '400px', width: '90%' }}>
                  <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Selfie Verification</h2>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1.5rem' }}>Please maintain a clear face for {selfieType === 'online' ? 'Clock-In' : 'Clock-Out'}.</p>
                  <div className="camera-box" style={{ background: '#000', borderRadius: '12px', overflow: 'hidden', aspectRatio: '3/4', position: 'relative' }}>
                     <video 
                        id="selfieVideo" 
                        autoPlay 
                        playsInline 
                        muted 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                     />

                     {isCapturing && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                           Processing...
                        </div>
                     )}
                  </div>

                  <div className="modal-actions mt">
                     <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => {
                           const v = document.getElementById('selfieVideo');
                           if (v && v.srcObject) {
                              v.srcObject.getTracks().forEach(t => t.stop());
                           }
                           setShowSelfieModal(false);
                        }}
                     >
                        Cancel
                     </button>
                     <button
                        type="button"
                        className="primary-btn"
                        style={{ flex: 1 }}
                        onClick={() => {
                           const video = document.getElementById('selfieVideo');
                           if (!video || !video.srcObject) {
                              showToast("Wait", "Camera is not ready yet!");
                              return;
                           }
                           const canvas = document.createElement('canvas');
                           canvas.width = video.videoWidth;
                           canvas.height = video.videoHeight;
                           canvas.getContext('2d').drawImage(video, 0, 0);
                           const base64 = canvas.toDataURL('image/jpeg', 0.6); // Slightly lower quality for network speed

                           // Stop camera
                           video.srcObject?.getTracks().forEach(t => t.stop());

                           completeAttendanceWithSelfie(base64);
                        }}
                        disabled={isCapturing}
                     >
                        Capture & {selfieType === 'online' ? 'Clock In' : 'Clock Out'}
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* PHOTO POPUP VIEWER */}
         {viewingSelfie && (
            <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={() => setViewingSelfie(null)}>
               <div className="modal-card" style={{ maxWidth: '450px', background: 'transparent', boxShadow: 'none', padding: 0 }}>
                  <img src={viewingSelfie} style={{ width: '100%', borderRadius: '12px', border: '4px solid white' }} alt="Selfie Log" />
                  <p style={{ color: 'white', textAlign: 'center', marginTop: '1rem', fontWeight: 600 }}>Selfie Audit Log (Captured in Cloud)</p>
               </div>
            </div>
         )}

         {/* ROUTE TRACKER VIEWER */}
         {viewingRoute && (
            <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={() => setViewingRoute(null)}>
               <div className="modal-card" style={{ maxWidth: '400px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                     <div>
                        <h2 style={{ fontSize: '1.2rem', color: '#111827', margin: 0 }}>Travel Route: {traceUser}</h2>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.3rem' }}>Daily movement pulses (every 15 mins)</p>
                     </div>
                     <button className="close" onClick={() => setViewingRoute(null)}>×</button>
                  </div>

                  <div className="route-list" style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     {viewingRoute.filter((node, idx, self) =>
                        self.findIndex(t => t.time === node.time) === idx
                     ).map((node, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ background: '#111827', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>{idx + 1}</div>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formatTime12h(node.time)} Signal</span>
                           </div>
                           <a
                              href={`https://www.google.com/maps?q=${node.lat},${node.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ background: '#10b981', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}
                           >
                              Open in Maps
                           </a>
                        </div>
                     )).reverse()}
                  </div>

                  <div className="modal-actions mt">
                     <button className="primary-btn" style={{ width: '100%' }} onClick={() => setViewingRoute(null)}>Close Route History</button>
                  </div>
               </div>
            </div>
         )}

         {/* APP UPDATE OVERLAY (Using User's Premium Card Design) */}
         {newUpdateAvailable && (
            <UpdateOverlay>
               <div className="card">
                  <div className="icon">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke="#ffffff" d="M20 14V17.5C20 20.5577 16 20.5 12 20.5C8 20.5 4 20.5577 4 17.5V14M12 15L12 3M12 15L8 11M12 15L16 11" /></svg>
                  </div>
                  <div className="content">
                     <span className="title">New Update Live!</span>
                     <div className="desc">A new version of Delta UPVC is available with fixes & features.</div>
                     <div className="actions">
                        <button onClick={() => window.location.reload(true)} className="download">Update App</button>
                        <button onClick={() => setNewUpdateAvailable(false)} className="notnow">Not now</button>
                     </div>
                  </div>
                  <button type="button" className="close" onClick={() => setNewUpdateAvailable(false)}>
                     <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
               </div>
            </UpdateOverlay>
         )}

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
                        
                        <div className="input-group mt">
                           <label style={{ color: '#10b981', fontWeight: 800 }}>📸 Site Photos (Min 3, Max 5)</label>
                           <input type="file" accept="image/*" multiple onChange={handleSitePhotoUpload} />

                           
                           {sitePhotos.length > 0 && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', marginTop: '1rem' }}>
                                 {sitePhotos.map((p, idx) => (
                                    <div key={idx} style={{ position: 'relative', aspectRatio: '1/1' }}>
                                       <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} alt="Site preview" />
                                       <button 
                                          type="button" 
                                          onClick={() => setSitePhotos(prev => prev.filter((_, i) => i !== idx))}
                                          style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                       >
                                          ×
                                       </button>
                                    </div>
                                 ))}
                              </div>
                           )}
                           <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.3rem' }}>
                              * {sitePhotos.length}/5 photos added. {3 - sitePhotos.length > 0 ? `${3 - sitePhotos.length} more required.` : "Requirement met."}
                           </p>
                           <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>* Location will be automatically captured upon submission.</p>
                        </div>

                        <div className="grid-2 mt">
                           <div className="input-group"><label>Task Created Date (Sync)</label><input type="date" value={taskCreatedDate} onChange={(e) => setTaskCreatedDate(e.target.value)} required /></div>
                           <div className="input-group"><label>Submission Date</label><input type="date" value={submissionDate} onChange={(e) => setSubmissionDate(e.target.value)} required /></div>
                        </div>
                        <div className="modal-actions mt">
                           <button type="button" className="btn-cancel" onClick={() => { setShowAddTaskModal(false); setEditingTask(null); setSitePhotos([]); }}>Cancel</button>
                           <button type="submit" className="btn-submit" disabled={isAddingTask || isCompressing || sitePhotos.length < (editingTask ? 0 : 3)}>
                              {isAddingTask ? 'Uploading Evidence...' : isCompressing ? 'Optimizing Images...' : (editingTask ? 'Apply Changes' : 'Submit Visit Details')}
                           </button>
                        </div>
                     </form>
                  )}

                  {(showAddUserModal || showEditModal) && (
                     <form onSubmit={showEditModal ? handleUpdateUser : handleAddUser}>
                        <div className="grid-2 mt">
                           <div className="input-group"><label>Full Name</label><input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required={!showEditModal} /></div>
                           <div className="input-group"><label>Phone</label><input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} required={!showEditModal} /></div>
                           <div className="input-group"><label>Email</label><input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></div>
                           <div className="input-group"><label>Username</label><input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required readOnly={showEditModal} /></div>
                           <div className="input-group"><label>Password {showEditModal && '(leave blank to map old)'}</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required={!showEditModal} /></div>
                           <div className="input-group"><label>Role / Level</label><select value={newRole} onChange={(e) => setNewRole(e.target.value)} disabled={showEditModal && user.role !== 'CEO'}><option value="Employe">Employe</option><option value="Manager">Manager</option><option value="CEO">CEO</option></select></div>
                           <div className="input-group"><label>Gender</label><select value={newGender} onChange={(e) => setNewGender(e.target.value)}><option value="">Select...</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                           <div className="input-group"><label>Date of Birth</label><input type="date" value={newDob} onChange={(e) => setNewDob(e.target.value)} /></div>
                        </div>
                        <div className="input-group mt"><label>Profile Picture (Max 8MB)</label><input type="file" accept="image/*" onChange={handleImageUpload} />{newProfilePic && <img src={newProfilePic} style={{ marginTop: '10px', height: '60px', width: '60px', borderRadius: '50%', objectFit: 'cover' }} alt="preview" />}</div>
                        <div className="modal-actions mt"><button type="button" className="btn-cancel" onClick={() => { setShowAddUserModal(false); setShowEditModal(false); clearForm(); }}>Cancel</button><button type="submit" className="btn-submit">{showEditModal ? 'Update Profile' : 'Add Employee'}</button></div>
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
  .modal-card { background: white; padding: 2rem; border-radius: 1rem; width: 95%; max-width: 600px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-height: 90vh; overflow-y: auto; }
  
  @media (max-width: 600px) {
    .modal-card { padding: 1.5rem 1rem; }
  }

  .modal-card h2 { margin-bottom: 1.5rem; color: #1f2937; font-size: 1.5rem; }
  .input-group { display: flex; flex-direction: column; gap: 0.4rem; }
  .input-group label { font-size: 0.8rem; font-weight: 600; color: #4b5563; }
  .input-group input, .input-group select { padding: 0.7rem; border: 1px solid #d1d5db; border-radius: 0.5rem; outline: none; background: #f9fafb; transition: all 0.2s; font-size: 1rem; width: 100%; }
  .input-group input:focus, .input-group select:focus { border-color: #10b981; background: white; }
  .mt { margin-top: 1rem; } 
  
  .grid-2 { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 1rem; 
  }

  @media (max-width: 600px) {
    .grid-2 { grid-template-columns: 1fr; }
    .modal-actions { flex-direction: column-reverse; }
    .modal-actions button { width: 100%; }
  }

  .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; }
  .btn-cancel { padding: 0.8rem 1.2rem; border-radius: 0.5rem; border: none; background: #e5e7eb; color: #4b5563; cursor: pointer; font-weight: 600; min-height: 48px; }
  .btn-submit { padding: 0.8rem 1.2rem; border-radius: 0.5rem; border: none; background: #10b981; color: white; cursor: pointer; font-weight: 600; min-height: 48px; }
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

  .mobile-close {
    display: none;
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    font-size: 2rem;
    color: #6b7280;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    position: fixed;
    top: 0; 
    left: 0;
    height: 100vh;
    z-index: 2000;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 20px 0 50px rgba(0,0,0,0.1);

    &.open {
      transform: translateX(0);
    }

    .mobile-close {
      display: block;
    }
  }
`;

const MainArea = styled.div` 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  overflow: hidden; 
  background: #f9fafb;
`;

const TopNav = styled.div`
  height: 70px; background: white; display: flex; align-items: center; justify-content: space-between; padding: 0 2rem;
  border-bottom: 1px solid #f3f4f6;

  .burger-toggle {
    display: none;
    cursor: pointer;
    color: #6b7280;
  }

  .nav-links { display: flex; gap: 1.5rem; }
  .nav-links span { color: #6b7280; font-weight: 500; cursor: pointer; transition: color 0.2s; }

  @media (max-width: 768px) {
     padding: 0 1rem;
     .burger-toggle { display: block; }
     .nav-links { display: none; }
  }
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

  @media (max-width: 1024px) {
    .metrics-grid { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    
    .greeting h1 { font-size: 1.5rem; }
    .metrics-grid { grid-template-columns: 1fr; gap: 1rem; }
    
    .table-section { padding: 1rem; }
    .modern-table th, .modern-table td { padding: 0.75rem; font-size: 0.8rem; }
    
    .ceo-overview { padding: 1rem; }
    .employee-list { gap: 0.5rem; }
  }

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

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    .pt-stat { grid-column: span 1; }
    .funnel-stats { flex-wrap: wrap; gap: 1.5rem; }
    .gauge-container { width: 100%; max-width: 300px; margin: 0 auto; }
  }
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

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    .prof-left { margin-bottom: 1.5rem; }
  }

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

const UpdateOverlay = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;
  animation: slideUp 0.5s ease-out;

  @keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  @media (max-width: 600px) {
     right: 1rem; bottom: 1rem; left: 1rem;
     .card { max-width: none !important; width: 100%; }
  }

  .card {
    max-width: 320px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-radius: 1rem;
    background: #111827;
    background: linear-gradient(to right top, #111827, #374151);
    padding: 1.2rem;
    color: white;
    box-shadow: 0px 20px 40px rgba(0,0,0,0.4);
    border: 1px solid rgba(255,255,255,0.1);
  }

  .icon {
    height: 2.5rem; width: 2.5rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    border-radius: 0.8rem; background-color: #10b981; color: white;
  }
  .icon svg { height: 1.5rem; width: 1.5rem; }

  .content { margin-left: 1rem; font-size: 0.875rem; line-height: 1.4; }
  .title { margin-bottom: 0.3rem; font-size: 1rem; font-weight: 700; color: white; display: block; }
  .desc { margin-bottom: 1rem; font-size: 0.85rem; color: #d1d5db; }

  .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
  .download, .notnow {
    width: 100%; border-radius: 0.6rem; padding: 0.6rem; text-align: center; font-size: 0.75rem;
    color: white; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: 0.2s;
  }
  .download { background-color: #10b981; font-weight: 700; border: none; }
  .download:hover { background-color: #059669; }
  .notnow { background-color: transparent; font-weight: 600; }
  .notnow:hover { background-color: rgba(255,255,255,0.1); }

  .close { background: none; border: none; color: #9ca3af; cursor: pointer; margin-left: 0.5rem; }
  .close svg { height: 1.25rem; width: 1.25rem; }
`;
export default Dashboard;

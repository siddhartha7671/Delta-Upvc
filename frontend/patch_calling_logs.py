import re

file_path = r"m:\porject1\frontend\src\components\Dashboard.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. State
content = content.replace(
    "const [showAddTaskModal, setShowAddTaskModal] = useState(false);",
    "const [showAddTaskModal, setShowAddTaskModal] = useState(false);\n   const [showAddCallModal, setShowAddCallModal] = useState(false);"
)

content = content.replace(
    "if (showAddTaskModal) {",
    "if (showAddTaskModal || showAddCallModal) {"
)
content = content.replace(
    "}, [showAddTaskModal]);",
    "}, [showAddTaskModal, showAddCallModal]);"
)

content = content.replace(
    "const [isLocating, setIsLocating] = useState(false);",
    "const [isLocating, setIsLocating] = useState(false);\n    const [callPlace, setCallPlace] = useState('');"
)

# 2. handleAddCallLog
add_call_log_code = """
    const handleAddCallLog = async (e) => {
       if (e) e.preventDefault();
       
       if (!siteName || !sitePhone || !siteDesc || !callPlace) {
          showToast("Error", "Please fill in all details (Name, Phone, Place, Desc).");
          return;
       }

       setIsAddingTask(true);
       const url = `${API_BASE_URL}/admin/add_task`;
       
       const bodyData = {
          type: 'online_call',
          task: siteDesc,
          deadline: `${siteName} - ${sitePhone}`,
          place: callPlace,
          submission_date: submissionDate || new Date().toISOString().split('T')[0],
          created_at_date: taskCreatedDate || new Date().toISOString().split('T')[0],
          assignee: user.admin || user.username,
          status: 'Pending'
       };

       try {
          const response = await fetch(url, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(bodyData)
          });
          const res = await response.json();
          if (response.ok && res.status === 'success') {
             showToast("Success", "Online Call logged successfully!");
             await fetchData();
             setShowAddCallModal(false);
             setSiteName(''); setSitePhone(''); setSiteDesc(''); setCallPlace('');
          } else {
             showToast("Error", res.message || "Submission failed");
          }
       } catch (err) {
          showToast("Error", "Network connection issues.");
       } finally {
          setIsAddingTask(false);
       }
    };
"""
content = content.replace(
    "const handleEditTaskInit = (t) => {",
    add_call_log_code + "\n    const handleEditTaskInit = (t) => {"
)

# 3. Filter displayedTasks for VisitLogs
content = content.replace(
    "const logs = displayedTasks;",
    "const logs = displayedTasks.filter(t => t.type !== 'online_call');"
)

# 4. create renderCallingLogs (copy renderVisitLogs logic but customized)
render_call_logs_code = """
   const renderCallingLogs = () => {
      const logs = displayedTasks.filter(t => t.type === 'online_call');
      const activeUsernames = users.map(u => u.username);
      const deletedUsernames = [...new Set((tasks || []).filter(t => !activeUsernames.includes(t.assignee)).map(t => t.assignee))];

      return (
         <div className="table-section responsive-visit-logs" style={{ minHeight: '80vh', background: 'white', padding: '1.2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
               <div>
                  <h2 style={{ fontSize: '1.8rem', color: '#111827', margin: 0 }}>Online Calling Logs</h2>
                  <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '0.9rem' }}>Audit trail of all online client calls</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '6px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 800, color: '#475569', letterSpacing: '0.5px' }}>
                     <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', boxShadow: '0 0 8px rgba(59,130,246,0.4)' }}></div>
                     SHOWING {logs.length} {logs.length === 1 ? 'CALL' : 'CALLS'}
                  </div>
               </div>

               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button className="primary-btn" onClick={() => setShowAddCallModal(true)} style={{ padding: '0.8rem 1.6rem', fontWeight: 800, background: '#3b82f6' }}>+ New Call Log</button>
               </div>
            </div>

            <div className="table-responsive mt" style={{ maxHeight: '500px', overflowY: 'auto' }}>
               <table className="modern-table" style={{ position: 'relative' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc' }}>
                     <tr><th>Entry Date</th><th>Submit Date</th><th>Discussion Details</th><th>Staff</th><th>Customer INFO</th><th>Place</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                     {logs.map((t, i) => (
                        <tr key={i} onClick={() => setFocusedTask(t)} style={{ cursor: 'pointer' }}>
                           <td className="date-col" style={{ color: '#3b82f6', fontWeight: 600 }}>{formatDisplayDate(t.created_at_date || t.submission_date)}</td>
                           <td className="date-col">{formatDisplayDate(t.submission_date || 'Today')}</td>
                           <td className="bold">{t.task}</td>
                           <td className="emp-col" onClick={(e) => {
                              e.stopPropagation();
                              const emp = users.find(u => u.username === t.assignee);
                              if (emp) navToProfile(emp);
                           }} style={{ cursor: 'pointer' }}>@{t.assignee}</td>
                           <td className="info-col">{t.deadline}</td>
                           <td>{t.place || <span style={{ color: '#9ca3af' }}>No Place</span>}</td>
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
                                    onCancel={() => setTaskToCancel(t)}
                                    onClose={() => setActiveTaskMenu(null)}
                                 />
                               )}
                           </td>
                        </tr>
                     ))}
                     {logs.length === 0 && <tr><td colSpan="8" className="empty-state">No call logs found.</td></tr>}
                  </tbody>
               </table>
            </div>
         </div>
      );
   };
"""
# insert renderCallingLogs before return (
content = content.replace("return (\n      <DLayout>", render_call_logs_code + "\n   return (\n      <DLayout>")

# 5. Nav Links and Content View Rendering
content = content.replace(
    "<span className={currentView === 'VisitLogs' ? 'active' : ''} onClick={() => { setCurrentView('VisitLogs'); setSelectedProfile(null); }}>Visit Reports</span>",
    "<span className={currentView === 'VisitLogs' ? 'active' : ''} onClick={() => { setCurrentView('VisitLogs'); setSelectedProfile(null); }}>Visit Reports</span>\n                  <span className={currentView === 'CallingLogs' ? 'active' : ''} onClick={() => { setCurrentView('CallingLogs'); setSelectedProfile(null); }}>Calling Logs</span>"
)

content = content.replace(
    """<div className={`nav-item ${currentView === 'VisitLogs' ? 'active' : ''}`} onClick={() => { setCurrentView('VisitLogs'); setFocusedTask(null); setSidebarOpen(false); }}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                   Visit Reports
                </div>""",
    """<div className={`nav-item ${currentView === 'VisitLogs' ? 'active' : ''}`} onClick={() => { setCurrentView('VisitLogs'); setFocusedTask(null); setSidebarOpen(false); }}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                   Visit Reports
                </div>
                <div className={`nav-item ${currentView === 'CallingLogs' ? 'active' : ''}`} onClick={() => { setCurrentView('CallingLogs'); setFocusedTask(null); setSidebarOpen(false); }}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                   Calling Logs
                </div>"""
)

# 6. Render currentView === 'CallingLogs'
content = content.replace(
    "{(currentView === 'VisitLogs' || currentView === 'AnalyticsLogs') && !focusedTask && !selectedProfile && renderVisitLogs()}",
    "{(currentView === 'VisitLogs' || currentView === 'AnalyticsLogs') && !focusedTask && !selectedProfile && renderVisitLogs()}\n                     {currentView === 'CallingLogs' && !focusedTask && !selectedProfile && renderCallingLogs()}"
)

# 7. Render Modal JSX
modal_jsx = """
                  {showAddCallModal && (
                     <form onSubmit={handleAddCallLog}>
                        <div className="input-group"><label>Customer Name <span style={{color: '#ef4444'}}>*</span></label><input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} required placeholder="Sanjay Kumar" /></div>
                        <div className="input-group mt"><label>Phone Number <span style={{color: '#ef4444'}}>*</span></label><input type="text" value={sitePhone} onChange={(e) => setSitePhone(e.target.value.replace(/\D/g, '').slice(0, 10))} required placeholder="9876543210" /></div>
                        <div className="input-group mt"><label>Place <span style={{color: '#ef4444'}}>*</span></label><input type="text" value={callPlace} onChange={(e) => setCallPlace(e.target.value)} required placeholder="Kompally" /></div>
                        <div className="input-group mt"><label>Call Description <span style={{color: '#ef4444'}}>*</span></label><input type="text" value={siteDesc} onChange={(e) => setSiteDesc(e.target.value)} required placeholder="Inquired about soundproof windows" /></div>
                        
                        <div className="grid-2 mt">
                           <div className="input-group"><label>Task Created Date (Sync) <span style={{color: '#ef4444'}}>*</span></label><input type="date" value={taskCreatedDate} onChange={(e) => setTaskCreatedDate(e.target.value)} required /></div>
                           <div className="input-group"><label>Submission Date <span style={{color: '#ef4444'}}>*</span></label><input type="date" value={submissionDate} onChange={(e) => setSubmissionDate(e.target.value)} required /></div>
                        </div>
                        <div className="modal-actions mt">
                           <button type="button" className="btn-cancel" onClick={() => { setShowAddCallModal(false); setSiteName(''); setSitePhone(''); setSiteDesc(''); setCallPlace(''); }}>Cancel</button>
                           <button type="submit" className="btn-submit" disabled={isAddingTask}>
                              {isAddingTask ? 'Saving Log...' : 'Submit Call Details'}
                           </button>
                        </div>
                     </form>
                  )}
"""

content = content.replace(
    "<h2>{showAddTaskModal ? (editingTask ? 'Edit Site Log' : 'Log Site Visit') : showAddUserModal ? 'Add New Staff' : 'Edit Profile'}</h2>",
    "<h2>{showAddTaskModal ? (editingTask ? 'Edit Site Log' : 'Log Site Visit') : showAddCallModal ? 'Log Online Call' : showAddUserModal ? 'Add New Staff' : 'Edit Profile'}</h2>"
)

content = content.replace(
    "{(showAddTaskModal || showAddUserModal || showEditModal) && (",
    "{(showAddTaskModal || showAddCallModal || showAddUserModal || showEditModal) && ("
)

content = content.replace(
    "{showAddTaskModal && (",
    modal_jsx + "\n                  {showAddTaskModal && ("
)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully.")

import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, CheckCircle, AlertCircle, Users, Calendar, ArrowRight, UserCheck, ShieldCheck, MapPin, Navigation, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { attendanceAPI, employeeAPI } from '../api';
import { useLanguage } from '../context/LanguageContext';

const TABS = ['clock', 'team', 'history'];

const Attendance = () => {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('clock');
  const [activeAttendance, setActiveAttendance] = useState(null);
  const [todayLogs, setTodayLogs] = useState([]);
  const [managerView, setManagerView] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveTime, setLiveTime] = useState(new Date());

  // Mocking projects for GPS select
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('HQ');

  useEffect(() => {
    const tick = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    fetchData();
    employeeAPI.getProjects().then(res => setProjects(res.data)).catch(console.error);
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [myActiveRes, activeRes, todayRes] = await Promise.all([
        attendanceAPI.getActive(), // mock gets all active
        attendanceAPI.getActive(),
        attendanceAPI.getToday()
      ]);
      setActiveAttendance(myActiveRes.data[0]);
      setManagerView(activeRes.data);
      setTodayLogs(todayRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      // Mock clock in
      await attendanceAPI.clockIn({ projectId: selectedProject });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClockOut = async () => {
    try {
      await attendanceAPI.clockOut();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const tabLabels = { clock: '🕐 Clock In/Out', team: '👥 Team Overview', history: '📋 My History' };

  return (
    <div style={{ padding: 40, minHeight: '100vh', background: '#f8fafc', direction: isRTL ? 'rtl' : 'ltr' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a' }}>{t('attendance')} & Time Tracking</h1>
        <p style={{ color: '#64748b', fontWeight: 600 }}>Manage your work hours and monitor staff presence across sites.</p>
      </header>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 8, background: 'white', padding: 6, borderRadius: 18, border: '1px solid #e2e8f0', marginBottom: 32, width: 'fit-content' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 22px', borderRadius: 14, border: 'none',
              fontWeight: 800, cursor: 'pointer', fontSize: 14, transition: 'all 0.2s',
              background: activeTab === tab ? '#0f172a' : 'transparent',
              color: activeTab === tab ? 'white' : '#64748b'
            }}>
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'clock' && (
          <motion.div key="clock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32 }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ background: 'white', padding: 32, borderRadius: 32, border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Clock size={40} color="#0f172a" />
                </div>
                <div style={{ fontSize: 48, fontWeight: 900, color: '#0a84ff', marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
                  {liveTime.toLocaleTimeString()}
                </div>
                
                {/* Site Selection */}
                <div style={{ marginBottom: 24, textAlign: isRTL ? 'right' : 'left' }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 8, display: 'block' }}>Current Site/Project</label>
                  <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', fontWeight: 700, outline: 'none' }}>
                    <option value="HQ">HQ / Office</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <div style={{ marginTop: 8, fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6, justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                    <MapPin size={14} /> GPS Verified
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button 
                    disabled={!!activeAttendance} onClick={handleClockIn}
                    style={{ 
                      padding: '16px', borderRadius: 16, background: activeAttendance ? '#e2e8f0' : '#10b981', 
                      color: activeAttendance ? '#94a3b8' : 'white', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                    }}>
                    <LogIn size={20} /> Clock In Now
                  </button>
                  <button 
                    disabled={!activeAttendance} onClick={handleClockOut}
                    style={{ 
                      padding: '16px', borderRadius: 16, background: 'white', color: !activeAttendance ? '#e2e8f0' : '#ef4444', 
                      border: `2px solid ${!activeAttendance ? '#f1f5f9' : '#fee2e2'}`, fontWeight: 800, fontSize: 16, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                    }}>
                    <LogOut size={20} /> Clock Out
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ background: 'white', padding: 32, borderRadius: 32, border: '1px solid rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 24 }}>Today's Activity Log</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {todayLogs.map(log => (
                    <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 20, background: '#f8fafc' }}>
                      <div style={{ flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14 }}>{log.employeeId}</div>
                        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Site: {log.projectId}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 800, color: '#10b981', fontSize: 13 }}>{log.clockIn}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>IN</div>
                        </div>
                        <ArrowRight size={14} color="#cbd5e1" style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 800, color: log.clockOut ? '#ef4444' : '#94a3b8', fontSize: 13 }}>{log.clockOut || '--:--'}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>OUT</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {todayLogs.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontWeight: 700 }}>No attendance records today.</div>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Attendance;

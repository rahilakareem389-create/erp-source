import React, { useEffect, useMemo, useState } from 'react';
import { leaveAPI, employeeAPI } from '../api';
import { useLanguage } from '../context/LanguageContext';

import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Users,
  FileCheck,
  Ban,
} from 'lucide-react';

const Leaves = () => {
  const { t, isRTL } = useLanguage();

  // =========================================================
  // STATES
  // =========================================================

  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // =========================================================
  // HELPERS
  // =========================================================

  const getId = (item) => {
    if (!item) return null;

    return (
      item.id ??
      item._id ??
      item.leaveId ??
      null
    );
  };

  const normalizeArray = (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (Array.isArray(value?.leaves)) {
      return value.leaves;
    }

    if (Array.isArray(value?.data)) {
      return value.data;
    }

    if (Array.isArray(value?.rows)) {
      return value.rows;
    }

    return [];
  };

  const normalizeStatus = (status) => {
    return String(status || 'pending')
      .trim()
      .toLowerCase();
  };

  // =========================================================
  // EMPLOYEE NAME
  // =========================================================

  const getEmployeeName = (leave) => {
    const backendEmployee =
      leave?.Employee ||
      leave?.employee ||
      leave?.employeeData ||
      null;

    if (backendEmployee) {
      if (isRTL) {
        return (
          backendEmployee.arabicName ||
          backendEmployee.nameArabic ||
          backendEmployee.name ||
          `${backendEmployee.firstName || ''} ${
            backendEmployee.lastName || ''
          }`.trim() ||
          backendEmployee.englishName ||
          'Unknown Employee'
        );
      }

      return (
        backendEmployee.englishName ||
        backendEmployee.nameEnglish ||
        backendEmployee.name ||
        `${backendEmployee.firstName || ''} ${
          backendEmployee.lastName || ''
        }`.trim() ||
        backendEmployee.arabicName ||
        'Unknown Employee'
      );
    }

    const employeeId =
      leave?.employeeId ??
      leave?.employeeID ??
      leave?.EmployeeId;

    if (
      employeeId !== undefined &&
      employeeId !== null
    ) {
      const employee = employees.find(
        (emp) =>
          String(emp.id) === String(employeeId) ||
          String(emp._id) === String(employeeId) ||
          String(emp.employeeId) === String(employeeId)
      );

      if (employee) {
        if (isRTL) {
          return (
            employee.arabicName ||
            employee.nameArabic ||
            employee.name ||
            employee.englishName ||
            `${employee.firstName || ''} ${
              employee.lastName || ''
            }`.trim() ||
            'Unknown Employee'
          );
        }

        return (
          employee.englishName ||
          employee.nameEnglish ||
          employee.name ||
          `${employee.firstName || ''} ${
            employee.lastName || ''
          }`.trim() ||
          employee.arabicName ||
          'Unknown Employee'
        );
      }

      return `Employee #${employeeId}`;
    }

    return 'Unknown Employee';
  };

  // =========================================================
  // EMPLOYEE ID
  // =========================================================

  const getEmployeeId = (leave) => {
    return (
      leave?.employeeId ??
      leave?.employeeID ??
      leave?.EmployeeId ??
      leave?.Employee?.id ??
      leave?.employee?.id ??
      'N/A'
    );
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) return 'N/A';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return String(date);
    }

    return parsed.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // =========================================================
  // CALCULATE DAYS
  // =========================================================

  const calculateDays = (leave) => {
    if (
      leave?.days !== undefined &&
      leave?.days !== null &&
      leave?.days !== ''
    ) {
      const numericDays = Number(leave.days);

      if (!Number.isNaN(numericDays)) {
        return numericDays;
      }
    }

    if (!leave?.startDate || !leave?.endDate) {
      return 0;
    }

    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return 0;
    }

    const difference = Math.abs(
      end.getTime() - start.getTime()
    );

    return (
      Math.ceil(
        difference / (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  // =========================================================
  // CLEAR MESSAGES
  // =========================================================

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // =========================================================
  // LOAD LEAVES
  // =========================================================

  const loadLeaves = async () => {
    try {
      setLoading(true);
      setError('');

      const [leaveResult, employeeResult] =
        await Promise.allSettled([
          leaveAPI.getAll(),
          employeeAPI.getAll(),
        ]);

      // -----------------------------------------------------
      // LEAVES
      // -----------------------------------------------------

      if (leaveResult.status === 'fulfilled') {
        const data = normalizeArray(
          leaveResult.value?.data
        );

        setLeaves(data);
      } else {
        console.error(
          'Leaves API error:',
          leaveResult.reason
        );

        setLeaves([]);

        setError(
          leaveResult.reason?.response?.data?.message ||
            leaveResult.reason?.message ||
            'Unable to load leave requests.'
        );
      }

      // -----------------------------------------------------
      // EMPLOYEES
      // -----------------------------------------------------

      if (employeeResult.status === 'fulfilled') {
        const employeeData = normalizeArray(
          employeeResult.value?.data
        );

        setEmployees(employeeData);
      } else {
        console.warn(
          'Employee API unavailable:',
          employeeResult.reason
        );

        setEmployees([]);
      }
    } catch (err) {
      console.error(
        'LOAD LEAVES ERROR:',
        err
      );

      setLeaves([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to load leave requests.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadLeaves();
  }, []);

  // =========================================================
  // COUNTS
  // =========================================================

  const pendingCount = useMemo(() => {
    return leaves.filter(
      (leave) =>
        normalizeStatus(leave.status) === 'pending'
    ).length;
  }, [leaves]);

  const activeCount = useMemo(() => {
    return leaves.filter((leave) => {
      const status = normalizeStatus(leave.status);

      return (
        status === 'approved' ||
        status === 'active'
      );
    }).length;
  }, [leaves]);

  const totalCount = useMemo(() => {
    return leaves.length;
  }, [leaves]);

  // =========================================================
  // PENDING LEAVES
  // =========================================================

  const pendingLeaves = useMemo(() => {
    return leaves.filter(
      (leave) =>
        normalizeStatus(leave.status) === 'pending'
    );
  }, [leaves]);

  // =========================================================
  // APPROVE
  // =========================================================

  const handleApprove = async (leave) => {
    const leaveId = getId(leave);

    if (!leaveId) {
      setError('Leave ID is missing.');
      return;
    }

    if (processingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to approve this leave request?'
    );

    if (!confirmed) {
      return;
    }

    clearMessages();

    try {
      setProcessingId(leaveId);

      await leaveAPI.updateStatus(
        leaveId,
        'approved'
      );

      // Update UI immediately
      setLeaves((current) =>
        current.map((item) =>
          String(getId(item)) === String(leaveId)
            ? {
                ...item,
                status: 'approved',
              }
            : item
        )
      );

      setSuccess(
        'Leave request approved successfully.'
      );
    } catch (err) {
      console.error(
        'APPROVE LEAVE ERROR:',
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to approve leave request.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================================
  // OPEN REJECT MODAL
  // =========================================================

  const openRejectModal = (leave) => {
    if (processingId !== null) {
      return;
    }

    setSelectedLeave(leave);
    setRejectionReason('');
    clearMessages();
    setShowRejectModal(true);
  };

  // =========================================================
  // CLOSE REJECT MODAL
  // =========================================================

  const closeRejectModal = () => {
    if (processingId !== null) {
      return;
    }

    setShowRejectModal(false);
    setSelectedLeave(null);
    setRejectionReason('');
  };

  // =========================================================
  // REJECT
  // =========================================================

  const handleReject = async () => {
    if (!selectedLeave) {
      return;
    }

    const leaveId = getId(selectedLeave);

    if (!leaveId) {
      setError('Leave ID is missing.');
      return;
    }

    if (processingId !== null) {
      return;
    }

    clearMessages();

    try {
      setProcessingId(leaveId);

      const reason =
        rejectionReason.trim() ||
        'Leave request rejected.';

      await leaveAPI.updateStatus(
        leaveId,
        'rejected',
        reason
      );

      setLeaves((current) =>
        current.map((item) =>
          String(getId(item)) === String(leaveId)
            ? {
                ...item,
                status: 'rejected',
                rejectionReason: reason,
              }
            : item
        )
      );

      setShowRejectModal(false);
      setSelectedLeave(null);
      setRejectionReason('');

      setSuccess(
        'Leave request rejected successfully.'
      );
    } catch (err) {
      console.error(
        'REJECT LEAVE ERROR:',
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to reject leave request.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================================
  // STATUS CONFIG
  // =========================================================

  const getStatusConfig = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized === 'approved') {
      return {
        label: 'Approved',
        background: '#ecfdf5',
        color: '#059669',
        icon: CheckCircle,
      };
    }

    if (
      normalized === 'rejected' ||
      normalized === 'reject'
    ) {
      return {
        label: 'Rejected',
        background: '#fef2f2',
        color: '#dc2626',
        icon: XCircle,
      };
    }

    if (normalized === 'withdrawn') {
      return {
        label: 'Withdrawn',
        background: '#f1f5f9',
        color: '#64748b',
        icon: Ban,
      };
    }

    if (normalized === 'active') {
      return {
        label: 'Active',
        background: '#ecfdf5',
        color: '#059669',
        icon: FileCheck,
      };
    }

    return {
      label: 'Pending',
      background: '#fffbeb',
      color: '#d97706',
      icon: Clock,
    };
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#f8fafc',
        padding: '32px',
        boxSizing: 'border-box',
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '20px',
          marginBottom: '28px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: 900,
              color: '#0f172a',
            }}
          >
            {t('leaves') || 'Leaves'} Management
          </h1>

          <p
            style={{
              margin: '8px 0 0',
              color: '#64748b',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            Review and manage employee time-off requests.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLeaves}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 18px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#334155',
            fontWeight: 800,
            cursor: loading
              ? 'not-allowed'
              : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          <RefreshCw
            size={17}
            style={{
              animation: loading
                ? 'leaveSpin 1s linear infinite'
                : 'none',
            }}
          />

          Refresh
        </button>
      </div>

      {/* SUCCESS */}

      {success && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            borderRadius: '12px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#047857',
            fontWeight: 700,
          }}
        >
          <CheckCircle size={19} />
          <span>{success}</span>
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            borderRadius: '12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontWeight: 700,
          }}
        >
          <AlertCircle size={19} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError('')}
            style={{
              marginLeft: 'auto',
              border: 'none',
              background: 'transparent',
              color: '#dc2626',
              cursor: 'pointer',
              fontWeight: 900,
              fontSize: '18px',
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* STATS */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '18px',
          marginBottom: '28px',
        }}
      >
        <StatCard
          title="Pending Approval"
          count={pendingCount}
          background="#fffbeb"
          color="#d97706"
          icon={Clock}
        />

        <StatCard
          title="Active"
          count={activeCount}
          background="#ecfdf5"
          color="#059669"
          icon={FileCheck}
        />

        <StatCard
          title="Total Requests"
          count={totalCount}
          background="#eff6ff"
          color="#2563eb"
          icon={Users}
        />
      </div>

      {/* TABLE */}

      <div
        style={{
          background: '#ffffff',
          borderRadius: '22px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow:
            '0 5px 25px rgba(15,23,42,0.05)',
        }}
      >
        <div
          style={{
            padding: '22px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: '#0f172a',
                fontSize: '19px',
                fontWeight: 900,
              }}
            >
              Pending Leave Requests
            </h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#64748b',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              Approve or reject employee leave applications.
            </p>
          </div>

          <div
            style={{
              padding: '7px 12px',
              borderRadius: '20px',
              background: '#f1f5f9',
              color: '#475569',
              fontSize: '12px',
              fontWeight: 800,
            }}
          >
            {pendingCount} Pending
          </div>
        </div>

        <div
          style={{
            width: '100%',
            overflowX: 'auto',
          }}
        >
          <table
            style={{
              width: '100%',
              minWidth: '1000px',
              borderCollapse: 'collapse',
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            <thead>
              <tr
                style={{
                  background: '#f8fafc',
                  borderBottom:
                    '1px solid #e2e8f0',
                }}
              >
                <th style={headerStyle}>Employee</th>
                <th style={headerStyle}>Leave Type</th>
                <th style={headerStyle}>Duration</th>
                <th style={headerStyle}>Status</th>
                <th style={headerStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {/* LOADING */}

              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: '70px 20px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#64748b',
                        fontWeight: 700,
                      }}
                    >
                      <RefreshCw
                        size={32}
                        style={{
                          animation:
                            'leaveSpin 1s linear infinite',
                        }}
                      />

                      Loading leave requests...
                    </div>
                  </td>
                </tr>
              )}

              {/* ROWS */}

              {!loading &&
                pendingLeaves.map((leave) => {
                  const leaveId = getId(leave);

                  const isProcessing =
                    String(processingId) ===
                    String(leaveId);

                  const statusConfig =
                    getStatusConfig(
                      leave.status
                    );

                  const StatusIcon =
                    statusConfig.icon;

                  const days =
                    calculateDays(leave);

                  return (
                    <tr
                      key={
                        leaveId ||
                        `${leave.employeeId}-${leave.startDate}-${leave.endDate}`
                      }
                      style={{
                        borderBottom:
                          '1px solid #f1f5f9',
                      }}
                    >
                      {/* EMPLOYEE */}

                      <td style={cellStyle}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                          }}
                        >
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '12px',
                              background: '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#475569',
                              fontWeight: 900,
                            }}
                          >
                            {getEmployeeName(
                              leave
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <div
                              style={{
                                color: '#0f172a',
                                fontWeight: 800,
                                fontSize: '14px',
                              }}
                            >
                              {getEmployeeName(
                                leave
                              )}
                            </div>

                            <div
                              style={{
                                marginTop: '4px',
                                color: '#94a3b8',
                                fontSize: '12px',
                                fontWeight: 600,
                              }}
                            >
                              ID: {getEmployeeId(leave)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* TYPE */}

                      <td style={cellStyle}>
                        <div
                          style={{
                            color: '#334155',
                            fontSize: '14px',
                            fontWeight: 800,
                          }}
                        >
                          {leave.type ||
                            leave.leaveType ||
                            leave.LeaveType ||
                            'N/A'}
                        </div>

                        {leave.reason && (
                          <div
                            title={leave.reason}
                            style={{
                              marginTop: '5px',
                              maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow:
                                'ellipsis',
                              whiteSpace:
                                'nowrap',
                              color: '#94a3b8',
                              fontSize: '12px',
                            }}
                          >
                            {leave.reason}
                          </div>
                        )}
                      </td>

                      {/* DURATION */}

                      <td style={cellStyle}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#0f172a',
                            fontSize: '14px',
                            fontWeight: 800,
                          }}
                        >
                          <Calendar size={16} />

                          {formatDate(
                            leave.startDate
                          )}

                          <span
                            style={{
                              color: '#94a3b8',
                              fontWeight: 700,
                            }}
                          >
                            →
                          </span>

                          {formatDate(
                            leave.endDate
                          )}
                        </div>

                        <div
                          style={{
                            marginTop: '7px',
                            color: '#64748b',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          {days > 0
                            ? `${days} day${
                                days > 1
                                  ? 's'
                                  : ''
                              }`
                            : 'Duration unavailable'}
                        </div>
                      </td>

                      {/* STATUS */}

                      <td style={cellStyle}>
                        <span
                          style={{
                            display:
                              'inline-flex',
                            alignItems:
                              'center',
                            gap: '6px',
                            padding:
                              '7px 12px',
                            borderRadius:
                              '9px',
                            background:
                              statusConfig.background,
                            color:
                              statusConfig.color,
                            fontSize:
                              '12px',
                            fontWeight: 900,
                          }}
                        >
                          <StatusIcon size={14} />

                          {statusConfig.label}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td style={cellStyle}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleApprove(leave)
                            }
                            disabled={
                              processingId !==
                                null ||
                              normalizeStatus(
                                leave.status
                              ) !== 'pending'
                            }
                            style={{
                              display:
                                'inline-flex',
                              alignItems:
                                'center',
                              justifyContent:
                                'center',
                              gap: '6px',
                              minWidth: '105px',
                              padding:
                                '9px 13px',
                              border: 'none',
                              borderRadius:
                                '9px',
                              background:
                                isProcessing
                                  ? '#94a3b8'
                                  : '#10b981',
                              color: '#ffffff',
                              fontSize: '12px',
                              fontWeight: 900,
                              cursor:
                                processingId !==
                                null
                                  ? 'not-allowed'
                                  : 'pointer',
                              opacity:
                                processingId !==
                                null
                                  ? 0.65
                                  : 1,
                            }}
                          >
                            {isProcessing ? (
                              <RefreshCw
                                size={14}
                                style={{
                                  animation:
                                    'leaveSpin 1s linear infinite',
                                }}
                              />
                            ) : (
                              <CheckCircle size={14} />
                            )}

                            {isProcessing
                              ? 'Processing...'
                              : 'Approve'}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openRejectModal(
                                leave
                              )
                            }
                            disabled={
                              processingId !==
                                null ||
                              normalizeStatus(
                                leave.status
                              ) !== 'pending'
                            }
                            style={{
                              display:
                                'inline-flex',
                              alignItems:
                                'center',
                              justifyContent:
                                'center',
                              gap: '6px',
                              minWidth: '95px',
                              padding:
                                '9px 13px',
                              border:
                                '1px solid #fecaca',
                              borderRadius:
                                '9px',
                              background:
                                '#fff1f2',
                              color: '#dc2626',
                              fontSize: '12px',
                              fontWeight: 900,
                              cursor:
                                processingId !==
                                null
                                  ? 'not-allowed'
                                  : 'pointer',
                              opacity:
                                processingId !==
                                null
                                  ? 0.65
                                  : 1,
                            }}
                          >
                            <XCircle size={14} />

                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {/* EMPTY */}

              {!loading &&
                pendingLeaves.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: '70px 20px',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection:
                            'column',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <CheckCircle
                          size={46}
                          color="#94a3b8"
                        />

                        <h3
                          style={{
                            margin: 0,
                            color: '#475569',
                            fontSize: '17px',
                            fontWeight: 900,
                          }}
                        >
                          No Pending Leave Requests
                        </h3>

                        <p
                          style={{
                            margin: 0,
                            color: '#94a3b8',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}
                        >
                          There are currently no leave
                          requests waiting for approval.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REJECT MODAL */}

      {showRejectModal && (
        <div
          onClick={(e) => {
            if (
              e.target === e.currentTarget &&
              processingId === null
            ) {
              closeRejectModal();
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background:
              'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '500px',
              background: '#ffffff',
              borderRadius: '20px',
              padding: '26px',
              boxShadow:
                '0 25px 70px rgba(15,23,42,0.25)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <XCircle size={23} />
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    color: '#0f172a',
                    fontSize: '20px',
                    fontWeight: 900,
                  }}
                >
                  Reject Leave Request
                </h2>

                <p
                  style={{
                    margin: '4px 0 0',
                    color: '#64748b',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {selectedLeave
                    ? getEmployeeName(
                        selectedLeave
                      )
                    : ''}
                </p>
              </div>
            </div>

            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 800,
              }}
            >
              Rejection Reason
            </label>

            <textarea
              value={rejectionReason}
              onChange={(e) =>
                setRejectionReason(
                  e.target.value
                )
              }
              placeholder="Enter reason for rejecting this leave request..."
              rows={5}
              disabled={processingId !== null}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                resize: 'vertical',
                padding: '13px',
                border:
                  '1px solid #cbd5e1',
                borderRadius: '10px',
                outline: 'none',
                color: '#0f172a',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '20px',
              }}
            >
              <button
                type="button"
                onClick={closeRejectModal}
                disabled={
                  processingId !== null
                }
                style={{
                  padding: '10px 18px',
                  borderRadius: '9px',
                  border:
                    '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={
                  processingId !== null
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '10px 18px',
                  border: 'none',
                  borderRadius: '9px',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 900,
                  cursor:
                    processingId !== null
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    processingId !== null
                      ? 0.7
                      : 1,
                }}
              >
                {processingId !== null ? (
                  <RefreshCw
                    size={15}
                    style={{
                      animation:
                        'leaveSpin 1s linear infinite',
                    }}
                  />
                ) : (
                  <XCircle size={15} />
                )}

                {processingId !== null
                  ? 'Rejecting...'
                  : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}

      <style>
        {`
          @keyframes leaveSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          button {
            transition:
              transform 0.15s ease,
              opacity 0.15s ease,
              box-shadow 0.15s ease;
          }

          button:not(:disabled):hover {
            transform: translateY(-1px);
          }

          button:not(:disabled):active {
            transform: translateY(0);
          }

          textarea:focus {
            border-color: #94a3b8 !important;
            box-shadow:
              0 0 0 3px
              rgba(148, 163, 184, 0.15);
          }
        `}
      </style>
    </div>
  );
};

// =========================================================
// STAT CARD
// =========================================================

const StatCard = ({
  title,
  count,
  background,
  color,
  icon: Icon,
}) => {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '18px',
        padding: '22px',
        border: '1px solid #e2e8f0',
        boxShadow:
          '0 4px 15px rgba(15,23,42,0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: '#64748b',
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </p>

          <h2
            style={{
              margin: '8px 0 0',
              fontSize: '30px',
              color: '#0f172a',
              fontWeight: 900,
            }}
          >
            {count}
          </h2>
        </div>

        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background,
            color,
          }}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

// =========================================================
// TABLE STYLES
// =========================================================

const headerStyle = {
  padding: '15px 22px',
  fontSize: '11px',
  fontWeight: 900,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
};

const cellStyle = {
  padding: '18px 22px',
  verticalAlign: 'middle',
};

export default Leaves;
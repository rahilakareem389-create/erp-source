import React, { useState } from 'react';
import {
  Calendar,
  Send,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

import { leaveAPI } from '../api';
import { useLanguage } from '../context/LanguageContext';

// ======================================================
// EMPLOYEE LEAVE FORM
// ======================================================

const EmployeeLeaveForm = () => {
  const { isRTL } = useLanguage();

  // ====================================================
  // FORM STATE
  // ====================================================

  const [form, setForm] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // ====================================================
  // UI STATE
  // ====================================================

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // ====================================================
  // TODAY DATE
  // ====================================================

  const getToday = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const today = getToday();

  // ====================================================
  // HANDLE INPUT CHANGE
  // ====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear messages while typing
    setError('');
    setSuccess('');
  };

  // ====================================================
  // CALCULATE LEAVE DAYS
  // ====================================================

  const calculateDays = () => {
    if (!form.startDate || !form.endDate) {
      return 0;
    }

    const start = new Date(`${form.startDate}T00:00:00`);
    const end = new Date(`${form.endDate}T00:00:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return 0;
    }

    if (end < start) {
      return 0;
    }

    const difference = end.getTime() - start.getTime();

    return Math.floor(
      difference / (1000 * 60 * 60 * 24)
    ) + 1;
  };

  const days = calculateDays();

  // ====================================================
  // RESET FORM
  // ====================================================

  const resetForm = () => {
    setForm({
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
    });
  };

  // ====================================================
  // VALIDATE FORM
  // ====================================================

  const validateForm = () => {
    if (!form.leaveType) {
      return 'Please select leave type.';
    }

    if (!form.startDate) {
      return 'Please select start date.';
    }

    if (!form.endDate) {
      return 'Please select end date.';
    }

    if (new Date(`${form.endDate}T00:00:00`) <
        new Date(`${form.startDate}T00:00:00`)) {
      return 'End date cannot be before start date.';
    }

    if (days <= 0) {
      return 'Please select valid leave dates.';
    }

    if (!form.reason.trim()) {
      return 'Please enter leave reason.';
    }

    if (form.reason.trim().length < 5) {
      return 'Leave reason must be at least 5 characters.';
    }

    return '';
  };

  // ====================================================
  // SUBMIT LEAVE
  // ====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double click / duplicate request
    if (loading) {
      return;
    }

    setError('');
    setSuccess('');

    // Validate
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      // ==================================================
      // DATA SENT TO BACKEND
      // ==================================================

      const leaveData = {
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        days: days,
        reason: form.reason.trim(),
        status: 'pending',
      };

      console.log('Submitting Leave:', leaveData);

      // ==================================================
      // API REQUEST
      // ==================================================

      const response = await leaveAPI.apply(leaveData);

      console.log('Leave API Response:', response);

      // ==================================================
      // SUCCESS
      // ==================================================

      const successMessage =
        response?.data?.message ||
        response?.message ||
        'Leave request submitted successfully. Waiting for approval.';

      setSuccess(successMessage);

      // Clear form
      resetForm();

    } catch (err) {
      console.error('APPLY LEAVE ERROR:', err);

      // ==================================================
      // ERROR MESSAGE
      // ==================================================

      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.errors?.[0]?.message ||
        err?.message ||
        'Failed to submit leave request. Please try again.';

      setError(serverMessage);

    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // UI
  // ====================================================

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

      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        style={{
          marginBottom: '28px',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '32px',
            fontWeight: 900,
            color: '#0f172a',
          }}
        >
          Apply for Leave
        </h1>

        <p
          style={{
            margin: '8px 0 0',
            color: '#64748b',
            fontSize: '15px',
            fontWeight: 600,
          }}
        >
          Submit your leave request for approval.
        </p>
      </div>

      {/* ==================================================
          SUCCESS MESSAGE
      ================================================== */}

      {success && (
        <div
          role="alert"
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
          <CheckCircle size={20} />

          <span>{success}</span>
        </div>
      )}

      {/* ==================================================
          ERROR MESSAGE
      ================================================== */}

      {error && (
        <div
          role="alert"
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
          <AlertCircle size={20} />

          <span>{error}</span>
        </div>
      )}

      {/* ==================================================
          FORM CARD
      ================================================== */}

      <div
        style={{
          width: '100%',
          maxWidth: '850px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '22px',
          padding: '30px',
          boxShadow: '0 5px 25px rgba(15,23,42,0.05)',
          boxSizing: 'border-box',
        }}
      >

        <form onSubmit={handleSubmit}>

          {/* ==================================================
              LEAVE TYPE
          ================================================== */}

          <div
            style={{
              marginBottom: '22px',
            }}
          >
            <label
              htmlFor="leaveType"
              style={labelStyle}
            >
              Leave Type
            </label>

            <select
              id="leaveType"
              name="leaveType"
              value={form.leaveType}
              onChange={handleChange}
              disabled={loading}
              style={inputStyle}
            >
              <option value="">
                Select Leave Type
              </option>

              <option value="Annual Leave">
                Annual Leave
              </option>

              <option value="Sick Leave">
                Sick Leave
              </option>

              <option value="Casual Leave">
                Casual Leave
              </option>

              <option value="Emergency Leave">
                Emergency Leave
              </option>

              <option value="Maternity Leave">
                Maternity Leave
              </option>

              <option value="Unpaid Leave">
                Unpaid Leave
              </option>
            </select>
          </div>

          {/* ==================================================
              DATE SECTION
          ================================================== */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '22px',
            }}
          >

            {/* START DATE */}

            <div>
              <label
                htmlFor="startDate"
                style={labelStyle}
              >
                Start Date
              </label>

              <div
                style={{
                  position: 'relative',
                }}
              >
                <Calendar
                  size={18}
                  style={iconStyle}
                />

                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  min={today}
                  disabled={loading}
                  style={{
                    ...inputStyle,
                    paddingLeft: '42px',
                  }}
                />
              </div>
            </div>

            {/* END DATE */}

            <div>
              <label
                htmlFor="endDate"
                style={labelStyle}
              >
                End Date
              </label>

              <div
                style={{
                  position: 'relative',
                }}
              >
                <Calendar
                  size={18}
                  style={iconStyle}
                />

                <input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  min={form.startDate || today}
                  disabled={loading}
                  style={{
                    ...inputStyle,
                    paddingLeft: '42px',
                  }}
                />
              </div>
            </div>

          </div>

          {/* ==================================================
              DAYS
          ================================================== */}

          {days > 0 && (
            <div
              style={{
                marginBottom: '22px',
                padding: '14px 16px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                color: '#1d4ed8',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Calendar size={18} />

              <span>
                Total Leave Duration: {days}{' '}
                {days === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          )}

          {/* ==================================================
              REASON
          ================================================== */}

          <div
            style={{
              marginBottom: '25px',
            }}
          >
            <label
              htmlFor="reason"
              style={labelStyle}
            >
              Reason
            </label>

            <textarea
              id="reason"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Enter the reason for your leave..."
              rows={6}
              disabled={loading}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: '130px',
              }}
            />

            <div
              style={{
                marginTop: '6px',
                fontSize: '12px',
                color: '#94a3b8',
                fontWeight: 600,
              }}
            >
              {form.reason.length} characters
            </div>
          </div>

          {/* ==================================================
              SUBMIT BUTTON
          ================================================== */}

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '13px 24px',
              border: 'none',
              borderRadius: '10px',
              background: loading
                ? '#94a3b8'
                : '#2563eb',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 900,
              cursor: loading
                ? 'not-allowed'
                : 'pointer',
              minWidth: '180px',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.8 : 1,
            }}
          >

            {loading ? (
              <>
                <RefreshCw
                  size={17}
                  style={{
                    animation:
                      'leaveSpin 1s linear infinite',
                  }}
                />

                <span>
                  Submitting...
                </span>
              </>
            ) : (
              <>
                <Send size={17} />

                <span>
                  Submit Leave
                </span>
              </>
            )}

          </button>

        </form>
      </div>

      {/* ==================================================
          CSS
      ================================================== */}

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

          input:focus,
          select:focus,
          textarea:focus {
            outline: none;
            border-color: #2563eb !important;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
          }

          button:not(:disabled):hover {
            transform: translateY(-1px);
            box-shadow: 0 5px 15px rgba(37, 99, 235, 0.20);
          }

          button:not(:disabled):active {
            transform: translateY(0);
          }

          input:disabled,
          select:disabled,
          textarea:disabled {
            background: #f8fafc;
            cursor: not-allowed;
            opacity: 0.75;
          }

          @media (max-width: 640px) {
            div {
              box-sizing: border-box;
            }
          }
        `}
      </style>

    </div>
  );
};

// ======================================================
// STYLES
// ======================================================

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  color: '#334155',
  fontSize: '13px',
  fontWeight: 800,
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '13px 14px',
  border: '1px solid #cbd5e1',
  borderRadius: '10px',
  background: '#ffffff',
  color: '#0f172a',
  fontSize: '14px',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
};

const iconStyle = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#64748b',
  pointerEvents: 'none',
  zIndex: 1,
};

// ======================================================
// EXPORT
// ======================================================

export default EmployeeLeaveForm;
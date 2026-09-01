import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  Save,
  Loader2,
  User,
  Briefcase,
  DollarSign,
  X,
  Eraser,
} from 'lucide-react';
import { employeeAPI } from '../api';

const initialForm = {
  empCode: '',
  englishName: '',
  arabicName: '',
  cnic: '',
  nationality: '',
  passport: '',
  mobile: '',
  email: '',
  address: '',
  departmentId: '',
  designationId: '',
  joiningDate: '',
  contractStartDate: '',
  contractExpiryDate: '',
  siteProject: '',
  employeeStatus: 'Active',
  basicSalary: '',
  housingAllowance: '',
  transportationAllowance: '',
  foodAllowance: '',
  siteAllowance: '',
  normalOvertimeRate: '',
};

const AddEmployee = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ======================================================
  // HANDLE INPUT CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError('');
    }

    if (success) {
      setSuccess('');
    }
  };

  // ======================================================
  // SUBMIT FORM
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    // Required fields validation
    if (!form.empCode.trim()) {
      setError('Employee code is required.');
      return;
    }

    if (!form.englishName.trim()) {
      setError('English name is required.');
      return;
    }

    setLoading(true);

    try {
      const employeeData = {
        ...form,

        basicSalary: Number(form.basicSalary) || 0,
        housingAllowance: Number(form.housingAllowance) || 0,
        transportationAllowance:
          Number(form.transportationAllowance) || 0,
        foodAllowance: Number(form.foodAllowance) || 0,
        siteAllowance: Number(form.siteAllowance) || 0,
        normalOvertimeRate:
          Number(form.normalOvertimeRate) || 0,
      };

      await employeeAPI.create(employeeData);

      setSuccess('Employee has been added successfully.');

      setTimeout(() => {
        navigate('/employees');
      }, 1000);
    } catch (err) {
      console.error('Add Employee Error:', err);

      setError(
        err?.response?.data?.message ||
          'Unable to add employee. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // CANCEL
  // ======================================================

  const handleCancel = () => {
    if (loading) return;

    navigate('/employees');
  };

  // ======================================================
  // CLEAR FORM
  // ======================================================

  const handleClear = () => {
    if (loading) return;

    setForm(initialForm);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50">

      {/* ==================================================
          MAIN CONTENT

          IMPORTANT:
          App.jsx already handles the Sidebar spacing.
          Therefore NO lg:ml-[300px] here.
      ================================================== */}

      <main className="min-h-screen w-full">

        {/* ==================================================
            CENTERED CONTENT CONTAINER

            mx-auto = center horizontally
        ================================================== */}

        <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

          {/* ==================================================
              BACK BUTTON
          ================================================== */}

          <div className="mb-5">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={18} />

              <span>Back to Employees</span>
            </button>
          </div>

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:mb-8 sm:p-6">

            <div className="flex items-center gap-4">

              {/* Icon */}

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 sm:h-16 sm:w-16">
                <UserPlus size={28} />
              </div>

              {/* Heading */}

              <div className="min-w-0">

                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Add Employee
                </h1>

                <p className="mt-1 text-sm font-medium leading-6 text-slate-500 sm:text-base">
                  Create a new employee profile and payroll record.
                </p>

              </div>

            </div>

          </div>

          {/* ==================================================
              ERROR MESSAGE
          ================================================== */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">

              <X
                size={20}
                className="mt-0.5 shrink-0"
              />

              <div>

                <p className="font-bold">
                  Unable to save employee
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>

              </div>

            </div>
          )}

          {/* ==================================================
              SUCCESS MESSAGE
          ================================================== */}

          {success && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">

              <p className="font-bold">
                {success}
              </p>

              <p className="mt-1 text-sm">
                Redirecting to Employees...
              </p>

            </div>
          )}

          {/* ==================================================
              FORM
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* ==================================================
                PERSONAL INFORMATION
            ================================================== */}

            <Section
              icon={<User size={20} />}
              title="Personal Information"
              desc="Basic employee identity and contact information."
            >

              <div className="grid grid-cols-1 gap-4">

                {/* Employee Code */}

                <Field
                  label="Employee Code"
                  required
                >
                  <input
                    type="text"
                    name="empCode"
                    value={form.empCode}
                    onChange={handleChange}
                    placeholder="EMP-001"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </Field>

                {/* English Name */}

                <Field
                  label="English Name"
                  required
                >
                  <input
                    type="text"
                    name="englishName"
                    value={form.englishName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </Field>

                {/* Arabic Name */}

                <Field label="Arabic Name">
                  <input
                    type="text"
                    name="arabicName"
                    value={form.arabicName}
                    onChange={handleChange}
                    placeholder="Arabic name"
                    dir="rtl"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </Field>

                {/* CNIC */}

                <Field label="CNIC / National ID">
                  <input
                    type="text"
                    name="cnic"
                    value={form.cnic}
                    onChange={handleChange}
                    placeholder="National ID"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </Field>

                {/* Nationality */}

                <Field label="Nationality">
                  <input
                    type="text"
                    name="nationality"
                    value={form.nationality}
                    onChange={handleChange}
                    placeholder="e.g. Pakistani"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </Field>

                {/* Passport */}

                <Field label="Passport Number">
                  <input
                    type="text"
                    name="passport"
                    value={form.passport}
                    onChange={handleChange}
                    placeholder="Passport number"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </Field>

                {/* Mobile */}

                <Field label="Mobile Number">
                  <input
                    type="text"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="+92 300 0000000"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </Field>

                {/* Email */}

                <Field label="Email Address">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="employee@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </Field>

                {/* Address */}

                <Field label="Address">
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter complete address"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </Field>

              </div>

            </Section>

            {/* ==================================================
                EMPLOYMENT INFORMATION
            ================================================== */}

            <Section
              icon={<Briefcase size={20} />}
              title="Employment Information"
              desc="Department, designation, project and contract details."
            >

              <div className="grid grid-cols-1 gap-4">

                {/* Department */}

                <Field label="Department ID">
                  <input
                    type="text"
                    name="departmentId"
                    value={form.departmentId}
                    onChange={handleChange}
                    placeholder="Department ID"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </Field>

                {/* Designation */}

                <Field label="Designation ID">
                  <input
                    type="text"
                    name="designationId"
                    value={form.designationId}
                    onChange={handleChange}
                    placeholder="Designation ID"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </Field>

                {/* Project */}

                <Field label="Project / Site">
                  <input
                    type="text"
                    name="siteProject"
                    value={form.siteProject}
                    onChange={handleChange}
                    placeholder="Project or site"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </Field>

                {/* Joining Date */}

                <Field label="Joining Date">
                  <input
                    type="date"
                    name="joiningDate"
                    value={form.joiningDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </Field>

                {/* Contract Start */}

                <Field label="Contract Start Date">
                  <input
                    type="date"
                    name="contractStartDate"
                    value={form.contractStartDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </Field>

                {/* Contract Expiry */}

                <Field label="Contract Expiry Date">
                  <input
                    type="date"
                    name="contractExpiryDate"
                    value={form.contractExpiryDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </Field>

                {/* Employee Status */}

                <Field label="Employee Status">
                  <select
                    name="employeeStatus"
                    value={form.employeeStatus}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </Field>

              </div>

            </Section>

            {/* ==================================================
                SALARY & ALLOWANCES
            ================================================== */}

            <Section
              icon={<DollarSign size={20} />}
              title="Salary & Allowances"
              desc="Configure employee salary and additional allowances."
            >

              <div className="grid grid-cols-1 gap-4">

                {[
                  {
                    label: 'Basic Salary',
                    name: 'basicSalary',
                  },
                  {
                    label: 'Housing Allowance',
                    name: 'housingAllowance',
                  },
                  {
                    label: 'Transportation Allowance',
                    name: 'transportationAllowance',
                  },
                  {
                    label: 'Food Allowance',
                    name: 'foodAllowance',
                  },
                  {
                    label: 'Site Allowance',
                    name: 'siteAllowance',
                  },
                  {
                    label: 'Normal Overtime Rate',
                    name: 'normalOvertimeRate',
                  },
                ].map((field) => (
                  <Field
                    key={field.name}
                    label={field.label}
                  >

                    <div className="relative">

                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                        $
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />

                    </div>

                  </Field>
                ))}

              </div>

            </Section>

            {/* ==================================================
                ACTION BUTTONS
            ================================================== */}

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-6 pb-10">

              {/* Clear All */}

              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Eraser size={18} />

                Clear All
              </button>

              {/* Cancel */}

              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              {/* Save Employee */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >

                {loading ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />

                    Saving Employee...
                  </>
                ) : (
                  <>
                    <Save size={19} />

                    Save Employee
                  </>
                )}

              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
};

/* ============================================================
   SECTION COMPONENT
============================================================ */

const Section = ({
  icon,
  title,
  desc,
  children,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* Section Header */}

      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 sm:px-6 sm:py-5">

        <div className="flex items-center gap-3">

          {/* Icon */}

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            {icon}
          </div>

          {/* Text */}

          <div>

            <h2 className="text-base font-black text-slate-900 sm:text-lg">
              {title}
            </h2>

            <p className="text-xs font-medium text-slate-500 sm:text-sm">
              {desc}
            </p>

          </div>

        </div>

      </div>

      {/* Section Content */}

      <div className="p-5 sm:p-6">
        {children}
      </div>

    </div>
  );
};

/* ============================================================
   FIELD COMPONENT
============================================================ */

const Field = ({
  label,
  required,
  children,
}) => {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[180px_1fr] sm:items-center sm:gap-4">

      {/* Label */}

      <label className="text-sm font-bold text-slate-700">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      {/* Input */}

      <div className="min-w-0">
        {children}
      </div>

    </div>
  );
};

export default AddEmployee;
import React, { useState, useEffect, useMemo } from 'react';
import { employeeAPI } from '../api';
import {
  Search,
  Plus,
  Filter,
  FileSpreadsheet,
  X,
  RefreshCw,
  Users,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import * as XLSX from 'xlsx';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');

  const [showFilters, setShowFilters] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  // =====================================================
  // GET EMPLOYEES
  // =====================================================

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await employeeAPI.getAll();

      // API response can be:
      // res.data
      // OR res.data.data
      // OR res.data.employees

      let data = [];

      if (Array.isArray(res?.data)) {
        data = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        data = res.data.data;
      } else if (Array.isArray(res?.data?.employees)) {
        data = res.data.employees;
      }

      setEmployees(data);
    } catch (err) {
      console.error('Error loading employees:', err);

      setError(
        err?.response?.data?.message ||
          'Unable to load employees.'
      );

      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // =====================================================
  // ADD EMPLOYEE
  // =====================================================

  const handleAddEmployee = () => {
    navigate('/employees/add');
  };

  // =====================================================
  // EXPORT EXCEL
  // =====================================================

  const handleExportExcel = () => {
    try {
      if (filteredEmployees.length === 0) {
        alert('No employees available to export.');
        return;
      }

      const excelData = filteredEmployees.map((emp) => ({
        'Employee ID':
          emp.id ||
          emp._id ||
          emp.empCode ||
          '',

        'Employee Code':
          emp.empCode || '',

        'English Name':
          emp.englishName || '',

        'Arabic Name':
          emp.arabicName || '',

        'CNIC / National ID':
          emp.cnic ||
          emp.nationalId ||
          '',

        'Nationality':
          emp.nationality || '',

        'Passport':
          emp.passport || '',

        'Mobile':
          emp.mobile || '',

        'Email':
          emp.email || '',

        'Address':
          emp.address || '',

        'Designation':
          emp.designationId ||
          emp.jobTitle ||
          '',

        'Department':
          emp.departmentId ||
          emp.department ||
          '',

        'Joining Date':
          emp.joiningDate || '',

        'Contract Start':
          emp.contractStartDate || '',

        'Contract Expiry':
          emp.contractExpiryDate || '',

        'Project / Site':
          emp.siteProject || '',

        'Status':
          emp.employeeStatus || '',

        'Basic Salary':
          emp.basicSalary || 0,

        'Housing Allowance':
          emp.housingAllowance || 0,

        'Transportation Allowance':
          emp.transportationAllowance || 0,

        'Food Allowance':
          emp.foodAllowance || 0,

        'Site Allowance':
          emp.siteAllowance || 0,

        'Overtime Rate':
          emp.normalOvertimeRate || 0
      }));

      // Create worksheet
      const worksheet =
        XLSX.utils.json_to_sheet(excelData);

      // Create workbook
      const workbook =
        XLSX.utils.book_new();

      // Add worksheet
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        'Employees'
      );

      // Auto column width
      const columnWidths = Object.keys(
        excelData[0]
      ).map((key) => ({
        wch: Math.max(
          key.length + 2,
          ...excelData.map((row) =>
            String(row[key] ?? '').length
          )
        )
      }));

      worksheet['!cols'] = columnWidths;

      // Generate file
      XLSX.writeFile(
        workbook,
        `Employees_${new Date()
          .toISOString()
          .split('T')[0]}.xlsx`
      );

    } catch (err) {
      console.error(
        'Excel export error:',
        err
      );

      alert(
        'Excel export failed. Please check that the xlsx package is installed.'
      );
    }
  };

  // =====================================================
  // FILTER TOGGLE
  // =====================================================

  const handleFilterToggle = () => {
    setShowFilters((prev) => !prev);
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setDepartmentFilter('');
    setStatusFilter('');
    setSearch('');
  };

  // =====================================================
  // UNIQUE DEPARTMENTS
  // =====================================================

  const departments = useMemo(() => {
    const values = employees
      .map(
        (emp) =>
          emp.departmentId ||
          emp.department
      )
      .filter(Boolean);

    return [...new Set(values)];
  }, [employees]);

  // =====================================================
  // FILTER EMPLOYEES
  // =====================================================

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const query =
        search.trim().toLowerCase();

      const employeeId =
        String(
          emp.id ||
            emp._id ||
            emp.empCode ||
            ''
        ).toLowerCase();

      const englishName =
        String(
          emp.englishName || ''
        ).toLowerCase();

      const arabicName =
        String(
          emp.arabicName || ''
        ).toLowerCase();

      const nationalId =
        String(
          emp.cnic ||
            emp.nationalId ||
            ''
        ).toLowerCase();

      const department =
        String(
          emp.departmentId ||
            emp.department ||
            ''
        ).toLowerCase();

      const designation =
        String(
          emp.designationId ||
            emp.jobTitle ||
            ''
        ).toLowerCase();

      const email =
        String(
          emp.email || ''
        ).toLowerCase();

      const mobile =
        String(
          emp.mobile || ''
        ).toLowerCase();

      // Search
      const matchesSearch =
        !query ||
        employeeId.includes(query) ||
        englishName.includes(query) ||
        arabicName.includes(query) ||
        nationalId.includes(query) ||
        department.includes(query) ||
        designation.includes(query) ||
        email.includes(query) ||
        mobile.includes(query);

      // Department
      const employeeDepartment =
        emp.departmentId ||
        emp.department ||
        '';

      const matchesDepartment =
        !departmentFilter ||
        employeeDepartment ===
          departmentFilter;

      // Status
      const employeeStatus =
        emp.employeeStatus ||
        'Active';

      const matchesStatus =
        !statusFilter ||
        employeeStatus ===
          statusFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [
    employees,
    search,
    departmentFilter,
    statusFilter
  ]);

  // =====================================================
  // ACTIVE FILTER COUNT
  // =====================================================

  const activeFilterCount =
    [
      search,
      departmentFilter,
      statusFilter
    ].filter(Boolean).length;

  // =====================================================
  // VIEW EMPLOYEE
  // =====================================================

  const handleViewEmployee = (emp) => {
    const id =
      emp.id ||
      emp._id;

    if (!id) {
      alert(
        'Employee ID is missing.'
      );
      return;
    }

    navigate(
      `/employee/${id}`
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      style={{
        padding: 40,
        minHeight: '100vh',
        background: '#f8fafc',
        direction:
          isRTL ? 'rtl' : 'ltr'
      }}
    >

      {/* ===============================================
          HEADER
      =============================================== */}

      <header
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          marginBottom: 32,
          gap: 20,
          flexWrap: 'wrap'
        }}
      >

        <div>

          <h1
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 900,
              color: '#0f172a'
            }}
          >
            {t('employees')} Directory
          </h1>

          <p
            style={{
              marginTop: 8,
              color: '#64748b',
              fontWeight: 600
            }}
          >
            Manage workforce profiles,
            documents, and roles.
          </p>

        </div>


        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap'
          }}
        >

          {/* REFRESH */}

          <button
            type="button"
            onClick={loadEmployees}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding:
                '10px 16px',
              borderRadius: 12,
              background: 'white',
              color: '#0f172a',
              border:
                '1px solid rgba(0,0,0,0.1)',
              fontWeight: 700,
              cursor:
                loading
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                loading ? 0.6 : 1
            }}
          >

            <RefreshCw
              size={18}
              className={
                loading
                  ? 'animate-spin'
                  : ''
              }
            />

            Refresh

          </button>


          {/* EXPORT */}

          <button
            type="button"
            onClick={
              handleExportExcel
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding:
                '10px 16px',
              borderRadius: 12,
              background: 'white',
              color: '#0f172a',
              border:
                '1px solid rgba(0,0,0,0.1)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >

            <FileSpreadsheet
              size={18}
            />

            Export Excel

          </button>


          {/* ADD EMPLOYEE */}

          <button
            type="button"
            onClick={
              handleAddEmployee
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding:
                '10px 16px',
              borderRadius: 12,
              background:
                '#0a84ff',
              color: 'white',
              border: 'none',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >

            <Plus size={18} />

            {t('addEmployee') ||
              'Add Employee'}

          </button>

        </div>

      </header>


      {/* ===============================================
          ERROR
      =============================================== */}

      {error && (
        <div
          style={{
            marginBottom: 20,
            padding: 16,
            borderRadius: 12,
            background: '#fee2e2',
            color: '#b91c1c',
            fontWeight: 700
          }}
        >
          {error}
        </div>
      )}


      {/* ===============================================
          SUMMARY
      =============================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 24
        }}
      >

        <SummaryCard
          icon={<Users size={20} />}
          title="Total Employees"
          value={employees.length}
        />

        <SummaryCard
          icon={<Users size={20} />}
          title="Active"
          value={
            employees.filter(
              (emp) =>
                (emp.employeeStatus ||
                  'Active') ===
                'Active'
            ).length
          }
        />

        <SummaryCard
          icon={<Users size={20} />}
          title="Inactive"
          value={
            employees.filter(
              (emp) =>
                emp.employeeStatus ===
                'Inactive'
            ).length
          }
        />

      </div>


      {/* ===============================================
          SEARCH + FILTER
      =============================================== */}

      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 24
        }}
      >

        {/* SEARCH */}

        <div
          style={{
            flex: 1,
            position: 'relative'
          }}
        >

          <Search
            size={18}
            color="#94a3b8"
            style={{
              position:
                'absolute',
              top: 14,
              left:
                isRTL
                  ? 'auto'
                  : 16,
              right:
                isRTL
                  ? 16
                  : 'auto'
            }}
          />

          <input
            type="text"
            placeholder={
              t('search') ||
              'Search employees...'
            }
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            style={{
              width: '100%',
              boxSizing:
                'border-box',
              padding:
                '12px 16px',
              paddingLeft:
                isRTL
                  ? 16
                  : 44,
              paddingRight:
                isRTL
                  ? 44
                  : 16,
              borderRadius: 12,
              border:
                '1px solid rgba(0,0,0,0.1)',
              fontSize: 15,
              fontWeight: 600,
              outline: 'none'
            }}
          />

        </div>


        {/* FILTER BUTTON */}

        <button
          type="button"
          onClick={
            handleFilterToggle
          }
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding:
              '0 20px',
            borderRadius: 12,
            background:
              showFilters
                ? '#e0f2fe'
                : 'white',
            color: '#0f172a',
            border:
              '1px solid rgba(0,0,0,0.1)',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace:
              'nowrap'
          }}
        >

          <Filter size={18} />

          Filters

          {activeFilterCount >
            0 && (
            <span
              style={{
                minWidth: 22,
                height: 22,
                borderRadius:
                  '50%',
                background:
                  '#0a84ff',
                color: 'white',
                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
                fontSize: 12
              }}
            >
              {activeFilterCount}
            </span>
          )}

        </button>

      </div>


      {/* ===============================================
          FILTER PANEL
      =============================================== */}

      {showFilters && (
        <div
          style={{
            background:
              'white',
            padding: 20,
            borderRadius: 16,
            marginBottom: 24,
            border:
              '1px solid rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems:
              'flex-end',
            gap: 16,
            flexWrap: 'wrap'
          }}
        >

          {/* DEPARTMENT */}

          <div>

            <label
              style={{
                display: 'block',
                marginBottom: 8,
                fontWeight: 700,
                color: '#475569'
              }}
            >
              Department
            </label>

            <select
              value={
                departmentFilter
              }
              onChange={(e) =>
                setDepartmentFilter(
                  e.target.value
                )
              }
              style={{
                minWidth: 220,
                padding:
                  '10px 12px',
                borderRadius: 10,
                border:
                  '1px solid #cbd5e1',
                outline: 'none',
                background:
                  'white'
              }}
            >

              <option value="">
                All Departments
              </option>

              {departments.map(
                (department) => (
                  <option
                    key={department}
                    value={
                      department
                    }
                  >
                    {department}
                  </option>
                )
              )}

            </select>

          </div>


          {/* STATUS */}

          <div>

            <label
              style={{
                display: 'block',
                marginBottom: 8,
                fontWeight: 700,
                color: '#475569'
              }}
            >
              Status
            </label>

            <select
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              style={{
                minWidth: 180,
                padding:
                  '10px 12px',
                borderRadius: 10,
                border:
                  '1px solid #cbd5e1',
                outline: 'none',
                background:
                  'white'
              }}
            >

              <option value="">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

            </select>

          </div>


          {/* CLEAR */}

          <button
            type="button"
            onClick={
              clearFilters
            }
            style={{
              display: 'flex',
              alignItems:
                'center',
              gap: 6,
              padding:
                '10px 16px',
              borderRadius: 10,
              border: 'none',
              background:
                '#fee2e2',
              color:
                '#dc2626',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >

            <X size={16} />

            Clear Filters

          </button>

        </div>
      )}


      {/* ===============================================
          RESULTS INFO
      =============================================== */}

      <div
        style={{
          marginBottom: 12,
          color: '#64748b',
          fontSize: 14,
          fontWeight: 700
        }}
      >
        Showing{' '}
        {filteredEmployees.length}{' '}
        of {employees.length}{' '}
        employees
      </div>


      {/* ===============================================
          TABLE
      =============================================== */}

      <div
        style={{
          background:
            'white',
          borderRadius: 24,
          border:
            '1px solid rgba(0,0,0,0.05)',
          overflow: 'auto'
        }}
      >

        <table
          style={{
            width: '100%',
            minWidth: 900,
            borderCollapse:
              'collapse',
            textAlign:
              isRTL
                ? 'right'
                : 'left'
          }}
        >

          <thead>

            <tr
              style={{
                background:
                  '#f8fafc',
                borderBottom:
                  '1px solid rgba(0,0,0,0.05)'
              }}
            >

              <th style={thStyle}>
                Employee
              </th>

              <th style={thStyle}>
                ID
              </th>

              <th style={thStyle}>
                Role & Dept
              </th>

              <th style={thStyle}>
                Project
              </th>

              <th style={thStyle}>
                Status
              </th>

              <th
                style={{
                  ...thStyle,
                  textAlign:
                    'center'
                }}
              >
                Action
              </th>

            </tr>

          </thead>


          <tbody>

            {filteredEmployees.map(
              (emp) => {

                const id =
                  emp.id ||
                  emp._id ||
                  emp.empCode;

                const name =
                  emp.englishName ||
                  emp.arabicName ||
                  'Unnamed Employee';

                const department =
                  emp.departmentId ||
                  emp.department ||
                  '-';

                const designation =
                  emp.designationId ||
                  emp.jobTitle ||
                  '-';

                const status =
                  emp.employeeStatus ||
                  'Active';

                return (
                  <tr
                    key={id}
                    style={{
                      borderBottom:
                        '1px solid rgba(0,0,0,0.05)'
                    }}
                  >

                    {/* EMPLOYEE */}

                    <td
                      style={
                        tdStyle
                      }
                    >

                      <div
                        style={{
                          display:
                            'flex',
                          alignItems:
                            'center',
                          gap: 12
                        }}
                      >

                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius:
                              12,
                            background:
                              '#e0f2fe',
                            color:
                              '#0369a1',
                            display:
                              'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            fontWeight:
                              900
                          }}
                        >
                          {name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <div
                            style={{
                              fontWeight:
                                800,
                              color:
                                '#0f172a'
                            }}
                          >
                            {isRTL
                              ? emp.arabicName ||
                                name
                              : name}
                          </div>

                          <div
                            style={{
                              fontSize:
                                12,
                              color:
                                '#94a3b8',
                              fontWeight:
                                600
                            }}
                          >
                            {emp.email ||
                              emp.nationality ||
                              '-'}
                          </div>

                        </div>

                      </div>

                    </td>


                    {/* ID */}

                    <td
                      style={{
                        ...tdStyle,
                        fontWeight: 700,
                        color:
                          '#475569'
                      }}
                    >
                      {id}
                    </td>


                    {/* ROLE */}

                    <td
                      style={
                        tdStyle
                      }
                    >

                      <div
                        style={{
                          fontWeight:
                            700,
                          color:
                            '#0f172a',
                          fontSize:
                            14
                        }}
                      >
                        {designation}
                      </div>

                      <div
                        style={{
                          fontSize:
                            12,
                          color:
                            '#64748b',
                          fontWeight:
                            600
                        }}
                      >
                        {department}
                      </div>

                    </td>


                    {/* PROJECT */}

                    <td
                      style={{
                        ...tdStyle,
                        fontWeight:
                          700,
                        color:
                          '#475569'
                      }}
                    >
                      {emp.siteProject ||
                        '-'}
                    </td>


                    {/* STATUS */}

                    <td
                      style={
                        tdStyle
                      }
                    >

                      <span
                        style={{
                          display:
                            'inline-block',
                          padding:
                            '6px 12px',
                          borderRadius:
                            8,
                          background:
                            status ===
                            'Active'
                              ? '#dcfce7'
                              : '#fee2e2',
                          color:
                            status ===
                            'Active'
                              ? '#16a34a'
                              : '#dc2626',
                          fontWeight:
                            800,
                          fontSize:
                            12
                        }}
                      >
                        {status}
                      </span>

                    </td>


                    {/* ACTION */}

                    <td
                      style={{
                        ...tdStyle,
                        textAlign:
                          'center'
                      }}
                    >

                      <button
                        type="button"
                        onClick={() =>
                          handleViewEmployee(
                            emp
                          )
                        }
                        title="View Employee"
                        style={{
                          display:
                            'inline-flex',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          width: 38,
                          height: 38,
                          borderRadius:
                            10,
                          border:
                            'none',
                          background:
                            '#eff6ff',
                          color:
                            '#2563eb',
                          cursor:
                            'pointer'
                        }}
                      >

                        <Eye
                          size={18}
                        />

                      </button>

                    </td>

                  </tr>
                );
              }
            )}

          </tbody>

        </table>


        {/* LOADING */}

        {loading && (
          <div
            style={{
              padding: 50,
              textAlign:
                'center',
              color:
                '#64748b',
              fontWeight: 700
            }}
          >
            Loading employees...
          </div>
        )}


        {/* EMPTY */}

        {!loading &&
          filteredEmployees.length ===
            0 && (
            <div
              style={{
                padding: 60,
                textAlign:
                  'center',
                color:
                  '#94a3b8'
              }}
            >

              <Users
                size={42}
                style={{
                  margin:
                    '0 auto 12px'
                }}
              />

              <div
                style={{
                  fontWeight:
                    800,
                  color:
                    '#475569'
                }}
              >
                No employees found
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 14
                }}
              >
                Try changing your
                search or filters.
              </div>

            </div>
          )}

      </div>

    </div>
  );
};


// ======================================================
// SUMMARY CARD
// ======================================================

const SummaryCard = ({
  icon,
  title,
  value
}) => {
  return (
    <div
      style={{
        background:
          'white',
        borderRadius: 18,
        border:
          '1px solid rgba(0,0,0,0.05)',
        padding: 18
      }}
    >

      <div
        style={{
          display:
            'flex',
          alignItems:
            'center',
          gap: 12
        }}
      >

        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background:
              '#eff6ff',
            color:
              '#2563eb',
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center'
          }}
        >
          {icon}
        </div>

        <div>

          <div
            style={{
              color:
                '#64748b',
              fontSize: 13,
              fontWeight:
                700
            }}
          >
            {title}
          </div>

          <div
            style={{
              color:
                '#0f172a',
              fontSize: 24,
              fontWeight:
                900
            }}
          >
            {value}
          </div>

        </div>

      </div>

    </div>
  );
};


// ======================================================
// TABLE STYLES
// ======================================================

const thStyle = {
  padding:
    '16px 24px',
  fontSize: 12,
  fontWeight: 800,
  color:
    '#64748b',
  textTransform:
    'uppercase',
  whiteSpace:
    'nowrap'
};

const tdStyle = {
  padding:
    '16px 24px'
};


export default Employees;
const INITIAL_DATA = {
  employees: [
    {
      id: "EMP-001",
      arabicName: "أحمد عبد الله",
      englishName: "Ahmed Abdullah",
      nationality: "Saudi",
      gender: "Male",
      dateOfBirth: "1985-04-12",
      nationalId: "1029384756",
      passport: "P-12345678",
      mobile: "0501234567",
      email: "ahmed@concretestructures.sa",
      address: "Riyadh, KSA",
      emergencyContact: "0559876543",
      
      company: "Concrete Structures",
      branch: "Riyadh HQ",
      department: "Engineering",
      jobTitle: "Senior Civil Engineer",
      employeeCategory: "White Collar",
      siteProject: "Project Alpha",
      supervisor: "EMP-005",
      employmentType: "Full-Time",
      joiningDate: "2015-06-01",
      contractStartDate: "2024-06-01",
      contractExpiryDate: "2026-09-01", // expiring in ~25 days (since current is Aug 2026)
      contractDuration: "2 Years",
      probationPeriod: "Completed",
      employeeStatus: "Active",
      
      salaryStructure: {
        basicSalary: 12000,
        housingAllowance: 3000,
        transportationAllowance: 1200,
        foodAllowance: 800,
        siteAllowance: 1000,
        mobileAllowance: 200,
        otherAllowances: 0,
        normalOvertimeRate: 1.5,
        weekendRate: 2.0
      },
      
      documents: [
        { type: "Employment Contract", issueDate: "2024-06-01", expiryDate: "2026-09-01" },
        { type: "Iqama", issueDate: "2023-01-10", expiryDate: "2024-10-15" } // exp soon
      ],
      history: [
        { date: "2015-06-01", event: "Joined company as Junior Engineer" },
        { date: "2019-03-15", event: "Promoted to Civil Engineer" },
        { date: "2023-01-01", event: "Transferred to Project Alpha" }
      ]
    },
    {
      id: "EMP-002",
      arabicName: "سارة خالد",
      englishName: "Sarah Khalid",
      nationality: "Jordanian",
      gender: "Female",
      dateOfBirth: "1990-08-22",
      nationalId: "2093847561",
      passport: "J-87654321",
      mobile: "0541122334",
      email: "sarah@concretestructures.sa",
      address: "Jeddah, KSA",
      emergencyContact: "0509988776",
      
      company: "Concrete Structures",
      branch: "Jeddah Branch",
      department: "HR",
      jobTitle: "HR Manager",
      employeeCategory: "Management",
      siteProject: "HQ",
      supervisor: "EMP-000",
      employmentType: "Full-Time",
      joiningDate: "2018-03-15",
      contractStartDate: "2023-03-15",
      contractExpiryDate: "2024-03-14", // Expired
      contractDuration: "1 Year",
      probationPeriod: "Completed",
      employeeStatus: "Active",
      
      salaryStructure: {
        basicSalary: 15000,
        housingAllowance: 3750,
        transportationAllowance: 1500,
        foodAllowance: 0,
        siteAllowance: 0,
        mobileAllowance: 500,
        otherAllowances: 0,
        normalOvertimeRate: 1.5,
        weekendRate: 2.0
      },
      
      documents: [
        { type: "Employment Contract", issueDate: "2023-03-15", expiryDate: "2024-03-14" },
        { type: "Iqama", issueDate: "2023-05-01", expiryDate: "2024-04-30" } // Expired
      ],
      history: [
        { date: "2018-03-15", event: "Joined company as HR Specialist" },
        { date: "2021-06-01", event: "Promoted to HR Manager" }
      ]
    }
  ],
  departments: ["Engineering", "HR", "Finance", "Operations", "Sales"],
  projects: [
    { id: "PROJ-1", name: "Project Alpha - Riyadh Tower", budget: 5000000, currentLaborCost: 450000 },
    { id: "PROJ-2", name: "Project Beta - Jeddah Mall", budget: 3000000, currentLaborCost: 200000 },
    { id: "PROJ-3", name: "Project Gamma - Dammam Plant", budget: 1500000, currentLaborCost: 80000 }
  ],
  attendance: [
    { id: 1, employeeId: "EMP-001", date: "2026-08-07", clockIn: "08:00", clockOut: null, status: "Present", projectId: "PROJ-1" },
    { id: 2, employeeId: "EMP-002", date: "2026-08-07", clockIn: "08:15", clockOut: null, status: "Late", projectId: "HQ" }
  ],
  leaves: [
    { id: 1, employeeId: "EMP-001", type: "Annual", startDate: "2026-08-10", endDate: "2026-08-20", status: "Pending" }
  ],
  loans: [
    { id: 1, employeeId: "EMP-001", amount: 10000, issueDate: "2026-01-01", installments: 10, paidAmount: 6000, status: "Active" }
  ],
  overtime: [
    { id: 1, employeeId: "EMP-001", date: "2026-08-05", hours: 4, type: "Normal", rate: 1.5, status: "Pending", projectId: "PROJ-1" },
    { id: 2, employeeId: "EMP-001", date: "2026-08-06", hours: 2, type: "Normal", rate: 1.5, status: "Pending", projectId: "PROJ-1" }
  ],
  payrolls: []
};

// Use v2 to force reset the data for the new demo features
const DB_KEY = 'erp_mock_db_v2';

if (!localStorage.getItem(DB_KEY)) {
  localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
}

class MockDB {
  get data() {
    return JSON.parse(localStorage.getItem(DB_KEY));
  }

  save(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }

  async getEmployees() {
    return this.data.employees;
  }

  async addEmployee(employee) {
    const data = this.data;
    employee.id = `EMP-${(data.employees.length + 1).toString().padStart(3, '0')}`;
    data.employees.push(employee);
    this.save(data);
    return employee;
  }
  
  async updateEmployee(id, updates) {
    const data = this.data;
    const index = data.employees.findIndex(e => e.id === id);
    if (index !== -1) {
      data.employees[index] = { ...data.employees[index], ...updates };
      this.save(data);
      return data.employees[index];
    }
    throw new Error('Employee not found');
  }

  async getProjects() {
    return this.data.projects;
  }
  
  async getDepartments() {
    return this.data.departments;
  }

  async getAttendance() {
    return this.data.attendance;
  }

  async getLoans() {
    return this.data.loans;
  }

  async getLeaves() {
    return this.data.leaves;
  }

  async getOvertime() {
    return this.data.overtime || [];
  }
  
  async updateOvertimeStatus(id, status) {
    const data = this.data;
    const index = data.overtime.findIndex(o => o.id === id);
    if (index !== -1) {
      data.overtime[index].status = status;
      this.save(data);
      return data.overtime[index];
    }
    throw new Error('Overtime record not found');
  }
  
  async addLeave(leave) {
    const data = this.data;
    leave.id = Date.now();
    data.leaves.push(leave);
    this.save(data);
    return leave;
  }
  
  async getStats() {
    const data = this.data;
    const totalEmployees = data.employees.length;
    const activeEmployees = data.employees.filter(e => e.employeeStatus === 'Active').length;
    
    let totalPayroll = 0;
    data.employees.forEach(e => {
        const s = e.salaryStructure;
        totalPayroll += (s.basicSalary + s.housingAllowance + s.transportationAllowance + s.foodAllowance + s.siteAllowance + s.mobileAllowance + s.otherAllowances);
    });

    return {
      totalEmployees,
      activeEmployees,
      estPayroll: totalPayroll,
      pendingLeaves: data.leaves.filter(l => l.status === 'Pending').length,
      saudiEmployees: data.employees.filter(e => e.nationality === 'Saudi').length,
      nonSaudiEmployees: data.employees.filter(e => e.nationality !== 'Saudi').length
    };
  }
}

export const mockDB = new MockDB();

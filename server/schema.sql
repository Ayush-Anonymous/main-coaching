-- Institute Compass - MySQL Schema
-- Hostinger Compatible (MySQL 8.0+)

-- Profiles table (users)
CREATE TABLE IF NOT EXISTS profiles (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  role ENUM('admin', 'director', 'faculty', 'student') NOT NULL DEFAULT 'student',
  UNIQUE KEY unique_user_role (user_id, role),
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_months INT DEFAULT 12,
  fee_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Batches table
CREATE TABLE IF NOT EXISTS batches (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  course_id CHAR(36),
  start_date DATE,
  end_date DATE,
  capacity INT DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  enrollment_number VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  date_of_birth DATE,
  guardian_name VARCHAR(255),
  guardian_phone VARCHAR(50),
  course_id CHAR(36),
  batch_id CHAR(36),
  status ENUM('active', 'inactive', 'dropped', 'graduated') DEFAULT 'active',
  admission_date DATE DEFAULT (CURRENT_DATE),
  total_fee DECIMAL(10,2) DEFAULT 0,
  paid_fee DECIMAL(10,2) DEFAULT 0,
  fee_status ENUM('paid', 'pending', 'overdue', 'partial') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL
);

-- Fee payments table
CREATE TABLE IF NOT EXISTS fee_payments (
  id CHAR(36) PRIMARY KEY,
  student_id CHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE DEFAULT (CURRENT_DATE),
  payment_method VARCHAR(100),
  receipt_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Enquiries table
CREATE TABLE IF NOT EXISTS enquiries (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  course_interest VARCHAR(255),
  message TEXT,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tests table
CREATE TABLE IF NOT EXISTS tests (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  course_id CHAR(36),
  batch_id CHAR(36),
  max_marks INT NOT NULL DEFAULT 100,
  passing_marks INT NOT NULL DEFAULT 40,
  test_date DATE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL
);

-- Marks table
CREATE TABLE IF NOT EXISTS marks (
  id CHAR(36) PRIMARY KEY,
  student_id CHAR(36) NOT NULL,
  test_id CHAR(36) NOT NULL,
  marks_obtained INT NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_test (student_id, test_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

-- Faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  qualification VARCHAR(255),
  specialization VARCHAR(255),
  experience_years INT DEFAULT 0,
  joining_date DATE DEFAULT (CURRENT_DATE),
  salary DECIMAL(10,2) DEFAULT 0,
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id CHAR(36) PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  value JSON NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (id, `key`, value, description) VALUES
  (UUID(), 'institute', '{"name": "EduElite Institute", "address": "", "phone": "", "email": "", "website": "", "logo_url": ""}', 'Institute basic information'),
  (UUID(), 'academic', '{"current_session": "2024-25", "session_start": "2024-04-01", "session_end": "2025-03-31"}', 'Academic year settings'),
  (UUID(), 'fees', '{"late_fee_percentage": 5, "grace_period_days": 7}', 'Fee configuration')
ON DUPLICATE KEY UPDATE id = id;

-- Create default admin user (password: admin123)
-- bcrypt hash of 'admin123'
INSERT INTO profiles (id, email, full_name, password_hash) VALUES
  (UUID(), 'admin@institute.com', 'Administrator', '$2a$10$rGLMKpNKvmFxDvI4vXXMZeKJVT.xYpGmMVzKPxVgmxGzT9YU.Xmye')
ON DUPLICATE KEY UPDATE id = id;

-- Assign admin role (run after creating admin user)
-- INSERT INTO user_roles (id, user_id, role) 
-- SELECT UUID(), id, 'admin' FROM profiles WHERE email = 'admin@institute.com'
-- ON DUPLICATE KEY UPDATE id = id;

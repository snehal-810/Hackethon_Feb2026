CREATE DATABASE admission_management_db;
USE admission_management_db;

CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE batches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    batch_name VARCHAR(150) NOT NULL,
    fee DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL,
    location_mode ENUM('ONLINE', 'OFFLINE') NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    registration_code VARCHAR(50) UNIQUE NOT NULL,
    student_id INT NOT NULL,
    batch_id INT NOT NULL,
    original_fee DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (batch_id) REFERENCES batches(id),

    UNIQUE KEY unique_active_registration (student_id, status)
);

CREATE TABLE discount_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE discounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    discount_name VARCHAR(150) NOT NULL,
    discount_type_id INT NOT NULL,

    value_type ENUM('FLAT', 'PERCENTAGE') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,

    start_date DATE,
    end_date DATE,

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (discount_type_id) REFERENCES discount_types(id)
);

CREATE TABLE discount_batches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    discount_id INT NOT NULL,
    batch_id INT NOT NULL,
    FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    UNIQUE (discount_id, batch_id)
);

CREATE TABLE discount_students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    discount_id INT NOT NULL,
    student_id INT NOT NULL,
    FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE (discount_id, student_id)
);

CREATE TABLE discount_combo_batches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    discount_id INT NOT NULL,
    batch_id INT NOT NULL,
    FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
);

CREATE TABLE registration_discounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    registration_id INT NOT NULL,
    discount_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
    FOREIGN KEY (discount_id) REFERENCES discounts(id),

    UNIQUE (registration_id)
);
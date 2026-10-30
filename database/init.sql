-- NASCON University Tech Event - Database Initialization
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    university VARCHAR(150) NOT NULL,
    student_id VARCHAR(50),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    team_size_min INT DEFAULT 1,
    team_size_max INT DEFAULT 4,
    registration_fee NUMERIC(10, 2) DEFAULT 0.00,
    prize_pool VARCHAR(100),
    venue VARCHAR(100) NOT NULL,
    event_date VARCHAR(50) NOT NULL,
    rules TEXT,
    icon VARCHAR(50) DEFAULT 'code',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    event_id INT REFERENCES events(id) ON DELETE CASCADE,
    team_name VARCHAR(100) NOT NULL,
    leader_name VARCHAR(100) NOT NULL,
    leader_email VARCHAR(120) NOT NULL,
    leader_phone VARCHAR(20) NOT NULL,
    members TEXT, -- JSON or comma-separated list of team members
    status VARCHAR(30) DEFAULT 'CONFIRMED',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Competitions for NASCON
INSERT INTO events (title, category, description, team_size_min, team_size_max, registration_fee, prize_pool, venue, event_date, rules, icon)
VALUES 
(
    'Speed Programming Battle',
    'Coding',
    'Intense competitive programming contest testing algorithms, data structures, and algorithmic speed in C++, Java, and Python.',
    1,
    3,
    1500.00,
    'PKR 75,000',
    'Computing Lab 3 & 4',
    'Day 1 - 10:00 AM',
    'Standard ICPC rules. No internet browsing allowed. Solutions evaluated by automated judge.',
    'code'
),
(
    'Web & App Hackathon',
    'Development',
    '24-hour sprint to build a full-stack production-ready software solution addressing real-world university and community challenges.',
    2,
    4,
    2500.00,
    'PKR 100,000',
    'Incubation Center',
    'Day 1 - 02:00 PM',
    'All code must be written during the event. Open source libraries allowed. Live deployment required.',
    'layout'
),
(
    'Capture The Flag (CTF)',
    'Cyber Security',
    'Jeopardy & attack-defense cybersecurity challenges spanning web exploitation, reverse engineering, cryptography, and forensics.',
    1,
    3,
    1800.00,
    'PKR 60,000',
    'Network Security Lab',
    'Day 2 - 09:30 AM',
    'No attacking event infrastructure. Sharing flags between teams leads to immediate disqualification.',
    'shield'
),
(
    'RoboRace & Maze Runner',
    'Robotics',
    'Autonomous and manual micro-robot navigation across high-complexity obstacle courses, ramps, and timed tracks.',
    1,
    4,
    2000.00,
    'PKR 80,000',
    'Central Gymnasium Arena',
    'Day 2 - 11:00 AM',
    'Robots must comply with standard chassis dimensions (max 30x30 cm). Lithium battery safety compliance required.',
    'cpu'
),
(
    'AI & Data Science Challenge',
    'Artificial Intelligence',
    'Build, fine-tune, and pitch state-of-the-art predictive ML models and GenAI applications on masked industry datasets.',
    1,
    3,
    2000.00,
    'PKR 70,000',
    'Data Science Research Lab',
    'Day 2 - 01:00 PM',
    'Evaluation based on F1-score/RMSE metrics and final panel presentation.',
    'bar-chart-2'
),
(
    'E-Sports Arena (Valorant & FIFA)',
    'Gaming',
    'Collegiate multi-platform e-sports tournament competing in double-elimination brackets for the university championship trophy.',
    1,
    5,
    2500.00,
    'PKR 50,000',
    'Student Center Auditorium',
    'Day 3 - 10:00 AM',
    'Standard tournament match rules. Own peripherals allowed. Fair play conduct strictly enforced.',
    'gamepad-2'
)
ON CONFLICT DO NOTHING;


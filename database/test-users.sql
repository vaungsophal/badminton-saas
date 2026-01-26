-- Create test admin user
INSERT INTO user_profiles (id, email, password_hash, role, full_name, created_at, updated_at)
VALUES (
    'admin-test-123',
    'admin@test.com',
    '$2b$10$g8u86Wu2SMrF/UWUL2r1v..Q6utx9AYu1D0xmF3OxtJUtgl52qhSy',
    'admin',
    'Test Administrator',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create test club owner user
INSERT INTO user_profiles (id, email, password_hash, role, company_name, full_name, created_at, updated_at)
VALUES (
    'owner-test-123',
    'owner@test.com',
    '$2b$10$LTzr8U8f47mxCgxEWz1loelEOYfXmFY7G1gW.DJE0zX/4/TfEUUVG',
    'club_owner',
    'Test Badminton Club',
    'Test Club Owner',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create test customer user
INSERT INTO user_profiles (id, email, password_hash, role, full_name, created_at, updated_at)
VALUES (
    'customer-test-123',
    'customer@test.com',
    '$2b$10$XAPLQMb1Frh5pBgcQ7ewS./DdjiSQGdeTL0JdhMrCJgxIUbrpKnpS',
    'customer',
    'Test Customer',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;
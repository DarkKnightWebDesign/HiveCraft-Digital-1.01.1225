-- HiveCraft Digital - Initial Schema Migration
-- Azure SQL Database

CREATE TABLE projects (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    workspace_id NVARCHAR(255) NOT NULL,
    client_user_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(500) NOT NULL,
    project_type NVARCHAR(50) NOT NULL,
    track NVARCHAR(50) NOT NULL,
    package_tier NVARCHAR(100),
    complexity_score DECIMAL(5,2),
    status NVARCHAR(50) DEFAULT 'discovery',
    progress_percent INT DEFAULT 0,
    budget_range NVARCHAR(50),
    timeline NVARCHAR(100),
    summary NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE project_intake (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    project_id UNIQUEIDENTIFIER NOT NULL,
    primary_goals NVARCHAR(MAX),
    required_features NVARCHAR(MAX),
    existing_constraints NVARCHAR(MAX),
    growth_expectations NVARCHAR(MAX),
    recommended_options NVARCHAR(MAX),
    selected_option NVARCHAR(MAX),
    add_ons NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE project_contacts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    project_id UNIQUEIDENTIFIER NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    phone NVARCHAR(50),
    business_name NVARCHAR(255),
    website_url NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE project_activity (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    project_id UNIQUEIDENTIFIER NOT NULL,
    action NVARCHAR(100),
    details NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);


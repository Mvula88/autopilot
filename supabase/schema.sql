-- Parent Communication Autopilot Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teachers table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  school_name TEXT,
  grade_level TEXT,
  subjects TEXT[],
  timezone TEXT DEFAULT 'America/New_York',
  digest_day TEXT DEFAULT 'friday',
  digest_time TIME DEFAULT '15:00',
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  academic_year TEXT DEFAULT '2024-2025',
  grade_level TEXT,
  subject TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  student_id TEXT,
  email TEXT,
  current_grades JSONB DEFAULT '{}',
  grade_history JSONB[] DEFAULT ARRAY[]::JSONB[],
  attendance_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parents table
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT,
  preferred_language TEXT DEFAULT 'en',
  communication_preference TEXT DEFAULT 'email',
  timezone TEXT DEFAULT 'America/New_York',
  subscription_tier TEXT DEFAULT 'free',
  last_opened_at TIMESTAMPTZ,
  engagement_score INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student-Parent relationship
CREATE TABLE student_parents (
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent',
  is_primary BOOLEAN DEFAULT false,
  receive_updates BOOLEAN DEFAULT true,
  PRIMARY KEY (student_id, parent_id)
);

-- Communications/emails sent
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('weekly_digest', 'quick_note', 'alert')),
  teacher_id UUID REFERENCES teachers(id),
  student_id UUID REFERENCES students(id),
  parent_id UUID REFERENCES parents(id),
  subject TEXT NOT NULL,
  content_html TEXT NOT NULL,
  content_plain TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quick notes from teachers
CREATE TABLE quick_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('positive', 'concern', 'info')),
  category TEXT,
  message TEXT NOT NULL,
  sent_to_parents BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grade imports tracking
CREATE TABLE grade_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  file_name TEXT,
  import_data JSONB,
  processed_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- Create policies for teachers to only see their own data
CREATE POLICY "Teachers can manage own profile" ON teachers
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Teachers can manage own classes" ON classes
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can manage students in their classes" ON students
  FOR ALL USING (class_id IN (
    SELECT id FROM classes WHERE teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can manage own quick notes" ON quick_notes
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can view own communications" ON communications
  FOR SELECT USING (teacher_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_communications_parent ON communications(parent_id);
CREATE INDEX idx_communications_status ON communications(status);
CREATE INDEX idx_quick_notes_student ON quick_notes(student_id);
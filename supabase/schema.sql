-- GradeAssist Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teachers table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  school_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT,
  grade_level TEXT,
  academic_year TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id TEXT, -- School-provided ID
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- Rubrics table
CREATE TABLE rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('essay', 'short_answer')),
  criteria JSONB NOT NULL, -- Stores rubric categories and point values
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  rubric_id UUID REFERENCES rubrics(id),
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('multiple_choice', 'short_answer', 'essay')),
  total_points INTEGER,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  image_urls TEXT[], -- Array of uploaded image URLs
  ocr_text TEXT,
  ai_grade JSONB, -- Stores AI grading details
  ai_confidence JSONB, -- Confidence scores for each criterion
  final_grade DECIMAL(5,2),
  teacher_comments TEXT,
  status TEXT CHECK (status IN ('pending', 'ai_graded', 'reviewed', 'finalized')),
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answer keys for objective questions
CREATE TABLE answer_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  answers JSONB NOT NULL, -- Stores correct answers
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_keys ENABLE ROW LEVEL SECURITY;

-- Teachers can only see their own data
CREATE POLICY "Teachers can view own profile" ON teachers
  FOR ALL USING (auth.uid() = id);

-- Teachers can manage their own classes
CREATE POLICY "Teachers can manage own classes" ON classes
  FOR ALL USING (teacher_id = auth.uid());

-- Teachers can manage students in their classes
CREATE POLICY "Teachers can manage students in own classes" ON students
  FOR ALL USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = auth.uid()
    )
  );

-- Teachers can manage their own rubrics
CREATE POLICY "Teachers can manage own rubrics" ON rubrics
  FOR ALL USING (teacher_id = auth.uid());

-- Teachers can manage assignments for their classes
CREATE POLICY "Teachers can manage assignments for own classes" ON assignments
  FOR ALL USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = auth.uid()
    )
  );

-- Teachers can manage submissions for their assignments
CREATE POLICY "Teachers can manage submissions for own assignments" ON submissions
  FOR ALL USING (
    assignment_id IN (
      SELECT a.id FROM assignments a
      JOIN classes c ON a.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Teachers can manage answer keys for their assignments
CREATE POLICY "Teachers can manage answer keys for own assignments" ON answer_keys
  FOR ALL USING (
    assignment_id IN (
      SELECT a.id FROM assignments a
      JOIN classes c ON a.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_assignments_class_id ON assignments(class_id);
CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_submissions_student_id ON submissions(student_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_answer_keys_assignment_id ON answer_keys(assignment_id);
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  subject_id: string;
}

export interface SubTopic {
  id: string;
  name: string;
  topic_id: string;
}

export interface Test {
  id: string;
  name: string;
  subject: string;
  type: string;
  topics: string[];
  sub_topics?: string[];
  status: 'draft' | 'live' | 'archived';
  created_at: string;
  total_questions?: number;
  total_marks?: number;
  total_time?: number;
  difficulty?: string;
  correct_marks?: number;
  wrong_marks?: number;
  unattempt_marks?: number;
}

export interface Question {
  id?: string;
  type: 'mcq';
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: 'option1' | 'option2' | 'option3' | 'option4';
  explanation?: string;
  difficulty?: string;
  test_id?: string;
  topic?: string;
  sub_topic?: string;
  media_url?: string;
}

export type Database = {
  public: {
    Tables: {
      exams: {
        Row: {
          id: string
          title: string
          description: string | null
          is_locked: boolean
          unlock_key: string | null
          duration_minutes: number
          start_time: string | null
          end_time: string | null
          passing_score: number
          grading_mode: 'automatic' | 'manual'
          show_correct_answers: boolean
          show_incorrect_answers: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          is_locked?: boolean
          unlock_key?: string | null
          duration_minutes: number
          start_time?: string | null
          end_time?: string | null
          passing_score?: number
          grading_mode?: 'automatic' | 'manual'
          show_correct_answers?: boolean
          show_incorrect_answers?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          is_locked?: boolean
          unlock_key?: string | null
          duration_minutes?: number
          start_time?: string | null
          end_time?: string | null
          passing_score?: number
          grading_mode?: 'automatic' | 'manual'
          show_correct_answers?: boolean
          show_incorrect_answers?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      questions: {
        Row: {
          id: string
          exam_id: string | null
          title: string
          question_text: string
          question_type: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false' | 'matching' | 'dropdown'
          options: any | null
          difficulty: 'easy' | 'medium' | 'hard'
          tags: string[] | null
          order_index: number
          points: number
          section: string | null
          case_context: string | null
          correct_answer: string | null
          model_answer: string | null
          rubric: string | null
          essay_scoring_config: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          exam_id: string | null
          title: string
          question_text: string
          question_type: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false' | 'matching' | 'dropdown'
          options?: any | null
          difficulty?: 'easy' | 'medium' | 'hard'
          tags?: string[] | null
          order_index?: number
          points?: number
          section?: string | null
          case_context?: string | null
          correct_answer?: string | null
          model_answer?: string | null
          rubric?: string | null
          essay_scoring_config?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          exam_id?: string | null
          title?: string
          question_text?: string
          question_type?: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false' | 'matching' | 'dropdown'
          options?: any | null
          difficulty?: 'easy' | 'medium' | 'hard'
          tags?: string[] | null
          order_index?: number
          points?: number
          section?: string | null
          case_context?: string | null
          correct_answer?: string | null
          model_answer?: string | null
          rubric?: string | null
          essay_scoring_config?: any
          created_at?: string
          updated_at?: string
        }
      }

      exam_attempts: {
        Row: {
          id: string
          user_id: string
          exam_id: string
          started_at: string
          submitted_at: string | null
          score: number | null
          is_passed: boolean | null
          status: 'in_progress' | 'submitted' | 'under_review' | 'graded'
          time_left: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exam_id: string
          started_at?: string
          submitted_at?: string | null
          score?: number | null
          is_passed?: boolean | null
          status?: 'in_progress' | 'submitted' | 'under_review' | 'graded'
          time_left?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exam_id?: string
          started_at?: string
          submitted_at?: string | null
          score?: number | null
          is_passed?: boolean | null
          status?: 'in_progress' | 'submitted' | 'under_review' | 'graded'
          time_left?: number | null
          created_at?: string
          updated_at?: string
        }
      }

      answers: {
        Row: {
          id: string
          attempt_id: string
          question_id: string
          selected_option: string | null
          answer_text: string | null
          score: number | null
          manual_score: number | null
          review_note: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          needs_review: boolean
          graded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          attempt_id: string
          question_id: string
          selected_option?: string | null
          answer_text?: string | null
          score?: number | null
          manual_score?: number | null
          review_note?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          needs_review?: boolean
          graded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          attempt_id?: string
          question_id?: string
          selected_option?: string | null
          answer_text?: string | null
          score?: number | null
          manual_score?: number | null
          review_note?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          needs_review?: boolean
          graded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      users: {
        Row: {
          id: string
          email: string
          role: 'user' | 'admin'
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: 'user' | 'admin'
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'user' | 'admin'
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Exam = Database['public']['Tables']['exams']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type Attempt = Database['public']['Tables']['exam_attempts']['Row']
export type Answer = Database['public']['Tables']['answers']['Row']
export type User = Database['public']['Tables']['users']['Row']
-- Enhance reading tracking system

-- Add new columns to user_books
ALTER TABLE user_books 
ADD COLUMN IF NOT EXISTS current_page INTEGER,
ADD COLUMN IF NOT EXISTS is_finished BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_read_date TIMESTAMP WITH TIME ZONE;

-- Add duration tracking to reading_sessions
ALTER TABLE reading_sessions 
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

-- Create book completion trigger function
CREATE OR REPLACE FUNCTION update_book_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this session completed the book
  IF EXISTS (
    SELECT 1 FROM books b 
    WHERE b.id = NEW.book_id 
    AND b.page_count IS NOT NULL
    AND NEW.end_page >= b.page_count
  ) THEN
    UPDATE user_books 
    SET 
      status = 'read',
      date_finished = COALESCE(date_finished, NEW.start_time),
      is_finished = true,
      current_page = NEW.end_page,
      last_read_date = NEW.start_time,
      updated_at = NOW()
    WHERE user_id = NEW.user_id AND book_id = NEW.book_id;
  
  -- Update reading progress
  ELSIF NEW.end_page IS NOT NULL THEN
    UPDATE user_books 
    SET 
      status = 'reading',
      date_started = COALESCE(date_started, NEW.start_time),
      current_page = NEW.end_page,
      last_read_date = NEW.start_time,
      updated_at = NOW()
    WHERE user_id = NEW.user_id AND book_id = NEW.book_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_book_completion ON reading_sessions;
CREATE TRIGGER trigger_book_completion
  AFTER INSERT ON reading_sessions
  FOR EACH ROW EXECUTE FUNCTION update_book_completion();

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_user_books_user_status ON user_books(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_books_finished ON user_books(user_id, is_finished);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_date ON reading_sessions(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_user ON reading_sessions(book_id, user_id);
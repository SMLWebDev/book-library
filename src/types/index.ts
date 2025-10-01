export interface User {
  id: string
  email: string
  user_metadata?: {
    name?: string
    avatar_url?: string
  }
}

export interface Book {
  id: string;
  bookId: string;
  title: string;
  authors: string[];
  publishedDate?: string | null;
  description?: string | null;
  isbn?: string | null;
  pageCount?: number | null;
  categories?: string[];
  thumbnail?: string | null;
  averageRating?: number | null;
  ratingsCount?: number | null;
  language?: string | null;
  publisher?: string | null;
}

export interface UserBook extends Book {
  status: 'read' | 'to-read' | 'reading';
  dateAdded: string;
  dateStarted?: string | null;
  dateFinished?: string | null;
  userRating?: number | null;
  userNotes?: string | null;
}

export interface BookSearchResult {
  items: Book[];
  totalItems: number;
}

export interface ReadingStats {
  totalBooks: number;
  booksRead: number;
  booksReading: number;
  booksToRead: number;
  booksByMonth: { [key: string]: number };
  booksByYear: { [key: string]: number };
  pagesRead: number;
  averageRating: number;
}

export interface ReadingSessions {
  id: string;
  user_id: string;
  book_id: string;
  start_time: string | null;
  pages_read: number | null;
  start_page: number | null;
  end_page: number | null;
  date_read: string | null;
}

export interface NewReadingSession {
  user_id: string;
  book_id: string;
  start_time?: string;
  pages_read?: number;
  start_page?: number;
  end_page?: number;
  date_read?: string;
}

// Add these new types for form handling
export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface PasswordResetForm {
  email: string;
}

export interface PasswordUpdateForm {
  password: string;
  confirmPassword: string;
}

// Types for API responses
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Types for component events
export interface StatusUpdateEvent {
  bookId: string;
  status: 'read' | 'to-read' | 'reading';
  dates: {
    dateStarted?: string;
    dateFinished?: string;
  };
}

// Types for Google Books API
export interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
    };
    averageRating?: number;
    ratingsCount?: number;
    language?: string;
    publisher?: string;
  };
}

export interface GoogleBooksResponse {
  items?: GoogleBookVolume[];
  totalItems: number;
}
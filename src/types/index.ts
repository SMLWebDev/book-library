export interface Book {
  id: string
  title: string
  authors: string[]
  publishedDate?: string | null
  description?: string | null
  isbn?: string | null
  pageCount?: number | null
  categories?: string[]
  thumbnail?: string | null
  averageRating?: number | null
  ratingsCount?: number | null
  language?: string | null
  publisher?: string | null
}

export interface UserBook extends Book {
  status: 'read' | 'to-read' | 'reading'
  dateAdded: string
  dateStarted?: string | null
  dateFinished?: string | null
  userRating?: number | null
  userNotes?: string | null
}

export interface BookSearchResult {
  items: Book[]
  totalItems: number
}

export interface ReadingStats {
  totalBooks: number
  booksRead: number
  booksToRead: number
  booksReading: number
  booksByMonth: { [key: string]: number }
  booksByYear: { [key: string]: number }
  pagesRead: number
  averageRating: number
}

export interface User {
  id: string
  email: string
  user_metadata: {
    name?: string
    avatar_url?: string
  }
}

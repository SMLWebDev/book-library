import type { UserBook } from '@/types'

/**
 * Transforms a raw Supabase database response into a Userbook object
 * Handles snake_case to camelCase conversion and flattens nested book data
 * @param data - Raw data from Supabase query
 * @returns Properly typed UserBook object
 */

export function transformUserBook(data: any): UserBook {
    return {
        // Book fields
        id: data.books?.book_id,
        bookId: data.books?.book_id,
        title: data.books?.title,
        authors: data.books?.authors,
        publishedDate: data.books?.published_date,
        description: data.books?.description,
        isbn: data.books?.isbn,
        pageCount: data.books?.page_count,
        categories: data.books?.categories,
        thumbnail: data.books?.thumbnail,
        averageRating: data.books?.average_rating,
        ratingsCount: data.books?.ratings_count,
        language: data.books?.language,
        publisher: data.books?.publisher,
        // UserBook fields
        status: data.status,
        dateAdded: data.date_added,
        dateStarted: data.date_started,
        dateFinished: data.date_finished,
        userRating: data.user_rating,
        userNotes: data.user_notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        currentPage: data.current_page,
        isFinished: data.is_finished,
        lastReadDate: data.last_read_date,
    } as UserBook
}


/**
 * Transforms an array of raw Supabase responses into UserBook objects
 * @param dataArray - Array of raw data from Supabase query
 * @returns Array of properly typed UserBook objects
 */

export function transformUserBooks(dataArray: any[]): UserBook[] {
  return dataArray.map(transformUserBook)
}


/**
 * Converts a UserBook object from camelCase to snake_case for database updates
 * @param bookData - UserBook object with camelCase properties
 * @returns Object with snake_case properties for Supabase
 */
export function userBookToDatabase(bookData: Partial<UserBook>): Record<string, any> {
  const dbData: Record<string, any> = {}

  // Map camelCase UserBook properties to snake_case database columns
  if (bookData.status !== undefined) dbData.status = bookData.status
  if (bookData.dateAdded !== undefined) dbData.date_added = bookData.dateAdded
  if (bookData.dateStarted !== undefined) dbData.date_started = bookData.dateStarted
  if (bookData.dateFinished !== undefined) dbData.date_finished = bookData.dateFinished
  if (bookData.userRating !== undefined) dbData.user_rating = bookData.userRating
  if (bookData.userNotes !== undefined) dbData.user_notes = bookData.userNotes
  if (bookData.createdAt !== undefined) dbData.created_at = bookData.createdAt
  if (bookData.updatedAt !== undefined) dbData.updated_at = bookData.updatedAt
  if (bookData.currentPage !== undefined) dbData.current_page = bookData.currentPage
  if (bookData.isFinished !== undefined) dbData.is_finished = bookData.isFinished
  if (bookData.lastReadDate !== undefined) dbData.last_read_date = bookData.lastReadDate

  return dbData
}
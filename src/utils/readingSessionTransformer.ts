import type { ReadingSessions, NewReadingSession } from "@/types";

/**
 * Transforms a raw Supabase database response into a ReadingSessions object
 * Handles snake_case to camelCase conversion
 * @param data - Raw data from Supabase query
 * @returns Properly typed ReadingSessions object
 */
export function transformReadingSession(data: any): ReadingSessions {
  return {
    id: data.id,
    userId: data.user_id,
    bookId: data.book_id,
    startTime: data.start_time,
    pagesRead: data.pages_read,
    startPage: data.start_page,
    endPage: data.end_page,
    dateRead: data.date_read,
    durationMinutes: data.duration_minutes,
  } as ReadingSessions
}

/**
 * Transforms an array of raw Supabase responses into ReadingSessions objects
 * @param dataArray - Array of raw data from Supabase query
 * @returns Array of properly typed ReadingSessions objects
 */
export function transformReadingSessions(dataArray: any[]): ReadingSessions[] {
  return dataArray.map(transformReadingSession)
}

/**
 * Converts a ReadingSessions object from camelCase to snake_case for database updates
 * @param sessionData - ReadingSessions object with camelCase properties
 * @returns Object with snake_case properties for Supabase
 */
export function readingSessionToDatabase(sessionData: Partial<ReadingSessions>): Record<string, any> {
  const dbData: Record<string, any> = {}

  // Map camelCase ReadingSessions properties to snake_case database columns
  if (sessionData.userId !== undefined) dbData.user_id = sessionData.userId
  if (sessionData.bookId !== undefined) dbData.book_id = sessionData.bookId
  if (sessionData.startTime !== undefined) dbData.start_time = sessionData.startTime
  if (sessionData.pagesRead !== undefined) dbData.pages_read = sessionData.pagesRead
  if (sessionData.startPage !== undefined) dbData.start_page = sessionData.startPage
  if (sessionData.endPage !== undefined) dbData.end_page = sessionData.endPage
  if (sessionData.dateRead !== undefined) dbData.date_read = sessionData.dateRead
  if (sessionData.durationMinutes !== undefined) dbData.duration_minutes = sessionData.durationMinutes

  return dbData
}

/**
 * Converts a NewReadingSession object from camelCase to snake_case for database inserts
 * @param newSessionData - NewReadingSession object with camelCase properties
 * @returns Object with snake_case properties for Supabase
 */
export function newReadingSessionToDatabase(newSessionData: NewReadingSession): { 
  user_id: string; 
  book_id: string; 
  start_time?: string;
  pages_read?: number;
  start_page?: number;
  end_page?: number;
  date_read?: string;
  duration_minutes?: number;
} {
  return {
    user_id: newSessionData.userId,
    book_id: newSessionData.bookId,
    ...(newSessionData.startTime !== undefined && { start_time: newSessionData.startTime }),
    ...(newSessionData.pagesRead !== undefined && { pages_read: newSessionData.pagesRead }),
    ...(newSessionData.startPage !== undefined && { start_page: newSessionData.startPage }),
    ...(newSessionData.endPage !== undefined && { end_page: newSessionData.endPage }),
    ...(newSessionData.dateRead !== undefined && { date_read: newSessionData.dateRead }),
  }
}
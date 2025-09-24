/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserBook, ReadingStats } from '../types'
import { supabase } from '../api/supabase'
import { useAuthStore } from './auth'

export const useBookStore = defineStore('books', () => {
  const userBooks = ref<UserBook[]>([])
  const loading = ref(false)
  const authStore = useAuthStore()

  const fetchUserBooks = async () => {
    if (!authStore.user) return

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('user_books')
        .select(
          `
          *,
          books (*)
        `,
        )
        .eq('user_id', authStore.user.id)
        .order('date_added', { ascending: false })

      if (error) throw error

      if (!data) {
        userBooks.value = []
        return
      }

      // Transform the data to match our UserBook type
      userBooks.value = data.map((item) => {
        const book = item.books
        return {
          id: item.id,
          bookId: item.book_id,
          title: book?.title || '',
          authors: book?.authors || [],
          publishedDate: book?.published_date || null,
          description: book?.description || null,
          isbn: book?.isbn || null,
          pageCount: book?.page_count || null,
          categories: book?.categories || [],
          thumbnail: book?.thumbnail || null,
          averageRating: book?.average_rating || null,
          ratingsCount: book?.ratings_count || null,
          language: book?.language || null,
          publisher: book?.publisher || null,
          status: item.status as 'read' | 'to-read' | 'reading',
          dateAdded: item.date_added || new Date().toISOString(),
          dateStarted: item.date_started || null,
          dateFinished: item.date_finished || null,
          userRating: item.user_rating || null,
          userNotes: item.user_notes || null,
        }
      })
    } catch (error) {
      console.error('Error fetching user books:', error)
    } finally {
      loading.value = false
    }
  }

  const addBook = async (bookData: UserBook) => {
    if (!authStore.user) throw new Error('User not authenticated')

    try {
      // First, check if the book exists in our books table
      const { data: existingBook, error: bookError } = await supabase
        .from('books')
        .select('id')
        .eq('id', bookData.id)
        .single()

      // If the book doesn't exist, add it to the books table
      if (bookError || !existingBook) {
        const { error: insertBookError } = await supabase.from('books').insert({
          id: bookData.id,
          title: bookData.title,
          authors: bookData.authors,
          published_date: bookData.publishedDate,
          description: bookData.description,
          isbn: bookData.isbn,
          page_count: bookData.pageCount,
          categories: bookData.categories,
          thumbnail: bookData.thumbnail,
          average_rating: bookData.averageRating,
          ratings_count: bookData.ratingsCount,
          language: bookData.language,
          publisher: bookData.publisher,
        })

        if (insertBookError) {
          console.error('Error inserting book:', insertBookError)
          // Continue anyway - we'll try to add to user_books
        }
      }

      // Now add the book to the user's collection
      const { data, error } = await supabase
        .from('user_books')
        .insert({
          user_id: authStore.user.id,
          book_id: bookData.id,
          status: bookData.status,
          date_added: bookData.dateAdded,
          date_started: bookData.dateStarted,
          date_finished: bookData.dateFinished,
          user_rating: bookData.userRating,
          user_notes: bookData.userNotes,
        })
        .select()

      if (error) throw error

      // Add the new book to our local state
      if (data && data.length > 0) {
        userBooks.value.unshift({
          ...bookData,
          dateAdded: data[0].date_added || bookData.dateAdded,
        })
      }
    } catch (error) {
      console.error('Error adding book:', error)
      throw error
    }
  }

  const updateBookStatus = async (
    bookId: string,
    status: UserBook['status'],
    dates: { dateStarted?: string | null; dateFinished?: string | null },
  ) => {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (dates.dateStarted !== undefined) {
        updates.date_started = dates.dateStarted
      }

      if (dates.dateFinished !== undefined) {
        updates.date_finished = dates.dateFinished
      }

      const { error } = await supabase.from('user_books').update(updates).eq('id', bookId)

      if (error) throw error

      // Update local state
      const index = userBooks.value.findIndex((b) => b.id === bookId)
      if (index !== -1) {
        userBooks.value[index] = {
          ...userBooks.value[index],
          status,
          dateStarted: dates.dateStarted,
          dateFinished: dates.dateFinished,
        }
      }
    } catch (error) {
      console.error('Error updating book status:', error)
      throw error
    }
  }

  const stats = computed((): ReadingStats => {
    const readBooks = userBooks.value.filter((b) => b.status === 'read')
    const totalPages = readBooks.reduce((sum, book) => sum + (book.pageCount || 0), 0)
    const totalRating = readBooks.reduce((sum, book) => sum + (book.userRating || 0), 0)
    const avgRating = readBooks.length > 0 ? totalRating / readBooks.length : 0

    const stats: ReadingStats = {
      totalBooks: userBooks.value.length,
      booksRead: readBooks.length,
      booksToRead: userBooks.value.filter((b) => b.status === 'to-read').length,
      booksReading: userBooks.value.filter((b) => b.status === 'reading').length,
      booksByMonth: {},
      booksByYear: {},
      pagesRead: totalPages,
      averageRating: avgRating,
    }

    // Calculate books by month/year
    readBooks
      .filter((b) => b.dateFinished)
      .forEach((book) => {
        if (book.dateFinished) {
          const date = new Date(book.dateFinished)
          const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`
          const year = date.getFullYear().toString()

          stats.booksByMonth[monthYear] = (stats.booksByMonth[monthYear] || 0) + 1
          stats.booksByYear[year] = (stats.booksByYear[year] || 0) + 1
        }
      })

    return stats
  })

  const updateBookRating = async (bookId: string, rating: number | null) => {
  try {
    const { error } = await supabase
      .from('user_books')
      .update({ user_rating: rating, updated_at: new Date().toISOString() })
      .eq('id', bookId)

    if (error) throw error
    
    // Update local state
    const index = userBooks.value.findIndex(b => b.id === bookId)
    if (index !== -1) {
      userBooks.value[index].userRating = rating
    }
  } catch (error) {
    console.error('Error updating book rating:', error)
    throw error
  }
}

const updateBookNotes = async (bookId: string, notes: string | null) => {
  try {
    const { error } = await supabase
      .from('user_books')
      .update({ user_notes: notes, updated_at: new Date().toISOString() })
      .eq('id', bookId)

    if (error) throw error
    
    // Update local state
    const index = userBooks.value.findIndex(b => b.id === bookId)
    if (index !== -1) {
      userBooks.value[index].userNotes = notes
    }
  } catch (error) {
    console.error('Error updating book notes:', error)
    throw error
  }
}

const updateBookDates = async (bookId: string, dates: { dateStarted?: string; dateFinished?: string }) => {
  try {
    const updates: any = {
      updated_at: new Date().toISOString()
    }

    if (dates.dateStarted !== undefined) {
      updates.date_started = dates.dateStarted
    }
    
    if (dates.dateFinished !== undefined) {
      updates.date_finished = dates.dateFinished
    }

    const { error } = await supabase
      .from('user_books')
      .update(updates)
      .eq('id', bookId)

    if (error) throw error
    
    // Update local state
    const index = userBooks.value.findIndex(b => b.id === bookId)
    if (index !== -1) {
      if (dates.dateStarted !== undefined) {
        userBooks.value[index].dateStarted = dates.dateStarted
      }
      if (dates.dateFinished !== undefined) {
        userBooks.value[index].dateFinished = dates.dateFinished
      }
    }
  } catch (error) {
    console.error('Error updating book dates:', error)
    throw error
  }
}

  return {
    userBooks,
    loading,
    stats,
    fetchUserBooks,
    addBook,
    updateBookStatus,
    updateBookDates,
    updateBookNotes,
    updateBookRating
  }
})

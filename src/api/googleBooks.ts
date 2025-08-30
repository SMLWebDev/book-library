import axios from 'axios'
import type { Book, BookSearchResult } from '../types'

const API_BASE_URL = 'https://www.googleapis.com/books/v1'

export const googleBooksApi = {
  searchBooks: async (query: string, maxResults: number = 20, startIndex: number = 0): Promise<BookSearchResult> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&startIndex=${startIndex}&projection=lite`
      )

      return {
        items: response.data.items?.map((item: any) => formatBook(item)) || [],
        totalItems: response.data.totalItems || 0
      }
    } catch (error) {
      console.error('Error searching books: ', error)
      throw new Error('Faile to search books')
    }
  },

  getBook: async (id: string): Promise<Book> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/volumes/${id}`)
      return formatBook(response.data)
    } catch (error) {
      console.error('Error fetching book details: ', error)
      throw new Error('Failed to fetch book details')
    }
  },

  searchBooksByTitle: async (title: string, maxResults: number = 20): Promise<BookSearchResult> => {
    return googleBooksApi.searchBooks(`intitle:${title}`, maxResults)
  },

  searchBooksByAuthor: async (author: string, maxResults: number = 20): Promise<BookSearchResult> => {
    return googleBooksApi.searchBooks(`inauthor:${author}`, maxResults)
  },

  searchBooksByISBN: async (isbn: string): Promise<BookSearchResult> => {
    return googleBooksApi.searchBooks(`isbn:${isbn}`, 5)
  }
}

const formatBook = (item: any): Book => {
  const volumeInfo = item.volumeInfo || {}
  const imageLinks = volumeInfo.imageLinks || {}

  return {
    id: item.id,
    title: volumeInfo.title || 'No Title Available',
    authors: volumeInfo.authors || ['Unknown Author'],
    publishedDate: volumeInfo.publishedDate || 'Unknown Date',
    description: volumeInfo.description || 'No Description Available',
    isbn: getISBN(volumeInfo.industryIdentifiers),
    pageCount: volumeInfo.pageCount || 0,
    categories: volumeInfo.categories || ['Uncategorized'],
    thumbnail: imageLinks.thumbnail?.replace('http:', 'https:') || '',
    averageRating: volumeInfo.averageRating || null,
    ratingsCount: volumeInfo.ratingsCount || null,
    language: volumeInfo.language || 'Unknown',
    publisher: volumeInfo.publisher || 'Unknown Publisher'
  }
}

type IndustryIdentifier = { type: string; identifier: string };

const getISBN = (industryIdentifiers: IndustryIdentifier[] | undefined): string | null => {
  if (!industryIdentifiers) return null

  const isbn13 = industryIdentifiers.find(id => id.type === 'ISBN_13')
  const isbn10 = industryIdentifiers.find(id => id.type === 'ISBN_10')

  return isbn13?.identifier || isbn10?.identifier || null
}
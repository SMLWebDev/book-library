import axios from 'axios'
import type { Book, BookSearchResult } from '@/types'

const API_BASE = 'https://www.googleapis.com/books/v1'

export const googleBooksApi = {
  searchBooks: async (query: string, maxResults = 20): Promise<BookSearchResult> => {
    const response = await axios.get(
      `${API_BASE}/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&projection=lite`,
    )

    return {
      items:
        response.data.items?.map((item: any) => ({
          id: item.id,
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors || [],
          publishedDate: item.volumeInfo.publishedDate,
          description: item.volumeInfo.description,
          isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
          pageCount: item.volumeInfo.pageCount,
          categories: item.volumeInfo.categories || [],
          thumbnail: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
          averageRating: item.volumeInfo.averageRating,
          ratingsCount: item.volumeInfo.ratingsCount,
          language: item.volumeInfo.language,
          publisher: item.volumeInfo.publisher,
        })) || [],
      totalItems: response.data.totalItems,
    }
  },

  getBook: async (id: string): Promise<Book> => {
    const response = await axios.get(`${API_BASE}/volumes/${id}`)
    const item = response.data

    return {
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || [],
      publishedDate: item.volumeInfo.publishedDate,
      description: item.volumeInfo.description,
      isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
      pageCount: item.volumeInfo.pageCount,
      categories: item.volumeInfo.categories,
      thumbnail: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
      averageRating: item.volumeInfo.averageRating,
      ratingsCount: item.volumeInfo.ratingsCount,
      language: item.volumeInfo.language,
      publisher: item.volumeInfo.publisher,
    }
  },
}

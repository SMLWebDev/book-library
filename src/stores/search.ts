import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Book, BookSearchResult } from '../types'
import { googleBooksApi } from '../api/googleBooks'

export const useSearchStore = defineStore('search', () => {
  const searchResults = ref<Book[]>([])
  const searchQuery = ref('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const totalResults = ref(0)
  const currentPage = ref(1)
  const resultsPerPage = ref(20)

  const searchBooks = async (query: string, page: number = 1) => {
    isLoading.value = true
    error.value = null
    searchQuery.value = query
    currentPage.value = page

    try {
      const startIndex = (page - 1) * resultsPerPage.value
      const result: BookSearchResult = await googleBooksApi.searchBooks(
        query, 
        resultsPerPage.value, 
        startIndex
      )
      
      searchResults.value = result.items
      totalResults.value = result.totalItems
    } catch (err: any) {
      error.value = err.message || 'Failed to search books'
      searchResults.value = []
      totalResults.value = 0
    } finally {
      isLoading.value = false
    }
  }

  const searchBooksByTitle = async (title: string, page: number = 1) => {
    isLoading.value = true
    error.value = null
    searchQuery.value = `Title: ${title}`
    currentPage.value = page

    try {
      const startIndex = (page - 1) * resultsPerPage.value
      const result: BookSearchResult = await googleBooksApi.searchBooksByTitle(
        title, 
        resultsPerPage.value, 
        startIndex
      )
      
      searchResults.value = result.items
      totalResults.value = result.totalItems
    } catch (err: any) {
      error.value = err.message || 'Failed to search books by title'
      searchResults.value = []
      totalResults.value = 0
    } finally {
      isLoading.value = false
    }
  }

  const searchBooksByAuthor = async (author: string, page: number = 1) => {
    isLoading.value = true
    error.value = null
    searchQuery.value = `Author: ${author}`
    currentPage.value = page

    try {
      const startIndex = (page - 1) * resultsPerPage.value
      const result: BookSearchResult = await googleBooksApi.searchBooksByAuthor(
        author, 
        resultsPerPage.value, 
        startIndex
      )
      
      searchResults.value = result.items
      totalResults.value = result.totalItems
    } catch (err: any) {
      error.value = err.message || 'Failed to search books by author'
      searchResults.value = []
      totalResults.value = 0
    } finally {
      isLoading.value = false
    }
  }

  const clearSearch = () => {
    searchResults.value = []
    searchQuery.value = ''
    error.value = null
    totalResults.value = 0
    currentPage.value = 1
  }

  return {
    searchResults,
    searchQuery,
    isLoading,
    error,
    totalResults,
    currentPage,
    resultsPerPage,
    searchBooks,
    searchBooksByTitle,
    searchBooksByAuthor,
    clearSearch
  }
})
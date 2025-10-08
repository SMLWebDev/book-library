export const formatDateForDisplay = (date: string | Date | null): string => {
    if (!date) return 'No Date'

    const dateObj = typeof date === 'string' ? new Date(date) : date

    return dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

export const formatDateForDB = (date: Date | null): string => {
    if (!date) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}
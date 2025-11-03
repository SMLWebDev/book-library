import { useRouter } from 'vue-router'

export function useNavigation() {
    const router = useRouter()
    
    const navigateToLogin = async (queryParams: Record<string, any> = {}) => {
        try {
            await router.push({
                name: 'login',
                query: queryParams
            })
        } catch (err) {
            console.error('Navigation to login failed: ', err)
        }
    }

    const navigateToLibrary = async () => {
        try {
            await router.push({ name: 'library' })
        } catch (err) {
            console.error('Navigation to Library failed: ', err)
        }
    }

    const navigateToHome = async () => {
        try {
            await router.push({ name: 'home' })
        } catch (err) {
            console.error('Navigation to Home failed: ', err)
        }
    }

    return {
        navigateToLogin,
        navigateToLibrary,
        navigateToHome,
        router
    }
}
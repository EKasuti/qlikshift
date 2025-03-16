const isDebug = process.env.NODE_ENV === 'development';

export const config = {
    apiUrl: isDebug
        ? process.env.NEXT_PUBLIC_API_URL_DEV
        : process.env.NEXT_PUBLIC_API_URL_PROD,
}
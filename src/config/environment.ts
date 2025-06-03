export default {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql',
    API_KEY: import.meta.env.VITE_API_KEY || 'your-api-key',
    PROJECT_ID: import.meta.env.VITE_PROJECT_ID || 'your-project-id',
    STORAGE_BUCKET: import.meta.env.VITE_STORAGE_BUCKET || 'your-storage-bucket',
    AUTH_DOMAIN: import.meta.env.VITE_AUTH_DOMAIN || 'your-auth-domain',
    MESSAGING_SENDER_ID: import.meta.env.VITE_MESSAGING_SENDER_ID || 'your-messaging-sender-id',
    APP_ID: import.meta.env.VITE_APP_ID || 'your-app-id',
    MEASUREMENT_ID: import.meta.env.VITE_MEASUREMENT_ID || 'your-measurement-id',
}
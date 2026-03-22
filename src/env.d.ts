declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_BASE_URL: string
    NEXT_PUBLIC_API_PREFIX: string
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: string
    NEXT_PUBLIC_FESTIVAL: 'arabic' | 'global'
    FESTIVAL: 'arabic' | 'global'
    NEXT_PUBLIC_SITE_URL: string
  }
}

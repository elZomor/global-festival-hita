declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_BASE_URL: string
    NEXT_PUBLIC_API_PREFIX: string
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: string
    NEXT_PUBLIC_FESTIVAL: 'arabic' | 'global' | 'alt_spaces'
    FESTIVAL: 'arabic' | 'global' | 'alt_spaces'
    NEXT_PUBLIC_SITE_URL: string
  }
}

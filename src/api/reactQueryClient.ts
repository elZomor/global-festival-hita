import {
  QueryClient,
  QueryKey,
  useMutation,
  useQuery,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

/* ---------- SSR-safe QueryClient singleton ---------- */

let browserQueryClient: QueryClient | null = null;

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000, retry: 1 },
    },
  });
}

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always create a new instance (never cache)
    return makeQueryClient();
  }
  // Browser: reuse singleton
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

type RefetchBehaviour = boolean | 'always';

type QueryBehaviourOptions = {
  staleTime?: number;
  gcTime?: number;
  retry?: number;
  refetchOnWindowFocus?: RefetchBehaviour;
  refetchOnReconnect?: RefetchBehaviour;
  refetchOnMount?: RefetchBehaviour;
};

export type ApiClientOptions = {
  baseUrl?: string;
  defaultHeaders?: HeadersInit;
  defaultQueryOptions?: QueryBehaviourOptions;
};

type RequestOptions = {
  useBaseUrl?: boolean;
  expectedStatus?: number | number[];
};

export type UseApiQueryConfig<TQueryFnData, TData = TQueryFnData, TVariables = void> = {
  queryKey: QueryKey | ((variables: TVariables | undefined) => QueryKey);
  path: string | ((variables: TVariables | undefined) => string);
  variables?: TVariables;
  requestInit?: RequestInit | ((variables: TVariables | undefined) => RequestInit);
  enabled?: boolean | ((variables: TVariables | undefined) => boolean);
  useBaseUrl?: boolean;
  expectedStatus?: number | number[];
} & Omit<
  UseQueryOptions<TQueryFnData, ApiError, TData, QueryKey>,
  'queryKey' | 'queryFn' | 'enabled'
>;

export type UseApiMutationConfig<TResponse, TVariables = void, TContext = unknown> = {
  path: string | ((variables: TVariables) => string);
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  requestInit?: RequestInit | ((variables: TVariables) => RequestInit);
  bodySerializer?: (variables: TVariables) => BodyInit | undefined;
  useBaseUrl?: boolean;
  expectedStatus?: number | number[];
} & Omit<UseMutationOptions<TResponse, ApiError, TVariables, TContext>, 'mutationFn'>;

/* ---------- snake_case / camelCase helpers ---------- */

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const toCamelCase = (key: string) =>
    key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

const toSnakeCase = (key: string) =>
    key.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`);

const transformKeysToCamel = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(transformKeysToCamel);
  }
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    Object.entries(value).forEach(([k, v]) => {
      result[toCamelCase(k)] = transformKeysToCamel(v);
    });
    return result;
  }
  return value;
};

const transformKeysToSnake = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(transformKeysToSnake);
  }
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    Object.entries(value).forEach(([k, v]) => {
      result[toSnakeCase(k)] = transformKeysToSnake(v);
    });
    return result;
  }
  return value;
};

/* ---------------------------------------------------- */

const REFRESH_TOKEN_KEY = 'gf_refreshToken';
const ACCESS_TOKEN_KEY = 'gf_accessToken';

export class ReactQueryApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;
  private queryDefaults: QueryBehaviourOptions;
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  constructor(options: ApiClientOptions = {}) {
    const rawBaseUrl = options.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
    this.baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
    this.defaultHeaders = options.defaultHeaders ?? { 'Content-Type': 'application/json' } as Record<string, string>;
    this.queryDefaults = options.defaultQueryOptions ?? {
      staleTime: 0,
      gcTime: 15 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    };
  }

  getQueryDefaults() {
    return this.queryDefaults;
  }

  setAuthToken(token: string | null) {
    const headers = this.defaultHeaders as Record<string, string>;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete headers['Authorization'];
    }
  }

  /** Try to refresh the access token. Returns true if successful. */
  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return false;

    // Deduplicate concurrent refresh attempts
    if (this.isRefreshing) {
      await this.refreshPromise;
      return true;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const res = await fetch(`${this.baseUrl}/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });
        if (!res.ok) throw new Error('Refresh failed');
        const data = await res.json();
        const newToken: string = data.access;
        localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
        this.setAuthToken(newToken);
      } catch {
        // Clear tokens so user gets signed out on next render
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        this.setAuthToken(null);
        throw new Error('Session expired');
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    try {
      await this.refreshPromise;
      return true;
    } catch {
      return false;
    }
  }

  buildBody<TVariables>(
      variables: TVariables,
      bodySerializer?: (variables: TVariables) => BodyInit | undefined,
  ) {
    if (bodySerializer) {
      return bodySerializer(variables);
    }
    return this.stringifyBody(variables);
  }

  async get<TResponse>(path: string, init?: RequestInit, options?: RequestOptions) {
    return this.request<TResponse>(path, init, options);
  }

  async request<TResponse>(path: string, init?: RequestInit, options?: RequestOptions) {
    const finalInit: RequestInit = {
      ...init,
      headers: this.buildHeaders(init?.headers, init?.body ?? null),
    };

    const url = this.buildUrl(path, options);
    let response = await fetch(url, finalInit);

    // 401 → attempt token refresh once, then retry (mirrors HITA's Axios interceptor)
    if (response.status === 401) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        const retryInit: RequestInit = {
          ...finalInit,
          headers: this.buildHeaders(init?.headers, init?.body ?? null),
        };
        response = await fetch(url, retryInit);
      }
    }

    const payload = await this.parseResponse(response);

    const expectedStatuses = this.normalizeExpectedStatuses(options?.expectedStatus);
    if (expectedStatuses && !expectedStatuses.includes(response.status)) {
      throw {
        status: response.status,
        message: this.extractErrorMessage(payload) ?? response.statusText,
        details: payload,
      } satisfies ApiError;
    }

    if (!response.ok) {
      throw {
        status: response.status,
        message: this.extractErrorMessage(payload) ?? response.statusText,
        details: payload,
      } satisfies ApiError;
    }

    return payload as TResponse;
  }

  private stringifyBody(variables: unknown) {
    if (variables === undefined || variables === null) return undefined;

    if (
        variables instanceof FormData ||
        variables instanceof Blob ||
        variables instanceof URLSearchParams
    ) {
      // اترك المفاتيح زي ما هي في الفورم داتا/البلوب
      return variables;
    }

    if (typeof variables === 'string') {
      return variables;
    }

    // هنا نحول camelCase -> snake_case قبل الإرسال
    const transformed = transformKeysToSnake(variables);
    return JSON.stringify(transformed);
  }

  private buildHeaders(headers?: HeadersInit, body?: BodyInit | null) {
    const finalHeaders = new Headers(this.defaultHeaders ?? {});

    if (headers) {
      new Headers(headers).forEach((value, key) => finalHeaders.set(key, value));
    }

    if (body instanceof FormData || body instanceof Blob) {
      finalHeaders.delete('Content-Type');
    } else if (!finalHeaders.has('Content-Type')) {
      finalHeaders.set('Content-Type', 'application/json');
    }

    return finalHeaders;
  }

  private buildUrl(path: string, options?: RequestOptions) {
    if (!path) throw new Error('API path is required');
    if (options?.useBaseUrl === false) {
      return path;
    }
    if (/^https?:\/\//i.test(path) || !this.baseUrl) {
      return path;
    }
    return `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  private normalizeExpectedStatuses(expected?: number | number[]) {
    if (!expected) return undefined;
    return Array.isArray(expected) ? expected : [expected];
  }

  private extractErrorMessage(payload: unknown) {
    if (!payload) return undefined;
    if (typeof payload === 'string') return payload;
    if (
        typeof payload === 'object' &&
        'message' in payload &&
        typeof (payload as { message?: unknown }).message === 'string'
    ) {
      return (payload as { message: string }).message;
    }
    return undefined;
  }

  private async parseResponse(response: Response) {
    if (response.status === 204) return undefined;
    const text = await response.text();
    if (!text) return undefined;

    try {
      const parsed = JSON.parse(text);
      // هنا نحول snake_case -> camelCase قبل ما يوصل للفرونت
      return transformKeysToCamel(parsed);
    } catch {
      return text;
    }
  }
}

export const apiQueryClient = new ReactQueryApiClient();

// Restore auth token synchronously so queries fired on the first render
// already have the Authorization header set (AuthContext.setAuthToken via
// useEffect would be too late — it runs after the first render).
const _storedToken = typeof localStorage !== 'undefined'
    ? localStorage.getItem('gf_accessToken')
    : null;
if (_storedToken) apiQueryClient.setAuthToken(_storedToken);

export const useApiQuery = <TQueryFnData, TData = TQueryFnData, TVariables = void>(
    config: UseApiQueryConfig<TQueryFnData, TData, TVariables>,
): UseQueryResult<TData, ApiError> => {
  const {
    variables,
    queryKey,
    path,
    requestInit,
    enabled,
    useBaseUrl,
    expectedStatus,
    ...queryOptions
  } = config;

  const resolvedKey = typeof queryKey === 'function' ? queryKey(variables) : queryKey;
  const resolvedPath = typeof path === 'function' ? path(variables) : path;
  const resolvedInit =
      (typeof requestInit === 'function' ? requestInit(variables) : requestInit) ?? {};
  const resolvedEnabled = typeof enabled === 'function' ? enabled(variables) : enabled;

  return useQuery<TQueryFnData, ApiError, TData, QueryKey>({
    ...apiQueryClient.getQueryDefaults(),
    ...queryOptions,
    queryKey: resolvedKey,
    enabled: resolvedEnabled ?? true,
    queryFn: () =>
        apiQueryClient.request<TQueryFnData>(resolvedPath, resolvedInit, {
          useBaseUrl,
          expectedStatus,
        }),
  });
};

export const useApiMutation = <TResponse, TVariables = void, TContext = unknown>(
    config: UseApiMutationConfig<TResponse, TVariables, TContext>,
): UseMutationResult<TResponse, ApiError, TVariables, TContext> => {
  const {
    path,
    method = 'POST',
    requestInit,
    bodySerializer,
    useBaseUrl,
    expectedStatus,
    ...mutationOptions
  } = config;

  return useMutation<TResponse, ApiError, TVariables, TContext>({
    ...mutationOptions,
    mutationFn: async variables => {
      const resolvedPath = typeof path === 'function' ? path(variables) : path;
      const resolvedInit =
          (typeof requestInit === 'function' ? requestInit(variables) : requestInit) ?? {};

      const body = apiQueryClient.buildBody(variables, bodySerializer);

      const finalInit: RequestInit = {
        ...resolvedInit,
        method,
        body,
      };

      return apiQueryClient.request<TResponse>(resolvedPath, finalInit, {
        useBaseUrl,
        expectedStatus,
      });
    },
  });
};

export const buildQueryKey = (
    ...parts: Array<string | number | boolean | undefined | null>
): QueryKey =>
    parts.filter(part => part !== undefined && part !== null) as QueryKey;

export const withQueryParams = (
    path: string,
    params?: Record<string, string | number | boolean | undefined | null>,
) => {
  if (!params) return path;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  if (!queryString) return path;

  return `${path}${path.includes('?') ? '&' : '?'}${queryString}`;
};

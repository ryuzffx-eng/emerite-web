// Prefer environment variable for direct connection
// In Vercel, set VITE_API_URL to your HTTPS backend URL (e.g., https://api.yourdomain.com)
const BASE_URL = import.meta.env.VITE_API_URL || "http://ryzen.heavencloud.in:2407";

// Safe localStorage access
const getStoredItem = (key: string) => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  } catch (e) {
    console.warn(`[Storage] Failed to get ${key}:`, e);
    return null;
  }
};

const setStoredItem = (key: string, value: string) => {
  try {
    if (typeof window !== 'undefined') localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`[Storage] Failed to set ${key}:`, e);
  }
};

const removeStoredItem = (key: string) => {
  try {
    if (typeof window !== 'undefined') localStorage.removeItem(key);
  } catch (e) {
    console.warn(`[Storage] Failed to remove ${key}:`, e);
  }
};

// Auth token management
let userType: "admin" | "reseller" | "client" | null = getStoredItem("emerite_user_type") as any;
let userData: any = JSON.parse(getStoredItem("emerite_user_data") || "null");

const getAuthToken = () => getStoredItem("emerite_token");

export const setAuth = (token: string, type: "admin" | "reseller" | "client", data?: any) => {
  setStoredItem("emerite_token", token);
  setStoredItem("emerite_user_type", type);
  if (data) {
    setStoredItem("emerite_user_data", JSON.stringify(data));
    userData = data;
  }
  userType = type;
  window.dispatchEvent(new Event("auth-change"));
};

export const updateUser = (user: any) => {
  if (userData) {
    const newUser = { ...userData, ...user };
    setStoredItem("emerite_user_data", JSON.stringify(newUser));
    userData = newUser;
    window.dispatchEvent(new Event("auth-change"));
  }
};

export const clearAuth = () => {
  removeStoredItem("emerite_token");
  removeStoredItem("emerite_user_type");
  removeStoredItem("emerite_user_data");
  userType = null;
  userData = null;
};

export const getAuth = () => ({ token: getAuthToken(), userType, user: userData });

export const isAuthenticated = () => !!getAuthToken();

// Detect if we're in production
const isProduction = () => {
  try {
    // Check Vite's built-in prod flag first
    if (typeof import.meta !== 'undefined' && import.meta.env?.PROD) return true;

    // Fallback to hostname check
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      const host = window.location.hostname;
      // If we are accessing via IP or localhost, treat as NOT production to use proxy
      const isLocal = host === 'localhost' ||
        host === '127.0.0.1' ||
        host.startsWith('192.168.') ||
        host.startsWith('10.') ||
        host.startsWith('172.') ||
        host.endsWith('.local');

      // Also treat your specific dev IP as local
      if (host === '10.118.122.53') return false;

      return !isLocal;
    }
    return false;
  } catch (e) {
    return false;
  }
};

// API request helper
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken();
  const isProd = isProduction();

  let url: string;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Determine the URL to call
  // 1. If VITE_API_URL is set (e.g. to an HTTPS backend), use it directly.
  // 2. If running locally, use Vite proxy (/api) to avoid CORS.
  // 3. If in Production but no VITE_API_URL is set, try to use the Vercel proxy fallback.

  if (BASE_URL.startsWith('http')) {
    // Optimization: In Development, use Vite Proxy (/api) to avoid CORS preflight (OPTIONS) requests.
    // This makes dev significantly faster (1 round-trip vs 2).
    const useViteProxy = !isProd && !import.meta.env.VITE_API_URL;

    if (useViteProxy) {
      url = `/api${endpoint}`;
    } else if (isProd && BASE_URL.startsWith('http://')) {
      // Vercel (HTTPS) cannot call HTTP directly. Use Vercel Serverless Proxy.
      url = `/api/proxy?endpoint=${encodeURIComponent(endpoint)}`;
      console.log(`[API] Using Vercel proxy for HTTP backend: ${url}`);
    } else {
      // Direct connection (HTTPS backend OR Localhost OR Explicit Override)
      // Ensure we append /api prefix since the backend routes are mounted there
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      url = `${BASE_URL.replace(/\/$/, '')}/api${cleanEndpoint}`;
    }
  } else {
    // Fallback to Vite proxy
    url = `/api${endpoint}`;
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["x-emerite-token"] = token;
    headers["x-faerion-token"] = token; // Add both variants for compatibility
  }

  // Merge any additional headers
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  console.log(`[API] ${options.method || 'GET'} ${endpoint} (${isProd ? 'PROD Proxy' : 'DEV'})`, {
    hasToken: !!token,
    url: url,
    isProd,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
  });

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (fetchError) {
    console.error(`[API ERROR] Network error for ${endpoint}:`, fetchError);
    console.error(`[API ERROR] Request details:`, { url, method: options.method, isProd });
    const message = fetchError instanceof Error ? fetchError.message : 'Network error';
    throw new Error(`Server connection failed: ${message}`);
  }

  let data;
  const contentType = response.headers.get('content-type');

  try {
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.warn(`[API WARNING] Non-JSON response for ${endpoint}:`, text);
      data = { raw: text };
    }
  } catch (e) {
    console.error(`[API ERROR] Failed to parse response for ${endpoint}:`, e);
    throw new Error(`Invalid response format from server (expected JSON)`);
  }

  console.log(`[API RESPONSE] ${endpoint} - Status: ${response.status}`, data);

  if (!response.ok) {
    const errorMessage = data.detail || data.error || data.message || data.raw || `HTTP ${response.status}`;
    console.error(`[API ERROR] ${endpoint}: ${errorMessage}`, data);

    // Handle unauthorized or expired token centrally 
    if (response.status === 401 || (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('token expired'))) {
      const isLoginRequest = endpoint.includes('/login') || endpoint.includes('/discord') || endpoint.includes('/google');

      if (!isLoginRequest) {
        try {
          console.warn(`[API] Unauthorized access to ${endpoint}, redirecting to login...`);
          // Clear stored auth and redirect to login
          localStorage.removeItem('emerite_token');
          localStorage.removeItem('emerite_user_type');
          // If SPA router is available, navigate; otherwise fallback to location
          if (window && window.location && window.location.pathname !== '/login' && window.location.pathname !== '/') {
            window.location.href = '/';
          }
        } catch (e) {
          console.warn('[API] Failed to auto-redirect after unauthorized error', e);
        }
        throw new Error(response.status === 401 ? 'Session invalid or user deleted. Please log in again.' : 'Session expired. Please log in again.');
      }

      // For login requests, just throw the backend error
      throw new Error(errorMessage);
    }

    throw new Error(errorMessage);
  }

  return data;
};

// ============ Authentication ============
export const staffDiscordLogin = (code: string, redirect_uri: string) =>
  apiRequest("/auth/discord", {
    method: "POST",
    body: JSON.stringify({ code, redirect_uri })
  });

export const clientLogin = (email: string, password: string) =>
  apiRequest("/auth/client/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

export const clientRegister = (email: string, password: string, username?: string) =>
  apiRequest("/auth/client/register", {
    method: "POST",
    body: JSON.stringify({ email, password, username })
  });

export const clientVerifyEmail = (email: string, code: string) =>
  apiRequest("/auth/client/verify", {
    method: "POST",
    body: JSON.stringify({ email, code })
  });

export const clientGoogleLogin = (token: string) =>
  apiRequest("/auth/client/google", {
    method: "POST",
    body: JSON.stringify({ token })
  });

export const clientDiscordLogin = (code: string, redirect_uri: string) =>
  apiRequest("/auth/client/discord", {
    method: "POST",
    body: JSON.stringify({ code, redirect_uri })
  });

export const clientGetProfile = () => apiRequest("/auth/client/me");

export const clientGetOrders = () => apiRequest("/auth/client/orders");

export const clientGetStats = () => apiRequest("/auth/client/stats");

export const clientGetLicenses = () => apiRequest("/auth/client/licenses");

export const clientUpdatePassword = (data: { old_password: string; new_password: string }) =>
  apiRequest("/auth/client/password", {
    method: "PUT",
    body: JSON.stringify(data),
  });




export const clientForgotPassword = (email: string) =>
  apiRequest("/auth/client/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  });

export const clientResetPassword = (email: string, code: string, new_password: string) =>
  apiRequest("/auth/client/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, code, new_password })
  });

// ============ Admin Stats ============
export const getAdminStats = () => apiRequest("/admin/stats");

export const getAdminProfile = () => apiRequest("/admin/profile");
export const updateAdminProfile = (data: { username?: string; email?: string; avatar_url?: string }) =>
  apiRequest("/admin/profile", { method: "PATCH", body: JSON.stringify(data) });
export const updateAdminPassword = (data: { current_password: string; new_password: string }) =>
  apiRequest("/admin/password", { method: "PATCH", body: JSON.stringify(data) });

// ============ Licenses ============
export const getLicenses = (appId?: number) =>
  apiRequest(`/admin/licenses/${appId ? `?app_id=${appId}` : ""}`);

export const createLicenses = (data: {
  app_id: number;
  duration_days?: number;
  is_lifetime?: boolean;
  count?: number;
  plan_id?: number | null;
  prefix?: string;
}) =>
  apiRequest("/admin/licenses/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteLicense = (licenseId: string | number) =>
  apiRequest(`/admin/licenses/${licenseId}`, { method: "DELETE" });

export const deleteLicensesBulk = (mode: "all" | "unused" | "used") =>
  apiRequest(`/admin/licenses/?mode=${mode}`, { method: "DELETE" });

export const resetHwid = (licenseKey: string, hwid: string | null = null) =>
  apiRequest("/admin/licenses/reset-hwid", {
    method: "POST",
    body: JSON.stringify({ license_key: licenseKey, hwid }),
  });

// ============ Users ============
export const getUsers = (appId?: number, isBanned?: boolean) => {
  const params = new URLSearchParams();
  if (appId) params.append("app_id", appId.toString());
  if (isBanned !== undefined) params.append("is_banned", isBanned.toString());
  const query = params.toString();
  return apiRequest(`/admin/users/${query ? `?${query}` : ""}`);
};

export const getUser = (userId: string | number) =>
  apiRequest(`/admin/users/${userId}`);

export const deleteUser = (userId: string | number) =>
  apiRequest(`/admin/users/${userId}`, { method: "DELETE" });

export const banUser = (userId: string | number, reason: string | null = null) =>
  apiRequest("/admin/users/ban", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, reason }),
  });


export const unbanUser = (userId: string | number) =>
  apiRequest("/admin/users/unban", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });

export const resetUserHwid = (userId: string | number) =>
  apiRequest(`/admin/users/${userId}/reset-hwid`, {
    method: "POST",
  });


// ============ Applications ============
export const getApplications = () => apiRequest("/admin/apps/");

export const createApplication = (data: {
  name: string;
  version?: string;
  webhook_url?: string;
  force_update?: boolean;
}) =>
  apiRequest("/admin/apps/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateApplication = (
  appId: string | number,
  data: { name?: string; version?: string; webhook_url?: string; force_update?: boolean }
) =>
  apiRequest(`/admin/apps/${appId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteApplication = (appId: string | number) =>
  apiRequest(`/admin/apps/${appId}`, { method: "DELETE" });

// ============ Logs ============
export const getLogs = () => apiRequest("/admin/logs/");

// ============ Files ============
export const getFiles = () => apiRequest("/admin/files/");

export const deleteFile = (fileId: string | number) =>
  apiRequest(`/admin/files/${fileId}`, { method: "DELETE" });

// ============ Variables ============
export const getVariables = (appId: number) => apiRequest(`/admin/vars/?app_id=${appId}`);

export const createVariable = (data: { app_id: number; key: string; value: string }) =>
  apiRequest("/admin/vars/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateVariable = (
  varId: string | number,
  data: { key?: string; value?: string }
) =>
  apiRequest(`/admin/vars/${varId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteVariable = (varId: string | number) =>
  apiRequest(`/admin/vars/${varId}`, { method: "DELETE" });

// ============ Resellers ============
export const getResellers = () => apiRequest("/admin/resellers/");

export async function createReseller(data: {
  username: string;
  email: string;
  password?: string;
  discord_id?: string;
  initial_credits: number;
  company_name?: string;
  phone?: string;
}) {
  return apiRequest("/admin/resellers/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export const updateReseller = (
  resellerId: string | number,
  data: {
    credits?: number;
    enabled?: boolean;
    company_name?: string;
    phone?: string;
    email?: string;
    discord_id?: string;
    is_active?: boolean;
  }
) =>
  apiRequest(`/admin/resellers/${resellerId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteReseller = (resellerId: string | number) =>
  apiRequest(`/admin/resellers/${resellerId}`, { method: "DELETE" });

export const addResellerBalance = (resellerId: string | number, amount: number) =>
  apiRequest(`/admin/resellers/${resellerId}/add-balance`, {
    method: "POST",
    body: JSON.stringify({ amount: amount }),
  });

export const deductResellerBalance = (resellerId: string | number, amount: number) =>
  apiRequest(`/admin/resellers/${resellerId}/deduct-balance`, {
    method: "POST",
    body: JSON.stringify({ amount: amount }),
  });

export const getResellerTransactions = (resellerId: string | number) =>
  apiRequest(`/admin/resellers/${resellerId}/transactions`);

export const getPendingTopups = () => apiRequest("/admin/resellers/pending-topups");

export const approveTopup = (transactionId: number) =>
  apiRequest(`/admin/resellers/topups/${transactionId}/approve`, { method: "POST" });

export const rejectTopup = (transactionId: number) =>
  apiRequest(`/admin/resellers/topups/${transactionId}/reject`, { method: "POST" });

// ============ Store Management ============
export const getStoreStatsPublic = () => apiRequest("/admin/store/stats/public");

export const getStoreProducts = () => apiRequest("/admin/store/");

export const getStoreProduct = (id: number | string) => apiRequest(`/admin/store/${id}`);

export const createStoreProduct = (data: {
  name: string;
  price: number;
  description?: string;
  details?: string;
  image_url?: string;
  yt_video_url?: string;
  category?: string;
  platform?: string;
  app_id?: number | null;
  is_active?: boolean;
  plans?: { name: string; price: number }[];
}) => apiRequest("/admin/store/", {
  method: "POST",
  body: JSON.stringify(data),
});

export const updateStoreProduct = (productId: number, data: any) =>
  apiRequest(`/admin/store/${productId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteStoreProduct = (productId: number) =>
  apiRequest(`/admin/store/${productId}`, { method: "DELETE" });

// ============ Status Updates ============
export const getStoreUpdates = (productId?: number) =>
  apiRequest(`/admin/store/updates/${productId ? `?product_id=${productId}` : ""}`);

export const createStoreUpdate = (data: {
  title: string;
  content: string;
  type: string;
  product_id?: number;
}) => apiRequest("/admin/store/updates/", {
  method: "POST",
  body: JSON.stringify(data),
});

export const deleteStoreUpdate = (updateId: number) =>
  apiRequest(`/admin/store/updates/${updateId}`, { method: "DELETE" });

// ============ Store Clients ============
export const getStoreClients = () => apiRequest("/admin/store/clients/");

export const deleteStoreClient = (clientId: number) =>
  apiRequest(`/admin/store/clients/${clientId}`, { method: "DELETE" });

export const updateStoreClient = (clientId: number, data: any) =>
  apiRequest(`/admin/store/clients/${clientId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const impersonateStoreClient = (clientId: number) =>
  apiRequest(`/admin/store/clients/${clientId}/impersonate`, { method: "POST" });

export const getClientPreviewStats = (clientId: number) =>
  apiRequest(`/admin/store/clients/${clientId}/preview/stats`);

export const getClientPreviewLicenses = (clientId: number) =>
  apiRequest(`/admin/store/clients/${clientId}/preview/licenses`);

export const getClientPreviewOrders = (clientId: number) =>
  apiRequest(`/admin/store/clients/${clientId}/preview/orders`);

export const getStoreOrders = () => apiRequest("/admin/store/orders/all");


export const clearStoreUpdates = () =>
  apiRequest("/admin/store/updates/clear", { method: "DELETE" });

// ============ Reviews ============
export const getStoreReviews = () => apiRequest("/admin/store/reviews/");

export const postStoreReview = (data: { content: string; stars: number }) =>
  apiRequest("/admin/store/reviews/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteStoreReview = (reviewId: number) =>
  apiRequest(`/admin/store/reviews/${reviewId}`, { method: "DELETE" });

export const assignApplicationToReseller = (resellerId: string | number, appId: number) =>
  apiRequest(`/admin/resellers/${resellerId}/apps/${appId}`, {
    method: "POST",
  });

export const removeApplicationFromReseller = (resellerId: string | number, appId: number) =>
  apiRequest(`/admin/resellers/${resellerId}/apps/${appId}`, { method: "DELETE" });

export const getResellerApplications = (resellerId: string | number) =>
  apiRequest(`/admin/resellers/${resellerId}/apps`);

// ============ Tickets ============
export const getTickets = () => apiRequest("/admin/tickets/");

export const getTicket = (ticketId: string | number) =>
  apiRequest(`/admin/tickets/${ticketId}`);

export const replyToTicket = (ticketId: string | number, message: string) =>
  apiRequest("/admin/tickets/message", {
    method: "POST",
    body: JSON.stringify({ ticket_id: ticketId, content: message }),
  });

export const deleteTicket = (ticketId: string | number) =>
  apiRequest(`/admin/tickets/${ticketId}`, { method: "DELETE" });

export const closeTicket = (ticketId: string | number) =>
  apiRequest(`/admin/tickets/${ticketId}/close`, { method: "POST" });

// ============ Team Management ============
export const getTeamMembers = () => apiRequest("/admin/team/");

export const createTeamMember = (data: {
  name: string;
  role: string;
  avatar_url?: string;
  bio?: string;
  discord_url?: string;
  twitter_url?: string;
  github_url?: string;
}) => apiRequest("/admin/team/", {
  method: "POST",
  body: JSON.stringify(data),
});

export const updateTeamMember = (
  memberId: string | number,
  data: {
    name?: string;
    role?: string;
    avatar_url?: string;
    bio?: string;
    discord_url?: string;
    twitter_url?: string;
    github_url?: string;
  }
) =>
  apiRequest(`/admin/team/${memberId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteTeamMember = (memberId: string | number) =>
  apiRequest(`/admin/team/${memberId}`, { method: "DELETE" });

export const getPublicTeam = () => apiRequest("/store/team");

// ============ System ============
export const getHealth = () => apiRequest("/health").catch(() => apiRequest("/status"));

export const getApiStatus = () => apiRequest("/status");

export const getServerTime = () => apiRequest("/time");

// Test if API server is reachable (no auth required)
export const testServerConnection = async () => {
  const isProd = isProduction();

  console.log(`[TEST] Attempting connection (${isProd ? 'via Supabase Proxy' : 'Direct'})...`);

  // Try multiple endpoints as fallback
  const endpoints = ['/status', '/health', '/'];

  for (const endpoint of endpoints) {
    try {
      let testUrl;
      const useViteProxy = !isProd && !import.meta.env.VITE_API_URL;

      if (useViteProxy) {
        testUrl = `/api${endpoint}`;
      } else {
        testUrl = isProd && BASE_URL.startsWith('http://')
          ? `/api/proxy?endpoint=${encodeURIComponent(endpoint)}`
          : (endpoint === '/'
            ? BASE_URL
            : `${BASE_URL.replace(/\/$/, '')}/api${endpoint}`);
      }

      console.log(`[TEST] Testing endpoint: ${endpoint} URL: ${testUrl}`);

      const response = await fetch(testUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok || response.status < 500) {
        console.log(`[TEST] ✅ Server responded! Status: ${response.status}`);
        try {
          const data = await response.json();
          return { success: true, data };
        } catch (e) {
          // Even if JSON parsing fails, we got a response = server is reachable
          return { success: true, data: null };
        }
      }
    } catch (error) {
      console.warn(`[TEST] Endpoint ${endpoint} failed:`, error);
      continue;
    }
  }

  console.error(`[TEST] ❌ Server is NOT reachable on any endpoint!`);
  return {
    success: false,
    error: 'Backend server is unreachable',
    serverUrl: BASE_URL
  };
};

// ============ Reseller API ============
export const resellerGetProfile = () => apiRequest("/reseller/profile");

export const resellerUpdateProfile = (data: { old_password?: string; new_password?: string }) =>
  apiRequest("/reseller/profile/password", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const resellerGetTransactions = () => apiRequest("/reseller/transactions");

export const resellerGetApps = () => apiRequest("/reseller/apps");

export const resellerGenerateLicense = (data: {
  app_id: number;
  duration_days: number;
  username?: string;
  hwid?: string;
  plan_id?: number;
}) =>
  apiRequest("/reseller/licenses/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const resellerGetLicenses = (appId?: number) =>
  apiRequest(`/reseller/licenses/${appId ? `?app_id=${appId}` : ""}`);

export const resellerCreateLicensesBulk = (data: {
  app_id: number;
  count: number;
  duration_days: number;
  plan_id?: number | null;
}) =>
  apiRequest("/reseller/licenses/create", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const resellerDeleteLicense = (licenseId: string | number) =>
  apiRequest(`/reseller/licenses/${licenseId}`, { method: "DELETE" });

export const resellerResetHwid = (licenseKey: string) =>
  apiRequest("/reseller/licenses/reset-hwid", {
    method: "POST",
    body: JSON.stringify({ license_key: licenseKey }),
  });

export const resellerGetUsers = () => apiRequest("/reseller/users");

export const resellerGetSubscriptions = () => apiRequest("/reseller/subscriptions");

// ============ Tickets Removed ============
// Ticket functionality has been removed for resellers
// export const resellerGetTickets = () => apiRequest("/reseller/tickets");

export const resellerCreateLicenses = (data: {
  app_id: number;
  count: number;
  duration_days: number;
  plan_id?: number | null;
}) =>
  apiRequest("/reseller/licenses/create", {
    method: "POST",
    body: JSON.stringify(data),
  });

// export const resellerCreateTicket = (data) => ...

export const resellerGetApplications = () =>
  apiRequest("/reseller/applications");

export const resellerAssignSubscription = (data: {
  user_id: number;
  plan_id: number;
  duration_days: number;
}) =>
  apiRequest("/reseller/subscriptions/assign", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const generateLicenseKey = (data: {
  app_id: number;
  duration_days: number;
  username?: string;
  hwid?: string;
}) =>
  apiRequest("/admin/licenses/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getResellerBalance = (resellerId: string | number) =>
  apiRequest(`/admin/resellers/${resellerId}/balance`);
// ============ Subscriptions (Admin) ==========
export const getSubscriptionPlans = () => apiRequest("/admin/subscriptions/plans");

export const createSubscriptionPlan = (data: {
  app_id: number;
  name: string;
  level?: number;
  description?: string;
  active?: boolean;
  max_seats?: number | null;
}) => apiRequest("/admin/subscriptions/plans", {
  method: "POST",
  body: JSON.stringify(data),
});

export const updateSubscriptionPlan = (planId: number, data: {
  app_id: number;
  name: string;
  level?: number;
  description?: string;
  active?: boolean;
  max_seats?: number | null;
}) => apiRequest(`/admin/subscriptions/plans/${planId}`, {
  method: "PUT",
  body: JSON.stringify(data),
});

export const deleteSubscriptionPlan = (planId: number) => apiRequest(`/admin/subscriptions/plans/${planId}`, { method: "DELETE" });

export const assignSubscriptionToUser = (data: { user_id?: number; license_key?: string; plan_id: number; duration_days?: number | null }) =>
  apiRequest("/admin/subscriptions/assign", { method: "POST", body: JSON.stringify(data) });

export const deleteUserSubscription = (userId: string | number, subscriptionId: string | number) =>
  apiRequest(`/admin/users/${userId}/subscriptions/${subscriptionId}`, { method: "DELETE" });

export const extendSubscription = (data: { subscription_id: number; add_days?: number }) =>
  apiRequest("/admin/subscriptions/extend", { method: "POST", body: JSON.stringify(data) });

export const pauseSubscription = (data: { subscription_id: number; pause_until?: string }) =>
  apiRequest("/admin/subscriptions/pause", { method: "POST", body: JSON.stringify(data) });

// ============ Reseller Subscriptions (Admin) ==========
export const assignSubscriptionToReseller = (resellerId: string | number, data: { plan_id: number; duration_days?: number | null }) =>
  apiRequest(`/admin/resellers/${resellerId}/subscriptions`, { method: "POST", body: JSON.stringify(data) });

export const getResellerSubscriptions = (resellerId: string | number) =>
  apiRequest(`/admin/resellers/${resellerId}/subscriptions`);



export const initiateRazorpayOrder = (data: { amount: number; items: any[] }) =>
  apiRequest("/payments/razorpay/create-order", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const verifyRazorpayPayment = (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => apiRequest("/payments/razorpay/verify", {
  method: "POST",
  body: JSON.stringify(data),
});

export const resellerCreateTopupOrder = (amount: number) =>
  apiRequest("/reseller/credits/topup/create-order", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });

export const resellerVerifyTopupPayment = (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) =>
  apiRequest("/reseller/credits/topup/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });


export const getMySubscriptions = () => apiRequest(`/reseller/subscriptions`);

export const deleteResellerSubscription = (resellerId: string | number, subscriptionId: string | number) =>
  apiRequest(`/admin/resellers/${resellerId}/subscriptions/${subscriptionId}`, { method: "DELETE" });

export const resumeSubscription = (data: { subscription_id: number }) =>
  apiRequest("/admin/subscriptions/resume", { method: "POST", body: JSON.stringify(data) });

export const pauseResellerSubscription = (resellerId: string | number, subscriptionId: number) =>
  apiRequest(`/admin/resellers/${resellerId}/subscriptions/${subscriptionId}/pause`, { method: "POST" });

export const resumeResellerSubscription = (resellerId: string | number, subscriptionId: number) =>
  apiRequest(`/admin/resellers/${resellerId}/subscriptions/${subscriptionId}/resume`, { method: "POST" });


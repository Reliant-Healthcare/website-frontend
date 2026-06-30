const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Get the auth token from localStorage (zustand persisted store)
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('reliant-auth');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      if (res.status === 401) {
        // Token expired or invalid, auto logout
        try {
          const { useAuthStore } = await import('./auth-store');
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/admin/login')) {
            window.location.href = '/login';
          }
        } catch (e) {
          // ignore
        }
      }
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `Error (HTTP ${res.status})`);
    }

    return res.json();
  } catch (error: any) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to the server. Please check your internet connection or verify the backend is running.');
    }
    throw error;
  }
}

// ── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getProfile: () => apiFetch('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  forgotPassword: (email: string) =>
    apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),
};

// ── Applications API ─────────────────────────────────────────────────────────

export const applicationsApi = {
  submit: (data: any) =>
    apiFetch('/applications', { method: 'POST', body: JSON.stringify(data) }),

  getAll: () => apiFetch('/applications'),

  getDashboardStats: () => apiFetch('/applications/dashboard/stats'),

  getOne: (id: string) => apiFetch(`/applications/${id}`),

  getMyApplications: () => apiFetch('/applications/my/list'),

  updateStatus: (id: string, status: string) =>
    apiFetch(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  releaseDocuments: (id: string, sectionIds: string[]) =>
    apiFetch(`/applications/${id}/documents/release`, {
      method: 'POST',
      body: JSON.stringify({ sectionIds }),
    }),

  uploadDocument: (applicationId: string, sectionId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch(`/applications/${applicationId}/documents/${sectionId}/upload`, {
      method: 'POST',
      body: formData,
    });
  },

  submitWebForm: (applicationId: string, sectionId: string, formData: any) =>
    apiFetch(`/applications/${applicationId}/documents/${sectionId}/submit-form`, {
      method: 'POST',
      body: JSON.stringify({ formData }),
    }),

  updateDocumentStatus: (docId: string, status: 'APPROVED' | 'REJECTED', adminNotes?: string, expirationDate?: string) =>
    apiFetch(`/applications/documents/${docId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes, expirationDate }),
    }),

  sendDocumentExpirationReminder: (docId: string) =>
    apiFetch(`/applications/documents/${docId}/reminder`, {
      method: 'POST',
    }),
};

// ── Document Sections API (Admin) ────────────────────────────────────────────

export const documentSectionsApi = {
  getAll: (params?: { roleType?: string; isDefault?: string; isActive?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch(`/document-sections${qs ? `?${qs}` : ''}`);
  },

  getDefaults: (roleType: string) =>
    apiFetch(`/document-sections/defaults/${roleType}`),

  getOne: (id: string) => apiFetch(`/document-sections/${id}`),

  create: (data: FormData) =>
    apiFetch('/document-sections', { method: 'POST', body: data }),

  update: (id: string, data: FormData) =>
    apiFetch(`/document-sections/${id}`, { method: 'PATCH', body: data }),

  remove: (id: string) =>
    apiFetch(`/document-sections/${id}`, { method: 'DELETE' }),

  reorder: (orderedIds: string[]) =>
    apiFetch('/document-sections/bulk/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds }),
    }),

  updateDefaults: (sectionIds: string[], isDefault: boolean) =>
    apiFetch('/document-sections/bulk/defaults', {
      method: 'PATCH',
      body: JSON.stringify({ sectionIds, isDefault }),
    }),
};

// ── Users API (Admin) ────────────────────────────────────────────────────────

export const usersApi = {
  getAdmins: () => apiFetch('/users/admins'),

  createAdmin: (data: any) =>
    apiFetch('/users/admins', { method: 'POST', body: JSON.stringify(data) }),

  updateAdmin: (id: string, data: any) =>
    apiFetch(`/users/admins/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteAdmin: (id: string) =>
    apiFetch(`/users/admins/${id}`, { method: 'DELETE' }),
};

// ── Jobs API ─────────────────────────────────────────────────────────────────

export const jobsApi = {
  /** Public — active jobs with optional search/filter */
  getActive: (params?: { search?: string; department?: string; type?: string }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v && v !== 'all'))
    ).toString();
    return apiFetch(`/jobs/active${qs ? `?${qs}` : ''}`);
  },

  /** Public — single job */
  getOne: (id: string) => apiFetch(`/jobs/${id}`),

  /** Admin — all jobs (including drafts) */
  getAll: () => apiFetch('/jobs'),

  create: (data: {
    title: string;
    department: string;
    type: string;
    location: string;
    description: string;
    requirements?: string;
    benefits?: string;
  }) => apiFetch('/jobs', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<{
    title: string;
    department: string;
    type: string;
    location: string;
    description: string;
    requirements: string;
    benefits: string;
    isActive: boolean;
  }>) => apiFetch(`/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  remove: (id: string) => apiFetch(`/jobs/${id}`, { method: 'DELETE' }),
};

// ── Courses API ──────────────────────────────────────────────────────────────

export const coursesApi = {
  getAll: () => apiFetch('/courses'),
  getOne: (id: string) => apiFetch(`/courses/${id}`),
  create: (data: { title: string; category: string; description?: string }) =>
    apiFetch('/courses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch(`/courses/${id}`, { method: 'DELETE' }),
  
  enroll: (id: string) =>
    apiFetch(`/courses/${id}/enroll`, { method: 'POST' }),
  completeLesson: (courseId: string, lessonId: string) =>
    apiFetch(`/courses/${courseId}/lessons/${lessonId}/complete`, { method: 'POST' }),

  getMyCertificates: () =>
    apiFetch('/courses/my-certificates'),

  getEnrollments: (id: string) =>
    apiFetch(`/courses/${id}/enrollments`),

  // Lessons
  createLesson: (courseId: string, data: { title: string; content?: string; videoUrl?: string; order?: number; readingFile?: File | null }) => {
    if (data.readingFile) {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.content) formData.append('content', data.content);
      if (data.videoUrl) formData.append('videoUrl', data.videoUrl);
      if (data.order !== undefined) formData.append('order', String(data.order));
      formData.append('readingFile', data.readingFile);
      return apiFetch(`/courses/${courseId}/lessons`, { method: 'POST', body: formData });
    }
    return apiFetch(`/courses/${courseId}/lessons`, { method: 'POST', body: JSON.stringify(data) });
  },

  updateLesson: (lessonId: string, data: { title: string; content?: string; videoUrl?: string; order?: number; readingFile?: File | null; clearReadingFile?: boolean }) => {
    if (data.readingFile || data.clearReadingFile) {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.content !== undefined) formData.append('content', data.content || '');
      if (data.videoUrl !== undefined) formData.append('videoUrl', data.videoUrl || '');
      if (data.order !== undefined) formData.append('order', String(data.order));
      if (data.readingFile) formData.append('readingFile', data.readingFile);
      if (data.clearReadingFile) formData.append('clearReadingFile', 'true');
      return apiFetch(`/courses/lessons/${lessonId}`, { method: 'PUT', body: formData });
    }
    return apiFetch(`/courses/lessons/${lessonId}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteLesson: (lessonId: string) =>
    apiFetch(`/courses/lessons/${lessonId}`, { method: 'DELETE' }),
};

// ── AI Companion API ─────────────────────────────────────────────────────────

export const aiApi = {
  chat: (portalType: 'application' | 'lms', message: string, conversationId?: string) =>
    apiFetch('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ portalType, message, conversationId }),
    }),

  getHistory: () => apiFetch('/ai/history'),

  checkConfig: () => apiFetch('/ai/config'),

  getGlobalConfig: () => apiFetch('/ai/config/global'),

  updateGlobalSettings: (chatbotAppEnabled?: boolean, chatbotLmsEnabled?: boolean) =>
    apiFetch('/ai/config/global', {
      method: 'PUT',
      body: JSON.stringify({ chatbotAppEnabled, chatbotLmsEnabled }),
    }),

  updateUserOverride: (
    userId: string,
    chatbotAppOverride?: 'INHERIT' | 'FORCE_ENABLE' | 'FORCE_DISABLE',
    chatbotLmsOverride?: 'INHERIT' | 'FORCE_ENABLE' | 'FORCE_DISABLE',
  ) =>
    apiFetch(`/ai/config/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ chatbotAppOverride, chatbotLmsOverride }),
    }),

  getAdminChatHistory: (userId: string) => apiFetch(`/ai/history/admin/${userId}`),
};
// ── Contact API ──────────────────────────────────────────────────────────────

export const contactApi = {
  /** Public — anyone can submit */
  submit: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    subject?: string;
    category?: string;
    message: string;
  }) => apiFetch('/contact', { method: 'POST', body: JSON.stringify(data) }),

  /** Admin — all messages */
  getAll: () => apiFetch('/contact'),

  /** Admin — unread badge count */
  getUnreadCount: () => apiFetch('/contact/unread-count'),

  /** Admin — mark one as read */
  markRead: (id: string) => apiFetch(`/contact/${id}/read`, { method: 'PATCH' }),

  /** Admin — delete a message */
  remove: (id: string) => apiFetch(`/contact/${id}`, { method: 'DELETE' }),
};

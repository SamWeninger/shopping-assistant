
import { getIdToken } from './auth';

const API_BASE_URL = 'https://lni0ndybye.execute-api.us-east-2.amazonaws.com/dev';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || `API error: ${response.status} ${response.statusText}`
    );
    throw error;
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

// Helper function to get the authorization header
const getAuthHeader = async () => {
  const token = await getIdToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

// API methods for shopping lists
export const api = {
  // Lists API
  lists: {
    create: async (data: { listName: string; createdBy: string; allowedUsers: string[] }) => {
      const response = await fetch(`${API_BASE_URL}/lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeader()),
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    get: async (listId: string, requestingUserId: string) => {
      const response = await fetch(`${API_BASE_URL}/lists/${listId}?requestingUserId=${requestingUserId}`, {
        headers: await getAuthHeader(),
      });
      return handleResponse(response);
    },

    delete: async (listId: string, requestingUserId: string) => {
      const response = await fetch(`${API_BASE_URL}/lists/${listId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeader()),
        },
        body: JSON.stringify({ requestingUserId }),
      });
      return handleResponse(response);
    },
  },

  // Items API
  items: {
    add: async (listId: string, data: { itemName: string; quantity: string; addedBy: string }) => {
      const response = await fetch(`${API_BASE_URL}/lists/${listId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeader()),
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    markPurchased: async (
      listId: string,
      itemId: string,
      data: { purchasedBy: string; cost: number; itemDetails?: string }
    ) => {
      const response = await fetch(`${API_BASE_URL}/lists/${listId}/items/${itemId}/purchase`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeader()),
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    delete: async (listId: string, itemId: string) => {
      const response = await fetch(`${API_BASE_URL}/lists/${listId}/items/${itemId}`, {
        method: 'DELETE',
        headers: await getAuthHeader(),
      });
      return handleResponse(response);
    },
  },

  // Users API
  users: {
    add: async (listId: string, userId: string) => {
      const response = await fetch(`${API_BASE_URL}/lists/${listId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeader()),
        },
        body: JSON.stringify({ userId }),
      });
      return handleResponse(response);
    },

    remove: async (listId: string, userId: string, requestingUserId: string) => {
      const response = await fetch(`${API_BASE_URL}/lists/${listId}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeader()),
        },
        body: JSON.stringify({ requestingUserId }),
      });
      return handleResponse(response);
    },
  },

  // Receipts API
  receipts: {
    getUploadUrl: async (listId: string, uploadedBy: string) => {
      const response = await fetch(`${API_BASE_URL}/receipts/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeader()),
        },
        body: JSON.stringify({ listId, uploadedBy }),
      });
      return handleResponse(response);
    },

    uploadImage: async (uploadUrl: string, file: File) => {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });
      return response.ok;
    },
  },
};

export default api;

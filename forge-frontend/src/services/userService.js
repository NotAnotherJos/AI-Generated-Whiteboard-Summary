import { api } from '../utils';
import { requestConfluence } from '@forge/bridge';


// User service
export const userService = {
  // Create or check user
  checkOrCreate: (userId) => api.post('/api/users', { id: userId }),

  // Get user image history
  listImages: (userId) => api.get(`/api/users/${userId}/images`),

  // Get current user info
  getCurrentUser: async () => {
    const myRoute = '/wiki/rest/api/user/current';

    console.log('[getCurrentUser] Requesting Confluence API:', myRoute, {
      headers: { Accept: 'application/json' }
    });

    const response = await requestConfluence(myRoute, {
      headers: { Accept: 'application/json' }
    });

    console.log('[getCurrentUser] Response status:', response.status, response.statusText);

    let user;
    try {
      user = await response.json();
      console.log('[getCurrentUser] Response JSON:', user);
    } catch (err) {
      console.error('[getCurrentUser] Failed to parse JSON:', err);
    }

    if (!response.ok) {
      console.error('[getCurrentUser] Confluence API error', response.status, response.statusText);
      throw new Error('Failed to get user information');
    }

    await api.post('/api/users', { id: user.accountId });

    return {
      accountId: user.accountId,
      displayName: user.displayName,
    };
  }
};

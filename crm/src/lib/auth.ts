import { User } from './types';
import { CRMStore, getStore } from './store';

const CURRENT_USER_KEY = 'crm_current_user';
const SALT = 'crm_salt_2024';

/**
 * Simple client-side password hashing using btoa with a salt
 * Note: This is not cryptographically secure for production use.
 * For production, use bcryptjs or similar on the server side.
 */
export function hashPassword(password: string): string {
  try {
    const combined = `${password}:${SALT}`;
    const encoded = btoa(combined);
    return `base64hash:${encoded}`;
  } catch (error) {
    console.error('Failed to hash password:', error);
    return '';
  }
}

/**
 * Verify a password against its hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  try {
    if (!hash.startsWith('base64hash:')) {
      return false;
    }

    const stored = hash.replace('base64hash:', '');
    const combined = `${password}:${SALT}`;
    const encoded = btoa(combined);

    return encoded === stored;
  } catch (error) {
    console.error('Failed to verify password:', error);
    return false;
  }
}

/**
 * Get the currently logged in user from localStorage
 */
export function getCurrentUser(): User | null {
  try {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    if (!userStr) return null;

    const user = JSON.parse(userStr) as User;
    return user;
  } catch (error) {
    console.warn('Failed to get current user:', error);
    return null;
  }
}

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Set the current user in localStorage
 */
function setCurrentUser(user: User | null): void {
  try {
    if (typeof window === 'undefined') return;

    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (error) {
    console.warn('Failed to set current user:', error);
  }
}

/**
 * Login with email and password
 * Returns the user if successful, null otherwise
 */
export function login(email: string, password: string): User | null {
  try {
    const store = getStore();
    const users = store.getUsers();

    const user = users.find((u) => u.email === email);
    if (!user) {
      console.warn('User not found');
      return null;
    }

    if (!verifyPassword(password, user.passwordHash)) {
      console.warn('Invalid password');
      return null;
    }

    setCurrentUser(user);
    return user;
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
}

/**
 * Register a new user
 * Returns the user if successful, null if user already exists or registration fails
 */
export function register(name: string, email: string, password: string): User | null {
  try {
    const store = getStore();
    const users = store.getUsers();

    // Check if user already exists
    if (users.some((u) => u.email === email)) {
      console.warn('User with this email already exists');
      return null;
    }

    // Validate inputs
    if (!name || !email || !password) {
      console.warn('Missing required fields');
      return null;
    }

    if (password.length < 6) {
      console.warn('Password must be at least 6 characters');
      return null;
    }

    // Create new user
    const passwordHash = hashPassword(password);
    const newUser = store.createUser({
      email,
      name,
      passwordHash,
    });

    setCurrentUser(newUser);
    return newUser;
  } catch (error) {
    console.error('Registration failed:', error);
    return null;
  }
}

/**
 * Logout the current user
 */
export function logout(): void {
  try {
    setCurrentUser(null);
  } catch (error) {
    console.warn('Logout failed:', error);
  }
}

/**
 * Change password for the current user
 */
export function changePassword(currentPassword: string, newPassword: string): boolean {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.warn('No user logged in');
      return false;
    }

    if (!verifyPassword(currentPassword, currentUser.passwordHash)) {
      console.warn('Current password is incorrect');
      return false;
    }

    if (newPassword.length < 6) {
      console.warn('New password must be at least 6 characters');
      return false;
    }

    const store = getStore();
    const newPasswordHash = hashPassword(newPassword);
    const updated = store.updateUser(currentUser.id, {
      passwordHash: newPasswordHash,
    });

    if (updated) {
      setCurrentUser(updated);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Change password failed:', error);
    return false;
  }
}

/**
 * Initialize default user if none exists
 */
export function initializeDefaultUser(): void {
  try {
    const store = getStore();
    const users = store.getUsers();

    if (users.length === 0) {
      const defaultPassword = 'admin123';
      const passwordHash = hashPassword(defaultPassword);
      store.createUser({
        email: 'admin@crm.com',
        name: 'Administrator',
        passwordHash,
      });
    }
  } catch (error) {
    console.warn('Failed to initialize default user:', error);
  }
}

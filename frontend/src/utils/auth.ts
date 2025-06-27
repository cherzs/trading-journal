import { User } from '../types/Trade';

const USERS_KEY = 'trading_journal_users';
const CURRENT_USER_KEY = 'trading_journal_current_user';

export const registerUser = (email: string, password: string, name: string): boolean => {
  const users = getUsers();
  
  if (users.find(user => user.email === email)) {
    return false; // User already exists
  }
  
  const newUser: User = {
    id: Date.now().toString(),
    email,
    name
  };
  
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(`${email}_password`, password);
  
  return true;
};

export const loginUser = (email: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) return null;
  
  const storedPassword = localStorage.getItem(`${email}_password`);
  if (storedPassword !== password) return null;
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const logoutUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

const getUsers = (): User[] => {
  const usersStr = localStorage.getItem(USERS_KEY);
  return usersStr ? JSON.parse(usersStr) : [];
};
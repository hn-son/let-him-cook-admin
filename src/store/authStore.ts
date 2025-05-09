import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
}

interface TokenPayload {
    exp: number;
    userId: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    checkTokenValidity: () => void;
}

const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (user, token) => set({ user, token, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
            checkTokenValidity: () => {
                const { token } = get();

                if (!token) {
                    return false;
                }

                try {
                    const decoded = jwtDecode<TokenPayload>(token);
                    const currentTime = Date.now() / 1000;

                    // Nếu token hết hạn
                    if (decoded.exp < currentTime) {
                        // Tự động logout nếu token hết hạn
                        get().logout();
                        set({ isAuthenticated: false });
                    }
                    set({ isAuthenticated: true });
                } catch (error) {
                    console.error('Invalid token:', error);
                    set({ isAuthenticated: false });
                    get().logout();
                }
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);

export default useAuthStore;

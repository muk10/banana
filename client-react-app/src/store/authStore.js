import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: !!user && !!token,
        });
        // Also store in localStorage for API interceptor
        if (token) localStorage.setItem("token", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      },

      updateUser: (userData) => {
        set((state) => {
          const updatedUser = { ...state.user, ...userData };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          return {
            user: updatedUser,
          };
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;


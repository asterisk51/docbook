import React, { createContext, useContext, useState } from 'react';

type AuthContextType = {
    isAdmin: boolean;
    loginAsAdmin: () => void;
    loginAsUser: () => void;
    logout: () => void;
    user: { id: string; name: string } | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState<{ id: string; name: string } | null>(null);

    const loginAsAdmin = () => {
        setIsAdmin(true);
        setUser({ id: 'admin-1', name: 'Admin User' });
    };

    const loginAsUser = () => {
        setIsAdmin(false);
        setUser({ id: `user-${Math.random().toString(36).substr(2, 9)}`, name: 'Guest User' });
    };

    const logout = () => {
        setIsAdmin(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAdmin, loginAsAdmin, loginAsUser, logout, user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

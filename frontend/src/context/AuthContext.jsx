import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Initialize from localStorage for instant UI responsiveness on refresh
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setLoading(false);
            setUser(null);
            return;
        }

        try {
            const { data } = await api.get('/user/current-user');
            if (data.success) {
                setUser(data.data);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            // Don't auto-logout on network error, only on 401
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const { data } = await api.post('/user/login', credentials);
        if (data.success) {
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            setUser(data.data.user);
        }
        return data;
    };

    const register = async (formData) => {
        const { data } = await api.post('/user/register', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (data.success) {
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            setUser(data.data.user);
        }
        return data;
    };

    const logout = async () => {
        try {
            await api.post('/user/logout');
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

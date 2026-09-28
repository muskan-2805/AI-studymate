import { createContext, useContext, useState, useEffect } from 'react';
import API, { setAccessTokenRef, setOnRefreshFail } from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);
    const [user, setUser] = useState(null);
    const [checkingSession, setCheckingSession] = useState(true);

    const login = (token, userData) => {
        setAccessToken(token);
        setUser(userData);
    };

    const logout = () => {
        setAccessToken(null);
        setUser(null);
    };

    useEffect(() => {
        setAccessTokenRef({ current: accessToken });
    }, [accessToken]);

    useEffect(() => {
        setOnRefreshFail(() => logout());

        const handleRefreshed = (e) => setAccessToken(e.detail);
        window.addEventListener('access-token-refreshed', handleRefreshed);

        API.post('/auth/refresh')
            .then((res) => API.get('/auth/me', { headers: { Authorization: `Bearer ${res.data.accessToken}` } })
                .then((meRes) => {
                    setAccessToken(res.data.accessToken);
                    setUser(meRes.data);
                }))
            .catch(() => {})
            .finally(() => setCheckingSession(false));

        return () => window.removeEventListener('access-token-refreshed', handleRefreshed);
    }, []);

    return (
        <AuthContext.Provider value={{ accessToken, user, login, logout, checkingSession }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);
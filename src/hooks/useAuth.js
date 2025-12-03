import { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useToast } from '../components/UI';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const showToast = useToast();

    // Carrega perfis ao iniciar
    useEffect(() => {
        db.profiles.toArray().then(setProfiles);
    }, []);

    const login = (profile, pin) => {
        if (pin === profile.pin) {
            setUser(profile);
            showToast(`Bem-vindo, ${profile.name}!`, 'success');
            return true;
        }
        showToast('PIN Incorreto', 'danger');
        return false;
    };

    const register = async (name, pin) => {
        if (name && pin) {
            await db.profiles.add({ name, pin, theme: 'light' });
            const all = await db.profiles.toArray();
            setProfiles(all);
            showToast('Perfil criado!', 'success');
            return true;
        }
        return false;
    };

    const logout = () => setUser(null);

    return { user, profiles, login, register, logout };
};
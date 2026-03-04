"use client";

import { useEffect, useState } from "react";

type AgentProfile = {
    name: string;
    email: string;
    timezone: string;
};

const DEFAULTS: AgentProfile = {
    name: "Agente Pro",
    email: "soporte@shopflow.com",
    timezone: "America/Mexico_City",
};

const STORAGE_KEY = "shopflow_agent_profile";

export function useAgentProfile() {
    const [profile, setProfile] = useState<AgentProfile>(DEFAULTS);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setProfile({ ...DEFAULTS, ...JSON.parse(stored) });
            }
        } catch {
            // localStorage not available
        }
        setLoaded(true);
    }, []);

    const saveProfile = (updates: Partial<AgentProfile>) => {
        const next = { ...profile, ...updates };
        setProfile(next);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
            // localStorage not available
        }
    };

    return { profile, saveProfile, loaded };
}

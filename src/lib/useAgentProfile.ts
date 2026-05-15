"use client";

import { useState } from "react";

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

function initializeProfile(): AgentProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULTS, ...JSON.parse(stored) };
    }
  } catch {
    // localStorage not available
  }
  return DEFAULTS;
}

export function useAgentProfile() {
  const [profile, setProfile] = useState<AgentProfile>(initializeProfile);
  const loaded = true;

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

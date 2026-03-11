/* eslint-disable @typescript-eslint/no-explicit-any */
export const HonchoMemory = {
    save: (key: string, data: any) => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(`honcho_memory_${key}`, JSON.stringify(data));
                console.log(`[Honcho Sync] Successfully saved to memory for ${key}`);
            } catch (e) {
                console.error("[Honcho Sync] Failed to save", e);
            }
        }
    },
    load: (key: string) => {
        if (typeof window !== 'undefined') {
            try {
                const data = localStorage.getItem(`honcho_memory_${key}`);
                if (data) {
                    console.log(`[Honcho Sync] Successfully loaded memory for ${key}`);
                    return JSON.parse(data);
                }
            } catch (e) {
                console.error("[Honcho Sync] Failed to load", e);
            }
        }
        return null;
    },
    addActivity: (label: string, type: string = "success") => {
        if (typeof window !== 'undefined') {
            try {
                const prev = HonchoMemory.load("activities") || [];
                const newItem = { label, type, ts: Math.floor(Date.now() / 1000) };
                const updated = [newItem, ...prev].slice(0, 50);
                HonchoMemory.save("activities", updated);
            } catch (e) {
                console.error("[Honcho Sync] Failed to add activity", e);
            }
        }
    }
};

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
    }
};

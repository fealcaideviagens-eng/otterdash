export const getRiskColorHex = (className: string) => {
    // Semantic tokens
    if (className?.includes('success')) return '#16a34a'; // green-600 (matches existing success token approx)
    if (className?.includes('warning')) return '#ca8a04'; // yellow-600 (matches existing warning token approx)
    if (className?.includes('destructive')) return '#dc2626'; // red-600 (matches existing destructive token approx)

    // Legacy colors
    if (className?.includes('green')) return '#16a34a';
    if (className?.includes('yellow')) return '#ca8a04';
    if (className?.includes('orange')) return '#ea580c';
    if (className?.includes('red')) return '#dc2626';

    return '#cbd5e1'; // slate-300
};

export const CALL_MONTHS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
export const PUT_MONTHS = ['M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'];

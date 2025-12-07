export const getRiskColorHex = (className: string) => {
    if (className?.includes('green')) return '#16a34a'; // green-600
    if (className?.includes('yellow')) return '#ca8a04'; // yellow-600
    if (className?.includes('orange')) return '#ea580c'; // orange-600
    if (className?.includes('red')) return '#dc2626'; // red-600
    return '#cbd5e1'; // slate-300
};

export const CALL_MONTHS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
export const PUT_MONTHS = ['M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'];

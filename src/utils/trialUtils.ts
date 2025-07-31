export const getDaysSince = (startDateStr: string): number => {
    const startDate = new Date(startDateStr);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const isOneDayBeforeTrialEnd = (startDateStr: string, totalDays: number): boolean => {
    const daysSince = getDaysSince(startDateStr);
    return daysSince === totalDays - 1;
};

export const isTrialExpired = (startDateStr: string, totalDays: number): boolean => {
    const daysSince = getDaysSince(startDateStr);
    return daysSince >= totalDays;
};

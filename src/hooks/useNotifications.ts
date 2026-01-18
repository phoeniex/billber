import { useCallback } from 'react';

export const useNotifications = () => {
    // Feature removed: returns no-op functions and empty state
    const showNotification = useCallback((..._args: any[]) => { }, []);
    const dismissNotification = useCallback((..._args: any[]) => { }, []);

    return {
        notifications: [],
        showNotification,
        dismissNotification,
    };
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getActivitiesByDate, ActivityLog } from '../services/firestoreService';

type ActivityContextType = {
  activities: ActivityLog[];
  refreshActivities: () => Promise<void>;
};

const ActivityContext = createContext<ActivityContextType>({
  activities: [],
  refreshActivities: async () => {},
});

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const { user } = useAuth();

  const refreshActivities = async () => {
    if (!user) {
      setActivities([]);
      return;
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayLogs = await getActivitiesByDate(user.uid, today);
      setActivities(todayLogs);
    } catch (error) {
      console.error("Failed to fetch today's activities", error);
    }
  };

  useEffect(() => {
    refreshActivities();
  }, [user]);

  return (
    <ActivityContext.Provider value={{ activities, refreshActivities }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivities() {
  return useContext(ActivityContext);
}
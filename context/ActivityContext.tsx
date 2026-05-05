import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getActivitiesByDate, ActivityLog, getWorkouts, getCustomWorkouts, Workout } from '../services/firestoreService';

type ActivityContextType = {
  activities: ActivityLog[];
  workouts: Workout[];
  refreshActivities: () => Promise<void>;
};

const ActivityContext = createContext<ActivityContextType>({
  activities: [],
  workouts: [],
  refreshActivities: async () => {},
});

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const { user } = useAuth();

  const refreshActivities = async () => {
    try {
      const fetchedWorkouts = await getWorkouts();
      
      if (!user) {
        setWorkouts(fetchedWorkouts);
        setActivities([]);
        return;
      }
      
      const customWorkouts = await getCustomWorkouts(user.uid);
      setWorkouts([...fetchedWorkouts, ...customWorkouts]);

      const today = new Date().toISOString().split('T')[0];
      const todayLogs = await getActivitiesByDate(user.uid, today);
      setActivities(todayLogs);
    } catch (error) {
      console.error("Failed to fetch activities/workouts", error);
    }
  };

  useEffect(() => {
    refreshActivities();
  }, [user]);

  return (
    <ActivityContext.Provider value={{ activities, workouts, refreshActivities }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivities() {
  return useContext(ActivityContext);
}
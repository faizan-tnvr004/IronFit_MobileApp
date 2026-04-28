import React, { createContext, useContext, useState } from 'react';

export type Activity = {
  id: string;
  name: string;
  duration: string;
  calories: string;
  icon: string;
  color: string;
  route: string;
};

const DEFAULT_ACTIVITIES: Activity[] = [
  { id: '1', name: 'Running', duration: '25 min', calories: '220 kcal', icon: 'street-view', color: '#F97316', route: '/running' },
  { id: '2', name: 'Cycling', duration: '45 min', calories: '380 kcal', icon: 'bicycle', color: '#22C55E', route: '/cycling' },
];

type ActivityContextType = {
  activities: Activity[];
  addActivity: (a: Activity) => void;
};

const ActivityContext = createContext<ActivityContextType>({
  activities: DEFAULT_ACTIVITIES,
  addActivity: () => {},
});

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(DEFAULT_ACTIVITIES);

  const addActivity = (a: Activity) => {
    setActivities(prev => {
      const exists = prev.find(x => x.name === a.name);
      if (exists) return prev;
      return [...prev, a];
    });
  };

  return (
    <ActivityContext.Provider value={{ activities, addActivity }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivities() {
  return useContext(ActivityContext);
}
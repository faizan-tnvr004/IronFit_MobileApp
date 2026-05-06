import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// --- Types ---
export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  heightCm: number;
  weightKg: number;
  age: number;
  gender: 'male' | 'female';
  fitnessGoal: string;
  dailyStepGoal: number;
  photoURL?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface WeightLog {
  id?: string;
  weight: number;
  date: string; // YYYY-MM-DD
  createdAt?: Timestamp;
}

export interface ActivityLog {
  id?: string;
  type: string; // Dynamic workout type
  durationMin: number;
  caloriesBurned: number;
  distance?: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  notes?: string;
  createdAt?: Timestamp;
}

export interface Workout {
  id?: string;
  name: string;
  desc: string;
  kcal: string; // display string like '~150 kcal/hour'
  icon: string;
  color: string;
  metScore: number;
  defaultDuration: string; // '30 min'
  defaultCalories: string; // '150 kcal'
  createdAt?: Timestamp;
  isCustom?: boolean; // Flag to indicate user-created custom workout
}

// --- Helper: Calorie Calculation ---
export const calculateCalories = (metScore: number, durationMin: number, weightKg: number): number => {
  const met = metScore || 5.0; // Fallback to moderate MET if missing
  const durationHours = durationMin / 60;
  // Formula: Calories = MET x weight(kg) x duration(hours)
  return Math.round(met * weightKg * durationHours);
};

// --- User Profile Functions ---

export const createUserProfile = async (uid: string, profileData: Omit<UserProfile, 'createdAt' | 'updatedAt'>) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...profileData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return { uid, ...docSnap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, fieldsToUpdate: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...fieldsToUpdate,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// --- Activity Functions ---

export const addActivityLog = async (uid: string, activityData: Omit<ActivityLog, 'createdAt'>) => {
  try {
    const activitiesRef = collection(db, 'users', uid, 'activities');
    const docRef = await addDoc(activitiesRef, {
      ...activityData,
      createdAt: Timestamp.now(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding activity log:", error);
    throw error;
  }
};

export const getActivitiesByDate = async (uid: string, date: string): Promise<ActivityLog[]> => {
  try {
    const activitiesRef = collection(db, 'users', uid, 'activities');
    const q = query(
      activitiesRef,
      where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);

    const logs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ActivityLog[];

    // Sort by createdAt desc in memory to avoid needing a composite index
    return logs.sort((a, b) => {
      const timeA = a.createdAt?.toMillis() || 0;
      const timeB = b.createdAt?.toMillis() || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching activities by date:", error);
    throw error;
  }
};

export const getAllActivities = async (uid: string): Promise<ActivityLog[]> => {
  try {
    const activitiesRef = collection(db, 'users', uid, 'activities');
    const q = query(activitiesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ActivityLog[];
  } catch (error) {
    console.error("Error fetching all activities:", error);
    throw error;
  }
};

export const getActivitiesInRange = async (uid: string, startDate: string, endDate: string): Promise<ActivityLog[]> => {
  try {
    const activitiesRef = collection(db, 'users', uid, 'activities');
    // Note: Firestore requires a composite index if you order by something other than the where clause field.
    // For simplicity, we just filter by date string (which naturally sorts)
    const q = query(
      activitiesRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ActivityLog[];
  } catch (error) {
    console.error("Error fetching activities in range:", error);
    throw error;
  }
};

// --- Weight Functions ---

export const addWeightLog = async (uid: string, weightData: Omit<WeightLog, 'createdAt'>) => {
  try {
    const weightRef = collection(db, 'users', uid, 'weightLogs');
    const docRef = await addDoc(weightRef, {
      ...weightData,
      createdAt: Timestamp.now(),
    });

    // Also update the current weight in the profile
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      weightKg: weightData.weight,
      updatedAt: Timestamp.now(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding weight log:", error);
    throw error;
  }
};

export const getWeightLogs = async (uid: string): Promise<WeightLog[]> => {
  try {
    const weightRef = collection(db, 'users', uid, 'weightLogs');
    const q = query(weightRef, orderBy('date', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as WeightLog[];
  } catch (error) {
    console.error("Error fetching weight logs:", error);
    throw error;
  }
};

// --- Workout (Admin) Functions ---

const CORE_WORKOUTS: Workout[] = [
  { id: 'def-walking', name: 'Walking', desc: 'Moderate pace walking', kcal: '~280 kcal/hour', icon: 'street-view', color: '#22C55E', metScore: 4.0, defaultDuration: '30 min', defaultCalories: '140 kcal' },
  { id: 'def-running', name: 'Running', desc: 'Continuous running', kcal: '~680 kcal/hour', icon: 'male', color: '#EF4444', metScore: 9.8, defaultDuration: '30 min', defaultCalories: '340 kcal' },
  { id: 'def-skipping', name: 'Skipping Rope', desc: 'High intensity cardio', kcal: '~860 kcal/hour', icon: 'heart', color: '#F97316', metScore: 12.3, defaultDuration: '15 min', defaultCalories: '215 kcal' },
  { id: 'def-jumping', name: 'Jumping Jacks', desc: 'Full body cardio', kcal: '~560 kcal/hour', icon: 'futbol-o', color: '#A855F7', metScore: 8.0, defaultDuration: '15 min', defaultCalories: '140 kcal' },
  { id: 'def-strength', name: 'Strength Workout', desc: 'Weight lifting/Bodyweight', kcal: '~420 kcal/hour', icon: 'bolt', color: '#3B82F6', metScore: 6.0, defaultDuration: '45 min', defaultCalories: '315 kcal' },
];

export const getWorkouts = async (): Promise<Workout[]> => {
  try {
    const workoutsRef = collection(db, 'workouts');
    const q = query(workoutsRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);

    const dbWorkouts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Workout[];

    return [...CORE_WORKOUTS, ...dbWorkouts];
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return CORE_WORKOUTS; // Fallback to core if DB fails
  }
};

export const addWorkout = async (workoutData: Omit<Workout, 'id' | 'createdAt'>) => {
  try {
    const workoutsRef = collection(db, 'workouts');
    const docRef = await addDoc(workoutsRef, {
      ...workoutData,
      createdAt: Timestamp.now(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding workout:", error);
    throw error;
  }
};

export const updateWorkout = async (workoutId: string, updates: Partial<Workout>) => {
  try {
    const workoutRef = doc(db, 'workouts', workoutId);
    await updateDoc(workoutRef, updates);
    return { success: true };
  } catch (error) {
    console.error("Error updating workout:", error);
    throw error;
  }
};

export const deleteWorkout = async (workoutId: string) => {
  try {
    const workoutRef = doc(db, 'workouts', workoutId);
    // Use deleteDoc from firestore, need to import it
    // Wait, let's use the updateDoc pattern or just import deleteDoc at top.
    // Instead of importing, we'll just require it.
    const { deleteDoc } = require('firebase/firestore');
    await deleteDoc(workoutRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting workout:", error);
    throw error;
  }
};

// --- Custom Workout Functions ---

export const getCustomWorkouts = async (uid: string): Promise<Workout[]> => {
  try {
    const workoutsRef = collection(db, 'users', uid, 'customWorkouts');
    const q = query(workoutsRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Workout[];
  } catch (error) {
    console.error("Error fetching custom workouts:", error);
    return []; // Return empty instead of throwing to avoid breaking the app if rules aren't set
  }
};

export const addCustomWorkout = async (uid: string, workoutData: Omit<Workout, 'id' | 'createdAt'>) => {
  try {
    const workoutsRef = collection(db, 'users', uid, 'customWorkouts');
    const docRef = await addDoc(workoutsRef, {
      ...workoutData,
      isCustom: true,
      createdAt: Timestamp.now(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding custom workout:", error);
    throw error;
  }
};

export const deleteCustomWorkout = async (uid: string, workoutId: string) => {
  try {
    const workoutRef = doc(db, 'users', uid, 'customWorkouts', workoutId);
    const { deleteDoc } = require('firebase/firestore');
    await deleteDoc(workoutRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting custom workout:", error);
    throw error;
  }
};

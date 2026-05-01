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
  type: 'Running' | 'Cycling' | 'Swimming' | 'Yoga' | 'Walking' | 'Dancing';
  durationMin: number;
  caloriesBurned: number;
  distance?: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  notes?: string;
  createdAt?: Timestamp;
}

// MET Values for calorie calculation
const MET_VALUES: Record<ActivityLog['type'], number> = {
  Walking: 3.5,
  Dancing: 5.5,
  Running: 9.8,
  Cycling: 7.5,
  Swimming: 8.0,
  Yoga: 3.0,
};

// --- Helper: Calorie Calculation ---
export const calculateCalories = (type: ActivityLog['type'], durationMin: number, weightKg: number): number => {
  const met = MET_VALUES[type] || 5.0; // Fallback to moderate MET if missing
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


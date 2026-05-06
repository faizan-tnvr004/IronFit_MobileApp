import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/context/AuthContext';
import { getActivitiesInRange } from '@/services/firestoreService';
import { getWorkoutSuggestion } from '@/services/geminiService';

const W = Dimensions.get('window').width;

const FOCUS_OPTIONS = ['Upper Body', 'Lower Body', 'Arms', 'Full Body', 'Cardio', 'Core'];
const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Pro'];
const DURATION_OPTIONS = ['15 min', '30 min', '45 min', '60 min'];
const LOCATION_OPTIONS = ['Home', 'Gym'];

export default function AICoachScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  
  // Selection Flow State
  const [step, setStep] = useState(0); 
  const [selections, setSelections] = useState({
    focus: '',
    level: '',
    duration: '',
    location: ''
  });

  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold });

  const fetchAISuggestion = async (manualPrompt?: string) => {
    if (!user) return;
    setIsLoading(true);
    setSuggestion('');
    
    try {
      let prompt = '';
      
      if (manualPrompt) {
        prompt = `${manualPrompt}. Please provide the workout plan in a very clean, structured format with clear headings. DO NOT use markdown symbols like ** or #. Use plain text and spacing only.`;
      } else if (selections.focus) {
        prompt = `Suggest a ${selections.level} ${selections.focus} workout for ${selections.duration} at ${selections.location}. Please provide a clear list of exercises with sets and reps. DO NOT use markdown symbols like ** or #. Use plain text and spacing for a clean look.`;
      } else {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 3);
        
        const lastActivities = await getActivitiesInRange(user.uid, start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
        
        if (lastActivities.length > 0) {
          const activityNames = lastActivities.map(a => a.type).join(', ');
          prompt = `In the last 3 days, I have done these workouts: ${activityNames}. Based on this, what should be my next workout to keep a balanced routine? Provide a clear workout plan with exercises, sets, and reps. DO NOT use markdown symbols like ** or #. Use plain text and spacing for a clean look.`;
        } else {
          setStep(1); 
          setIsLoading(false);
          return;
        }
      }
      
      const res = await getWorkoutSuggestion(prompt);
      setSuggestion(res);
      setStep(0);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to get suggestion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelection = (key: string, value: string) => {
    const newSelections = { ...selections, [key]: value };
    setSelections(newSelections);
    
    if (key === 'focus') setStep(2);
    else if (key === 'level') setStep(3);
    else if (key === 'duration') setStep(4);
    else if (key === 'location') {
      setStep(0);
      setIsLoading(true);
      const prompt = `Suggest a ${newSelections.level} ${newSelections.focus} workout for ${newSelections.duration} at ${newSelections.location}. Please provide a clear list of exercises with sets and reps. DO NOT use markdown symbols like ** or #. Use plain text and spacing for a clean look.`;
      getWorkoutSuggestion(prompt).then(res => {
        setSuggestion(res);
        setIsLoading(false);
      });
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#13131f" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={s.header}>
          <View style={s.titleRow}>
            <Text style={s.title}>AI Coach</Text>
            <View style={s.geminiBadge}>
              <FontAwesome name="bolt" size={12} color="#fff" />
              <Text style={s.geminiText}>Powered by Gemini</Text>
            </View>
          </View>
          <Text style={s.sub}>Your personalized fitness assistant</Text>
        </View>

        {!suggestion && step === 0 && !isLoading && (
          <View style={s.welcomeCard}>
            <View style={s.botIconWrap}>
              <FontAwesome name="magic" size={30} color="#F97316" />
            </View>
            <Text style={s.welcomeTitle}>Welcome back!</Text>
            <Text style={s.welcomeSub}>I'm ready to help you hit your goals today. What should we do?</Text>
            
            <TouchableOpacity style={s.mainBtn} onPress={() => fetchAISuggestion()}>
              <Text style={s.mainBtnText}>Analyze My Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.mainBtn, { backgroundColor: '#13131f', marginTop: 12, borderWidth: 1, borderColor: '#F97316' }]} onPress={() => setStep(1)}>
              <Text style={[s.mainBtnText, { color: '#F97316' }]}>Plan Custom Session</Text>
            </TouchableOpacity>

            <View style={s.divider} />
            
            <Text style={s.quickTitle}>Quick Suggestions</Text>
            <View style={s.quickGrid}>
              {[
                "Suggest me a beginner cardio workout",
                "Quick 15-min full body blast",
                "Advanced strength training plan"
              ].map(cmd => (
                <TouchableOpacity key={cmd} style={s.quickBtn} onPress={() => fetchAISuggestion(cmd)}>
                  <Text style={s.quickBtnText}>{cmd}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {isLoading && (
          <View style={s.loadingCard}>
            <ActivityIndicator size="large" color="#F97316" />
            <Text style={s.loadingText}>Gemini is thinking...</Text>
          </View>
        )}

        {step > 0 && !isLoading && (
          <View style={s.flowCard}>
            <View style={s.chatBubble}>
              <Text style={s.flowTitle}>
                {step === 1 ? "What do you want to work on today?" : 
                 step === 2 ? `Great! What is your fitness level for ${selections.focus}?` :
                 step === 3 ? "Understood. How much time do you have?" :
                 "Final question: Where are you working out?"}
              </Text>
            </View>
            
            <View style={s.optionsGrid}>
              {(step === 1 ? FOCUS_OPTIONS : 
                step === 2 ? LEVEL_OPTIONS :
                step === 3 ? DURATION_OPTIONS :
                LOCATION_OPTIONS).map(opt => (
                <TouchableOpacity 
                  key={opt} 
                  style={s.optionBtn} 
                  onPress={() => handleSelection(
                    step === 1 ? 'focus' : 
                    step === 2 ? 'level' : 
                    step === 3 ? 'duration' : 'location', 
                    opt
                  )}
                >
                  <Text style={s.optionBtnText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={s.backBtn} onPress={() => setStep(step === 1 ? 0 : step - 1)}>
              <Text style={s.backBtnText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {suggestion && !isLoading && (
          <View style={s.suggestionCard}>
            <View style={s.suggestionHeader}>
              <Text style={s.suggestionTitle}>Your Custom Routine</Text>
              <TouchableOpacity onPress={() => setSuggestion('')}>
                <FontAwesome name="refresh" size={18} color="#9999bb" />
              </TouchableOpacity>
            </View>
            <Text style={s.suggestionBody}>{suggestion}</Text>
            
            <TouchableOpacity style={s.resetBtn} onPress={() => setSuggestion('')}>
              <Text style={s.resetBtnText}>Start New Plan</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#13131f' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontFamily: 'Nunito_800ExtraBold', fontSize: 32, color: '#fff' },
  geminiBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F633', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6 },
  geminiText: { fontFamily: 'Nunito_700Bold', fontSize: 10, color: '#60A5FA' },
  sub: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#9999bb', marginTop: 2 },
  
  welcomeCard: { marginHorizontal: 16, backgroundColor: '#1e1e30', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#2e2e44' },
  botIconWrap: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F9731615', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#F9731633' },
  welcomeTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#fff', marginBottom: 12 },
  welcomeSub: { fontFamily: 'Nunito_400Regular', fontSize: 15, color: '#9999bb', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  mainBtn: { backgroundColor: '#F97316', width: '100%', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  mainBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: '#fff' },
  divider: { width: '100%', height: 1, backgroundColor: '#2e2e44', marginVertical: 30 },
  
  quickTitle: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#e0e0ff', alignSelf: 'flex-start', marginBottom: 16 },
  quickGrid: { width: '100%', gap: 10 },
  quickBtn: { backgroundColor: '#13131f', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#2e2e44' },
  quickBtnText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: '#c4c0ff' },

  loadingCard: { marginTop: 60, alignItems: 'center' },
  loadingText: { fontFamily: 'Nunito_600SemiBold', fontSize: 16, color: '#9999bb', marginTop: 20 },

  flowCard: { marginHorizontal: 16, backgroundColor: '#1e1e30', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#2e2e44' },
  chatBubble: { backgroundColor: '#3B82F610', padding: 18, borderRadius: 20, borderBottomLeftRadius: 4, marginBottom: 24, borderWidth: 1, borderColor: '#3B82F633' },
  flowTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 18, color: '#fff', textAlign: 'left' },
  optionsGrid: { gap: 12 },
  optionBtn: { backgroundColor: '#13131f', height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2e2e44' },
  optionBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#fff' },
  backBtn: { marginTop: 20, alignItems: 'center' },
  backBtnText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: '#9999bb' },

  suggestionCard: { marginHorizontal: 16, backgroundColor: '#1e1e30', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#2e2e44' },
  suggestionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  suggestionTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 20, color: '#fff' },
  suggestionBody: { fontFamily: 'Nunito_400Regular', fontSize: 16, color: '#e0e0ff', lineHeight: 26 },
  resetBtn: { marginTop: 30, backgroundColor: '#2d2b55', height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  resetBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#c4c0ff' },
});

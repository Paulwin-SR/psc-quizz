// App.js
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View, Platform, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Inject Ionicons font on Web using the exact CDN URL for v15.0.3 to prevent bundler/Vercel font mapping issues
if (Platform.OS === "web") {
  const iconFontStyles = `@font-face {
    font-family: 'ionicons';
    src: url('https://unpkg.com/@expo/vector-icons@15.0.3/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
  }`;
  const style = document.createElement("style");
  style.type = "text/css";
  if (style.styleSheet) {
    style.styleSheet.cssText = iconFontStyles;
  } else {
    style.appendChild(document.createTextNode(iconFontStyles));
  }
  document.head.appendChild(style);
}

import { AuthProvider, useAuth } from "./context/AuthContext";
import { COLORS } from "./theme";

import AuthScreen from "./screens/AuthScreen";
import HomeScreen from "./screens/HomeScreen";
import QuizSetupScreen from "./screens/QuizSetupScreen";
import QuizScreen from "./screens/QuizScreen";
import ResultScreen from "./screens/ResultScreen";
import ScoreboardScreen from "./screens/ScoreboardScreen";
import LearnScreen from "./screens/LearnScreen";
import TopicDetailScreen from "./screens/TopicDetailScreen";
import NotesScreen from "./screens/NotesScreen";
import OnlineLobbyScreen from "./screens/OnlineLobbyScreen";
import OnlineQuizScreen from "./screens/OnlineQuizScreen";
import SubscriptionScreen from "./screens/SubscriptionScreen";

// New Screens
import MockTestScreen from "./screens/MockTestScreen";
import VideoClassesScreen from "./screens/VideoClassesScreen";
import CurrentAffairsScreen from "./screens/CurrentAffairsScreen";
import RankingsScreen from "./screens/RankingsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AnimatedBackground from "./components/AnimatedBackground";
import ClickEffectWrapper from "./components/ClickEffect";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: { paddingBottom: 5, paddingTop: 5, height: 60, backgroundColor: COLORS.card },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "HomeTab") iconName = focused ? "home" : "home-outline";
          else if (route.name === "MockTestTab") iconName = focused ? "time" : "time-outline";
          else if (route.name === "ClassesTab") iconName = focused ? "play-circle" : "play-circle-outline";
          else if (route.name === "RankingsTab") iconName = focused ? "medal" : "medal-outline";
          else if (route.name === "MoreTab") iconName = focused ? "grid" : "grid-outline";
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Home", headerShown: false }} />
      <Tab.Screen name="MockTestTab" component={MockTestScreen} options={{ title: "Mock Tests" }} />
      <Tab.Screen name="ClassesTab" component={VideoClassesScreen} options={{ title: "Classes" }} />
      <Tab.Screen name="RankingsTab" component={RankingsScreen} options={{ title: "State Rank" }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const linking = {
    prefixes: [],
    config: {
      screens: {
        Auth: 'auth',
        MainTabs: {
          screens: {
            HomeTab: '',
            MockTestTab: 'mock-tests',
            ClassesTab: 'classes',
            RankingsTab: 'rankings'
          }
        },
        QuizSetup: 'setup',
        Quiz: 'quiz',
        Result: 'result',
        Scoreboard: 'scoreboard',
        Learn: 'learn',
        TopicDetail: 'topic',
        Notes: 'notes',
        OnlineLobby: 'lobby',
        OnlineQuiz: 'online-quiz',
        CurrentAffairs: 'current-affairs',
        Profile: 'profile',
      }
    }
  };

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'transparent',
    },
  };

  return (
    <NavigationContainer linking={linking} theme={navTheme}>
      <Stack.Navigator 
        screenOptions={({ navigation }) => ({ 
          headerStyle: { backgroundColor: COLORS.primary }, 
          headerTintColor: "#fff", 
          headerTitleStyle: { fontWeight: "700" },
          headerLeft: ({ canGoBack }) => {
            if (!canGoBack) return null;
            return (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ paddingHorizontal: 10, paddingVertical: 5, marginLeft: Platform.OS === 'web' ? 0 : -10, marginRight: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            );
          }
        })}
      >
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            
            {/* Deep Screens */}
            <Stack.Screen name="QuizSetup" component={QuizSetupScreen} options={{ title: "New Match" }} />
            <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: "Quiz Battle" }} />
            <Stack.Screen name="Result" component={ResultScreen} options={{ title: "Match Result" }} />
            <Stack.Screen name="Scoreboard" component={ScoreboardScreen} options={{ title: "Scoreboard" }} />
            <Stack.Screen name="Learn" component={LearnScreen} options={{ title: "Learn Topics" }} />
            <Stack.Screen name="TopicDetail" component={TopicDetailScreen} options={{ title: "Topic" }} />
            <Stack.Screen name="Notes" component={NotesScreen} options={{ title: "My Notes" }} />
            <Stack.Screen name="OnlineLobby" component={OnlineLobbyScreen} options={{ title: "Multiplayer Lobby" }} />
            <Stack.Screen name="OnlineQuiz" component={OnlineQuizScreen} options={{ title: "Online Match" }} />
            <Stack.Screen name="CurrentAffairs" component={CurrentAffairsScreen} options={{ title: "Current Affairs" }} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ title: "Go Premium" }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "My Profile" }} />
          </>
        )}
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AnimatedBackground>
      <ClickEffectWrapper>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ClickEffectWrapper>
    </AnimatedBackground>
  );
}

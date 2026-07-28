// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import {
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInAnonymously,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [fallbackUser, setFallbackUser] = useState(null);

  // Use the app's custom scheme (defined in app.json -> "scheme") so the
  // redirect URI is stable across tunnel/LAN restarts, instead of relying
  // on Expo's dynamic exp:// tunnel address.
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "pscquizarena" });

  // PASTE YOUR REAL CLIENT IDS HERE — copy fresh from Google Cloud Console,
  // don't reuse anything that looks like it has extra/duplicated characters.
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: "5803219821-h04kfkb760mhr5u86gnrr72cq24viift.apps.googleusercontent.com",
    iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
    androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
    webClientId: "5803219821-h04kfkb760mhr5u86gnrr72cq24viift.apps.googleusercontent.com",
    redirectUri,
    extraParams: {
      prompt: "select_account",
    },
  });


  useEffect(() => {
    console.log("Redirect URI in use:", redirectUri);
  }, []);

  useEffect(() => {
    if (!auth) {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("psc_guest");
        if (stored) {
           setFallbackUser(JSON.parse(stored));
           setUser(JSON.parse(stored));
        }
      }
      setInitializing(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const ref = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(ref);
          if (!snap.exists()) {
            await setDoc(ref, {
              displayName: firebaseUser.displayName || "Guest Player",
              email: firebaseUser.email || "guest@example.com",
              photoURL: firebaseUser.photoURL || null,
              createdAt: serverTimestamp(),
              totalWins: 0,
              totalMatches: 0,
              bestScore: 0,
              totalPoints: 0,
            });
          }
        } catch (e) {
          console.warn("Could not create/get user profile in firestore:", e.message);
        }
        setUser(firebaseUser);
        setInitializing(false);
      } else {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("psc_guest");
          if (stored) {
             setFallbackUser(JSON.parse(stored));
             setUser(JSON.parse(stored));
          } else {
             setUser(null);
          }
        } else {
          setUser(null);
        }
        setInitializing(false);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (response) {
      console.log("Google auth response:", JSON.stringify(response, null, 2));
    }
    if (response?.type === "success" && auth) {
      const { id_token, access_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token, access_token);
      signInWithCredential(auth, credential)
        .then(async (result) => {
          const u = result.user;
          const ref = doc(db, "users", u.uid);
          const snap = await getDoc(ref);
          if (!snap.exists()) {
            await setDoc(ref, {
              displayName: u.displayName || "Player",
              email: u.email,
              photoURL: u.photoURL || null,
              createdAt: serverTimestamp(),
              totalWins: 0,
              totalMatches: 0,
              bestScore: 0,
              totalPoints: 0,
            });
          }
        })
        .catch((err) => {
          console.error("signInWithCredential failed:", err.code, err.message);
        });
    }
  }, [response]);

  const signInAsGuest = async () => {
    const isWeb = typeof window !== 'undefined';
    if (auth && !isWeb) {
      try {
        await signInAnonymously(auth);
        return;
      } catch (err) {
        console.warn("Firebase signInAnonymously failed, falling back to local mock user:", err.message);
      }
    }
    const mockGuest = {
      uid: "guest-mock-id",
      displayName: "Guest Player",
      email: "guest@example.com",
      photoURL: null,
      isGuest: true,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("psc_guest", JSON.stringify(mockGuest));
    }
    setFallbackUser(mockGuest);
    setUser(mockGuest);
  };

  const signInWithGoogle = () => promptAsync();

  const signOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("psc_guest");
    }
    if (user?.isGuest || !auth) {
      setFallbackUser(null);
      setUser(null);
    } else {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.warn("Firebase signOut failed, clearing local user state:", err.message);
        setFallbackUser(null);
        setUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        initializing,
        signInWithGoogle,
        signInAsGuest,
        signOut,
        googleRequestReady: !!request,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);




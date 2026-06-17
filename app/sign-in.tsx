import { supabase } from "@/lib/supabase";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../ctx";

export default function Login() {
  const { signIn } = useSession() as any;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginAction = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Peringatan", "Username dan password wajib diisi.");
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("username", username.trim())
        .eq("password", password.trim())
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        Alert.alert("Login Gagal", "Username atau password salah.");
        console.log("Login error:", error?.message);
        return;
      }

      signIn(data);
      router.replace("/admin");
    } catch (error) {
      console.log("Login action error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="warehouse" size={48} color="white" />
            </View>

            <Text style={styles.appName}>POSKO Mobile</Text>

            <Text style={styles.appDesc}>
              Sistem pendataan bantuan masuk, distribusi, stok, donatur, dan
              penerima.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Masuk Akun</Text>

            <Text style={styles.subtitle}>
              Gunakan akun petugas untuk mengakses sistem POSKO.
            </Text>

            <Text style={styles.label}>Username</Text>

            <View style={styles.inputBox}>
              <FontAwesome5 name="user" size={16} color="#94a3b8" />

              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Masukkan username"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <Text style={styles.label}>Password</Text>

            <View style={styles.inputBox}>
              <FontAwesome5 name="lock" size={16} color="#94a3b8" />

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Masukkan password"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />

              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off" : "eye"}
                  size={23}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={loginAction}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <FontAwesome5 name="sign-in-alt" size={17} color="white" />
                  <Text style={styles.buttonText}>Masuk</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>
            POSKO Mobile • Pendataan Bantuan Bencana
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const cardShadow = {
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 5,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 22,
    paddingTop: 35,
    paddingBottom: 35,
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    marginBottom: 22,
  },
  logoCircle: {
    width: 92,
    height: 92,
    borderRadius: 32,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    ...cardShadow,
  },
  appName: {
    color: "#0f172a",
    fontSize: 31,
    fontWeight: "900",
  },
  appDesc: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 9,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 14,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 22,
    ...cardShadow,
  },
  title: {
    color: "#0f172a",
    fontSize: 24,
    fontWeight: "900",
  },
  subtitle: {
    color: "#64748b",
    marginTop: 7,
    marginBottom: 22,
    lineHeight: 19,
  },
  label: {
    color: "#0f172a",
    fontWeight: "800",
    marginBottom: 8,
  },
  inputBox: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 15,
    marginBottom: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    color: "#0f172a",
    height: "100%",
  },
  button: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
  },
  footerText: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 24,
    fontSize: 12,
    fontWeight: "700",
  },
});

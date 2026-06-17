import { supabase } from "@/lib/supabase";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
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

export default function TambahPenerima() {
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [saving, setSaving] = useState(false);

  const simpan = async () => {
    if (!nama.trim()) {
      Alert.alert("Peringatan", "Nama penerima wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.from("penerima").insert({
        nama: nama.trim(),
        no_hp: noHp.trim() || null,
        alamat: alamat.trim() || null,
        keterangan: keterangan.trim() || null,
      });

      if (error) {
        Alert.alert("Gagal", error.message || "Gagal menambah penerima.");
        return;
      }

      Alert.alert("Berhasil", "Data penerima berhasil ditambahkan.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.log("Tambah penerima error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <FontAwesome5 name="arrow-left" size={18} color="white" />
            </TouchableOpacity>

            <Text style={styles.small}>Form Penerima</Text>
            <Text style={styles.title}>Tambah Penerima</Text>
            <Text style={styles.subtitle}>
              Tambahkan data penerima atau lokasi tujuan bantuan.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Nama Penerima</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Posko Desa Sukamaju"
              value={nama}
              onChangeText={setNama}
              editable={!saving}
            />

            <Text style={styles.label}>Nomor HP</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 08123456789"
              value={noHp}
              onChangeText={setNoHp}
              keyboardType="phone-pad"
              editable={!saving}
            />

            <Text style={styles.label}>Alamat</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Alamat penerima/lokasi tujuan"
              value={alamat}
              onChangeText={setAlamat}
              multiline
              editable={!saving}
            />

            <Text style={styles.label}>Keterangan</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Keterangan tambahan"
              value={keterangan}
              onChangeText={setKeterangan}
              multiline
              editable={!saving}
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.disabled]}
              onPress={simpan}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveText}>Simpan Penerima</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    backgroundColor: "#0ea5e9",
    padding: 25,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 22,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  small: {
    color: "#dbeafe",
    fontSize: 15,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 5,
  },
  subtitle: {
    color: "#e0f2fe",
    marginTop: 6,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: "white",
    borderRadius: 22,
    padding: 20,
    marginBottom: 30,
    ...cardShadow,
  },
  label: {
    color: "#0f172a",
    fontWeight: "800",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 14,
    padding: 15,
    marginBottom: 18,
    backgroundColor: "#f8fafc",
    color: "#0f172a",
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  saveBtn: {
    backgroundColor: "#0ea5e9",
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 4,
  },
  disabled: {
    opacity: 0.7,
  },
  saveText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
  },
  cancelBtn: {
    marginTop: 14,
    alignItems: "center",
  },
  cancelText: {
    color: "#0ea5e9",
    fontWeight: "800",
  },
});

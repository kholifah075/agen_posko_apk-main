import { supabase } from "@/lib/supabase";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditPenerima() {
  const { penerimaId } = useLocalSearchParams<{ penerimaId: string }>();

  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getData = useCallback(async () => {
    if (!penerimaId) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("penerima")
        .select("*")
        .eq("id", Number(penerimaId))
        .maybeSingle();

      if (error) {
        Alert.alert("Gagal", error.message || "Gagal memuat data.");
        return;
      }

      if (!data) {
        Alert.alert("Tidak ditemukan", "Data penerima tidak ditemukan.", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
        return;
      }

      setNama(data.nama || "");
      setNoHp(data.no_hp || "");
      setAlamat(data.alamat || "");
      setKeterangan(data.keterangan || "");
    } catch (error) {
      console.log("Load penerima error:", error);
    } finally {
      setLoading(false);
    }
  }, [penerimaId]);

  useEffect(() => {
    getData();
  }, [getData]);

  const simpan = async () => {
    if (!nama.trim()) {
      Alert.alert("Peringatan", "Nama penerima wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from("penerima")
        .update({
          nama: nama.trim(),
          no_hp: noHp.trim() || null,
          alamat: alamat.trim() || null,
          keterangan: keterangan.trim() || null,
        })
        .eq("id", Number(penerimaId));

      if (error) {
        Alert.alert("Gagal", error.message || "Gagal update penerima.");
        return;
      }

      Alert.alert("Berhasil", "Data penerima berhasil diperbarui.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.log("Update penerima error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Memuat data penerima...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <SafeAreaView style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <FontAwesome5 name="arrow-left" size={18} color="white" />
            </TouchableOpacity>

            <Text style={styles.small}>Form Penerima</Text>
            <Text style={styles.title}>Edit Penerima</Text>
            <Text style={styles.subtitle}>
              Perbarui data penerima atau lokasi tujuan bantuan.
            </Text>
          </SafeAreaView>

          <SafeAreaView style={styles.card}>
            <Text style={styles.label}>Nama Penerima</Text>
            <TextInput
              style={styles.input}
              placeholder="Nama penerima"
              value={nama}
              onChangeText={setNama}
              editable={!saving}
            />

            <Text style={styles.label}>Nomor HP</Text>
            <TextInput
              style={styles.input}
              placeholder="Nomor HP"
              value={noHp}
              onChangeText={setNoHp}
              keyboardType="phone-pad"
              editable={!saving}
            />

            <Text style={styles.label}>Alamat</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Alamat"
              value={alamat}
              onChangeText={setAlamat}
              multiline
              editable={!saving}
            />

            <Text style={styles.label}>Keterangan</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Keterangan"
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
                <Text style={styles.saveText}>Simpan Perubahan</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
          </SafeAreaView>
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
  loading: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#64748b",
    marginTop: 12,
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

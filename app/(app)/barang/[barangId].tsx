import { supabase } from "@/lib/supabase";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Kategori = {
  id: number;
  nama: string;
};

type SelectOption = {
  label: string;
  value: string | number;
};

function SelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  placeholder: string;
  value: string | number;
  options: SelectOption[];
  onChange: (value: string | number) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const selected = options.find((item) => String(item.value) === String(value));

  return (
    <>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={[styles.selectBox, disabled && styles.disabledBox]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.85}
      >
        <Text style={selected ? styles.selectValue : styles.selectPlaceholder}>
          {selected?.label || placeholder}
        </Text>

        <FontAwesome5 name="chevron-down" size={14} color="#94a3b8" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>

              <TouchableOpacity onPress={() => setOpen(false)}>
                <FontAwesome5 name="times" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {options.length === 0 ? (
                <View style={styles.emptyOption}>
                  <Text style={styles.emptyOptionText}>Belum ada kategori</Text>
                </View>
              ) : (
                options.map((item) => {
                  const active = String(item.value) === String(value);

                  return (
                    <TouchableOpacity
                      key={String(item.value)}
                      style={[styles.optionItem, active && styles.optionActive]}
                      onPress={() => {
                        onChange(item.value);
                        setOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.optionLabel,
                          active && styles.optionLabelActive,
                        ]}
                      >
                        {item.label}
                      </Text>

                      {active ? (
                        <FontAwesome5 name="check" size={15} color="#0ea5e9" />
                      ) : null}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function EditBarang() {
  const { barangId } = useLocalSearchParams<{ barangId: string }>();

  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [kategoriId, setKategoriId] = useState<string | number>("");
  const [nama, setNama] = useState("");
  const [satuan, setSatuan] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const kategoriOptions = useMemo<SelectOption[]>(() => {
    return kategori.map((item) => ({
      label: item.nama,
      value: item.id,
    }));
  }, [kategori]);

  const fetchData = useCallback(async () => {
    if (!barangId) return;

    try {
      setLoading(true);

      const { data: kategoriData, error: kategoriError } = await supabase
        .from("kategori")
        .select("*")
        .order("nama", { ascending: true });

      if (kategoriError) {
        console.log("Kategori error:", kategoriError.message);
      }

      setKategori(kategoriData || []);

      const { data: barangData, error: barangError } = await supabase
        .from("barang")
        .select("*")
        .eq("id", Number(barangId))
        .maybeSingle();

      if (barangError) {
        Alert.alert("Gagal", barangError.message || "Gagal memuat barang.");
        return;
      }

      if (!barangData) {
        Alert.alert("Tidak ditemukan", "Data barang tidak ditemukan.", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
        return;
      }

      setKategoriId(barangData.kategori_id || "");
      setNama(barangData.nama || "");
      setSatuan(barangData.satuan || "");
    } catch (error) {
      console.log("Fetch edit barang error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat memuat data barang.");
    } finally {
      setLoading(false);
    }
  }, [barangId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const simpan = async () => {
    if (!kategoriId) {
      Alert.alert("Peringatan", "Kategori wajib dipilih.");
      return;
    }

    if (!nama.trim()) {
      Alert.alert("Peringatan", "Nama barang wajib diisi.");
      return;
    }

    if (!satuan.trim()) {
      Alert.alert("Peringatan", "Satuan barang wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from("barang")
        .update({
          kategori_id: Number(kategoriId),
          nama: nama.trim(),
          satuan: satuan.trim(),
        })
        .eq("id", Number(barangId));

      if (error) {
        Alert.alert("Gagal", error.message || "Gagal menyimpan perubahan.");
        return;
      }

      Alert.alert("Berhasil", "Data barang berhasil diperbarui.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.log("Update barang error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={styles.loading}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Memuat data barang...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <FontAwesome5 name="arrow-left" size={20} color="white" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Edit Barang</Text>
            <Text style={styles.headerSubtitle}>Perbarui data barang bantuan</Text>
          </View>

          <View style={styles.card}>
            <SelectField
              label="Kategori"
              placeholder="Pilih kategori"
              value={kategoriId}
              options={kategoriOptions}
              onChange={setKategoriId}
              disabled={saving}
            />

            <Text style={styles.label}>Nama Barang</Text>
            <TextInput
              placeholder="Contoh: Beras"
              placeholderTextColor="#94a3b8"
              value={nama}
              onChangeText={setNama}
              style={styles.textInput}
              editable={!saving}
            />

            <Text style={styles.label}>Satuan</Text>
            <TextInput
              placeholder="Contoh: pcs, kg, box"
              placeholderTextColor="#94a3b8"
              value={satuan}
              onChangeText={setSatuan}
              style={styles.textInput}
              editable={!saving}
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.disabledButton]}
              onPress={simpan}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <FontAwesome5 name="save" size={18} color="white" />
                  <Text style={styles.saveText}>Simpan Perubahan</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => router.back()}
              disabled={saving}
            >
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
  content: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 25,
    paddingTop: 28,
    paddingBottom: 34,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 52,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },
  headerTitle: {
    color: "white",
    fontSize: 30,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#e0f2fe",
    marginTop: 8,
    fontSize: 15,
  },
  card: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 26,
    padding: 20,
    ...cardShadow,
  },
  label: {
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "900",
    marginBottom: 8,
  },
  selectBox: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe3ea",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 15,
    paddingVertical: 13,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  disabledBox: {
    opacity: 0.7,
  },
  selectValue: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "800",
  },
  selectPlaceholder: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "700",
  },
  textInput: {
    height: 56,
    borderWidth: 1,
    borderColor: "#dbe3ea",
    borderRadius: 16,
    paddingHorizontal: 15,
    marginBottom: 18,
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontWeight: "700",
  },
  saveBtn: {
    backgroundColor: "#0ea5e9",
    padding: 17,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveText: {
    color: "white",
    fontWeight: "900",
    fontSize: 15,
  },
  cancelBtn: {
    marginTop: 15,
    alignItems: "center",
  },
  cancelText: {
    color: "#0ea5e9",
    fontWeight: "900",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "900",
  },
  optionItem: {
    padding: 15,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: "#f8fafc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionActive: {
    backgroundColor: "#e0f2fe",
  },
  optionLabel: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "800",
  },
  optionLabelActive: {
    color: "#0369a1",
  },
  emptyOption: {
    padding: 30,
    alignItems: "center",
  },
  emptyOptionText: {
    color: "#64748b",
    fontWeight: "800",
  },
});

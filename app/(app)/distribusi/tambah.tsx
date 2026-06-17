import { supabase } from "@/lib/supabase";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Penerima = {
  id: number;
  nama: string;
};

type Barang = {
  id: number;
  nama: string;
  satuan?: string | null;
  kategori_id?: number | null;
  kategori?: {
    id?: number;
    nama?: string | null;
    stok?: number | null;
  } | null;
};

type ListBarangItem = {
  barangSelected: string | number;
  stok: string;
};

const emptyBarang: ListBarangItem = {
  barangSelected: "",
  stok: "",
};

export default function TambahDistribusi() {
  const [penerima, setPenerima] = useState<Penerima[]>([]);
  const [selectedPenerima, setSelectedPenerima] = useState<string | number>("");

  const [barang, setBarang] = useState<Barang[]>([]);
  const [listBarang, setListBarang] = useState<ListBarangItem[]>([
    { ...emptyBarang },
  ]);

  const [keterangan, setKeterangan] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const updateListBarang = (
    index: number,
    key: keyof ListBarangItem,
    value: string | number
  ) => {
    const newList = [...listBarang];

    newList[index] = {
      ...newList[index],
      [key]: value,
    };

    setListBarang(newList);
  };

  const tambahIsianBarang = () => {
    setListBarang([
      ...listBarang,
      {
        ...emptyBarang,
      },
    ]);
  };

  const hapusBarang = (index: number) => {
    if (listBarang.length === 1) return;

    const newList = listBarang.filter((_, i) => i !== index);
    setListBarang(newList);
  };

  const fetchPenerima = useCallback(async () => {
    const { data, error } = await supabase
      .from("penerima")
      .select("*")
      .order("nama", { ascending: true });

    if (error) {
      console.log("Fetch penerima error:", error.message);
      return;
    }

    setPenerima(data || []);
  }, []);

  const fetchBarang = useCallback(async () => {
    const { data, error } = await supabase
      .from("barang")
      .select(`
        *,
        kategori:kategori_id (
          id,
          nama,
          stok
        )
      `)
      .order("nama", { ascending: true });

    if (error) {
      console.log("Fetch barang error:", error.message);
      return;
    }

    setBarang(data || []);
  }, []);

  const fetchMasterData = useCallback(async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchPenerima(), fetchBarang()]);
    } catch (error) {
      console.log("Fetch master distribusi error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPenerima, fetchBarang]);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  const getSelectedBarang = (id: string | number) => {
    return barang.find((item) => String(item.id) === String(id));
  };

  const validateForm = () => {
    if (!selectedPenerima) {
      Alert.alert("Peringatan", "Pilih penerima terlebih dahulu.");
      return false;
    }

    const barangTerpilih = new Set<string>();

    for (let i = 0; i < listBarang.length; i++) {
      const item = listBarang[i];
      const jumlah = Number(item.stok);

      if (!item.barangSelected) {
        Alert.alert("Peringatan", `Pilih barang pada Barang ${i + 1}.`);
        return false;
      }

      if (barangTerpilih.has(String(item.barangSelected))) {
        Alert.alert(
          "Peringatan",
          `Barang pada isian Barang ${i + 1} sudah dipilih sebelumnya.`
        );
        return false;
      }

      barangTerpilih.add(String(item.barangSelected));

      if (!item.stok || Number.isNaN(jumlah) || jumlah <= 0) {
        Alert.alert(
          "Peringatan",
          `Jumlah pada Barang ${i + 1} harus lebih dari 0.`
        );
        return false;
      }

      const selectedBarang = getSelectedBarang(item.barangSelected);
      const stokKategori = Number(selectedBarang?.kategori?.stok || 0);

      if (!selectedBarang) {
        Alert.alert("Peringatan", `Barang ${i + 1} tidak ditemukan.`);
        return false;
      }

      if (jumlah > stokKategori) {
        Alert.alert(
          "Stok Tidak Cukup",
          `Stok kategori ${selectedBarang.kategori?.nama || "-"} hanya ${stokKategori}.`
        );
        return false;
      }
    }

    return true;
  };

  const simpan = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      const { data: outgoingData, error: outgoingError } = await supabase
        .from("outgoing")
        .insert({
          penerima_id: Number(selectedPenerima),
          status: 2,
          keterangan: keterangan.trim() || null,
        })
        .select()
        .single();

      if (outgoingError || !outgoingData) {
        Alert.alert(
          "Gagal",
          outgoingError?.message || "Gagal membuat data distribusi."
        );
        return;
      }

      const detailPayload = listBarang.map((item) => ({
        outgoing_id: outgoingData.id,
        barang_id: Number(item.barangSelected),
        stok: Number(item.stok),
      }));

      const { error: detailError } = await supabase
        .from("outgoing_detail")
        .insert(detailPayload);

      if (detailError) {
        Alert.alert(
          "Gagal",
          detailError.message || "Gagal menyimpan detail distribusi."
        );
        return;
      }

      for (const item of listBarang) {
        const selectedBarang = getSelectedBarang(item.barangSelected);
        const jumlahKeluar = Number(item.stok);

        if (selectedBarang?.kategori?.id) {
          const stokLama = Number(selectedBarang.kategori.stok || 0);
          const stokBaru = Math.max(stokLama - jumlahKeluar, 0);

          const { error: updateStokError } = await supabase
            .from("kategori")
            .update({
              stok: stokBaru,
            })
            .eq("id", selectedBarang.kategori.id);

          if (updateStokError) {
            Alert.alert(
              "Peringatan",
              updateStokError.message ||
                "Distribusi tersimpan, tetapi stok kategori gagal diperbarui."
            );
            return;
          }
        }
      }

      Alert.alert("Berhasil", "Distribusi bantuan berhasil disimpan.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.log("Simpan distribusi error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan distribusi.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Memuat data distribusi...</Text>
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
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <FontAwesome5 name="arrow-left" size={18} color="white" />
            </TouchableOpacity>

            <Text style={styles.small}>Transaksi Bantuan</Text>
            <Text style={styles.headerTitle}>Distribusi Bantuan</Text>
            <Text style={styles.headerSubtitle}>
              Catat bantuan keluar ke penerima dan kurangi stok otomatis.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informasi Penerima</Text>

            <Text style={styles.label}>Pilih Penerima</Text>

            <View style={styles.inputBox}>
              <Picker
                selectedValue={selectedPenerima}
                onValueChange={setSelectedPenerima}
              >
                <Picker.Item label="Pilih Penerima" value="" />

                {penerima.map((item) => (
                  <Picker.Item key={item.id} label={item.nama} value={item.id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Keterangan</Text>

            <TextInput
              placeholder="Contoh: Distribusi bantuan ke Posko Utama"
              value={keterangan}
              onChangeText={setKeterangan}
              style={[styles.textInput, styles.textArea]}
              multiline
              editable={!isSaving}
            />
          </View>

          {listBarang.map((item, index) => {
            const selectedBarang = getSelectedBarang(item.barangSelected);

            return (
              <View key={index} style={styles.card}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle}>Barang {index + 1}</Text>

                  {listBarang.length > 1 && (
                    <TouchableOpacity onPress={() => hapusBarang(index)}>
                      <FontAwesome5 name="trash" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.label}>Pilih Barang</Text>

                <View style={styles.inputBox}>
                  <Picker
                    selectedValue={item.barangSelected}
                    onValueChange={(value) =>
                      updateListBarang(index, "barangSelected", value)
                    }
                  >
                    <Picker.Item label="Pilih Barang" value="" />

                    {barang.map((b) => (
                      <Picker.Item
                        key={b.id}
                        label={`${b.nama} ${b.satuan ? `(${b.satuan})` : ""}`}
                        value={b.id}
                      />
                    ))}
                  </Picker>
                </View>

                {selectedBarang ? (
                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      Kategori: {selectedBarang.kategori?.nama || "-"}
                    </Text>

                    <Text style={styles.infoText}>
                      Stok kategori: {selectedBarang.kategori?.stok || 0}
                    </Text>

                    <Text style={styles.infoText}>
                      Satuan: {selectedBarang.satuan || "-"}
                    </Text>
                  </View>
                ) : null}

                <Text style={styles.label}>Jumlah Distribusi</Text>

                <TextInput
                  placeholder="Masukkan jumlah distribusi"
                  keyboardType="numeric"
                  value={item.stok}
                  onChangeText={(value) =>
                    updateListBarang(index, "stok", value)
                  }
                  style={styles.textInput}
                  editable={!isSaving}
                />
              </View>
            );
          })}

          <TouchableOpacity
            style={styles.addButton}
            onPress={tambahIsianBarang}
            disabled={isSaving}
          >
            <FontAwesome5 name="plus" size={16} color="white" />
            <Text style={styles.btnText}>Tambah Barang</Text>
          </TouchableOpacity>

          <View style={styles.bottomButton}>
            <TouchableOpacity
              style={[styles.saveBtn, isSaving && styles.buttonDisabled]}
              onPress={simpan}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <FontAwesome5 name="save" size={18} color="white" />
                  <Text style={styles.btnText}>Simpan Distribusi</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => router.back()}
              disabled={isSaving}
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
  header: {
    backgroundColor: "#0ea5e9",
    padding: 25,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 20,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  small: {
    color: "#dbeafe",
    fontSize: 15,
  },
  headerTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 5,
  },
  headerSubtitle: {
    color: "#e0f2fe",
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 22,
    padding: 20,
    ...cardShadow,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 14,
  },
  label: {
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "800",
    marginBottom: 8,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 14,
    marginBottom: 18,
    overflow: "hidden",
    backgroundColor: "#f8fafc",
  },
  infoBox: {
    backgroundColor: "#e0f2fe",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    color: "#0369a1",
    fontSize: 13,
    marginBottom: 4,
  },
  textInput: {
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
  addButton: {
    marginHorizontal: 20,
    backgroundColor: "#0369a1",
    borderRadius: 16,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  bottomButton: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  saveBtn: {
    backgroundColor: "#0ea5e9",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  cancelBtn: {
    marginTop: 14,
    alignItems: "center",
  },
  cancelText: {
    color: "#0ea5e9",
    fontWeight: "800",
  },
  btnText: {
    color: "white",
    fontWeight: "900",
    fontSize: 15,
  },
});

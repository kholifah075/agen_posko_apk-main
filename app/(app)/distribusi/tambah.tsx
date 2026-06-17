import { supabase } from "@/lib/supabase";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
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

type SelectOption = {
  label: string;
  value: string | number;
};

const emptyBarang: ListBarangItem = {
  barangSelected: "",
  stok: "",
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
                  <Text style={styles.emptyOptionText}>Data belum tersedia</Text>
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

  const penerimaOptions = useMemo<SelectOption[]>(() => {
    return penerima.map((item) => ({
      label: item.nama,
      value: item.id,
    }));
  }, [penerima]);

  const barangOptions = useMemo<SelectOption[]>(() => {
    return barang.map((item) => ({
      label: `${item.nama} - ${item.kategori?.nama || "-"} (${item.satuan || "-"})`,
      value: item.id,
    }));
  }, [barang]);

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
    setListBarang([...listBarang, { ...emptyBarang }]);
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
    const kategoriPemakaian = new Map<
      number,
      {
        nama: string;
        stok: number;
        totalKeluar: number;
      }
    >();

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

      if (!selectedBarang) {
        Alert.alert("Peringatan", `Barang ${i + 1} tidak ditemukan.`);
        return false;
      }

      const kategoriId = selectedBarang.kategori?.id;

      if (!kategoriId) {
        Alert.alert(
          "Peringatan",
          `Kategori pada Barang ${i + 1} tidak ditemukan.`
        );
        return false;
      }

      const stokKategori = Number(selectedBarang.kategori?.stok || 0);
      const current = kategoriPemakaian.get(kategoriId);

      kategoriPemakaian.set(kategoriId, {
        nama: selectedBarang.kategori?.nama || "-",
        stok: stokKategori,
        totalKeluar: (current?.totalKeluar || 0) + jumlah,
      });
    }

    for (const [, kategori] of kategoriPemakaian) {
      if (kategori.totalKeluar > kategori.stok) {
        Alert.alert(
          "Stok Tidak Cukup",
          `Stok kategori ${kategori.nama} hanya ${kategori.stok}, sedangkan total distribusi ${kategori.totalKeluar}.`
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

      const kategoriUpdateMap = new Map<
        number,
        {
          stokBaru: number;
        }
      >();

      for (const item of listBarang) {
        const selectedBarang = getSelectedBarang(item.barangSelected);
        const jumlahKeluar = Number(item.stok);
        const kategoriId = selectedBarang?.kategori?.id;

        if (kategoriId) {
          const stokAwal = kategoriUpdateMap.has(kategoriId)
            ? Number(kategoriUpdateMap.get(kategoriId)?.stokBaru || 0)
            : Number(selectedBarang?.kategori?.stok || 0);

          kategoriUpdateMap.set(kategoriId, {
            stokBaru: Math.max(stokAwal - jumlahKeluar, 0),
          });
        }
      }

      for (const [kategoriId, value] of kategoriUpdateMap) {
        const { error: updateStokError } = await supabase
          .from("kategori")
          .update({
            stok: value.stokBaru,
          })
          .eq("id", kategoriId);

        if (updateStokError) {
          Alert.alert(
            "Peringatan",
            updateStokError.message ||
              "Distribusi tersimpan, tetapi stok kategori gagal diperbarui."
          );
          return;
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
      <SafeAreaView edges={["top"]} style={styles.loading}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Memuat data distribusi...</Text>
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
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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

            <SelectField
              label="Pilih Penerima"
              placeholder="Pilih penerima bantuan"
              value={selectedPenerima}
              options={penerimaOptions}
              onChange={setSelectedPenerima}
              disabled={isSaving}
            />

            <Text style={styles.label}>Keterangan</Text>
            <TextInput
              placeholder="Catatan distribusi, contoh: bantuan untuk posko A"
              placeholderTextColor="#94a3b8"
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

                  {listBarang.length > 1 ? (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => hapusBarang(index)}
                      disabled={isSaving}
                    >
                      <FontAwesome5 name="trash" size={14} color="white" />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <SelectField
                  label="Pilih Barang"
                  placeholder="Pilih barang yang didistribusikan"
                  value={item.barangSelected}
                  options={barangOptions}
                  onChange={(value) =>
                    updateListBarang(index, "barangSelected", value)
                  }
                  disabled={isSaving}
                />

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
                  placeholder="Masukkan jumlah"
                  placeholderTextColor="#94a3b8"
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
  content: {
    paddingBottom: 34,
  },
  header: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 25,
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  small: {
    color: "#dbeafe",
    fontSize: 15,
    fontWeight: "700",
  },
  headerTitle: {
    color: "white",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 5,
  },
  headerSubtitle: {
    color: "#e0f2fe",
    marginTop: 8,
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
    marginBottom: 8,
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
    flex: 1,
    marginRight: 10,
  },
  selectPlaceholder: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    marginRight: 10,
  },
  infoBox: {
    backgroundColor: "#e0f2fe",
    borderRadius: 16,
    padding: 13,
    marginBottom: 16,
  },
  infoText: {
    color: "#0369a1",
    fontSize: 13,
    marginBottom: 4,
    fontWeight: "700",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#dbe3ea",
    borderRadius: 16,
    padding: 15,
    marginBottom: 18,
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontWeight: "700",
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  addButton: {
    marginHorizontal: 20,
    backgroundColor: "#0369a1",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomButton: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  saveBtn: {
    backgroundColor: "#0ea5e9",
    padding: 17,
    borderRadius: 18,
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
    fontWeight: "900",
  },
  btnText: {
    color: "white",
    fontWeight: "900",
    fontSize: 15,
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
    flex: 1,
    marginRight: 12,
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

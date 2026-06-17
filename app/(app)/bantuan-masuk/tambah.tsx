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

type Donatur = {
  id: number;
  nama: string;
};

type Kategori = {
  id: number;
  nama: string;
};

type Barang = {
  id: number;
  nama: string;
  satuan?: string | null;
  kategori_id?: number | null;
};

type SelectOption = {
  label: string;
  value: string | number;
  subLabel?: string;
};

type ListBarangItem = {
  barangSelected: string | number;
  kategoriBarang: string | number;
  namaBarang: string;
  satuanBarang: string;
  stok: string;
};

const NEW_BARANG_VALUE = "__new__";

const emptyBarang: ListBarangItem = {
  barangSelected: "",
  kategoriBarang: "",
  namaBarang: "",
  satuanBarang: "",
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
        <View style={{ flex: 1 }}>
          <Text style={selected ? styles.selectValue : styles.selectPlaceholder}>
            {selected?.label || placeholder}
          </Text>

          {selected?.subLabel ? (
            <Text style={styles.selectSub}>{selected.subLabel}</Text>
          ) : null}
        </View>

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
                  <Text style={styles.emptyOptionText}>Belum ada data</Text>
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
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.optionLabel,
                            active && styles.optionLabelActive,
                          ]}
                        >
                          {item.label}
                        </Text>

                        {item.subLabel ? (
                          <Text style={styles.optionSub}>{item.subLabel}</Text>
                        ) : null}
                      </View>

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

export default function TambahBantuanMasuk() {
  const [donatur, setDonatur] = useState<Donatur[]>([]);
  const [selectedDonatur, setSelectedDonatur] = useState<string | number>("");

  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [barang, setBarang] = useState<Barang[]>([]);
  const [listBarang, setListBarang] = useState<ListBarangItem[]>([
    { ...emptyBarang },
  ]);

  const [keterangan, setKeterangan] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const donaturOptions = useMemo<SelectOption[]>(() => {
    return donatur.map((item) => ({
      label: item.nama,
      value: item.id,
    }));
  }, [donatur]);

  const kategoriOptions = useMemo<SelectOption[]>(() => {
    return kategori.map((item) => ({
      label: item.nama,
      value: item.id,
    }));
  }, [kategori]);

  const barangOptions = useMemo<SelectOption[]>(() => {
    return [
      ...barang.map((item) => ({
        label: item.nama,
        value: item.id,
        subLabel: item.satuan ? `Satuan: ${item.satuan}` : undefined,
      })),
      {
        label: "+ Tambah Barang Baru",
        value: NEW_BARANG_VALUE,
        subLabel: "Buat barang baru saat menyimpan",
      },
    ];
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

    if (key === "barangSelected" && value !== NEW_BARANG_VALUE) {
      newList[index].kategoriBarang = "";
      newList[index].namaBarang = "";
      newList[index].satuanBarang = "";
    }

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

  const fetchDonatur = useCallback(async () => {
    const { data, error } = await supabase
      .from("donatur")
      .select("*")
      .order("nama", { ascending: true });

    if (error) {
      console.log("Fetch donatur error:", error.message);
      return;
    }

    setDonatur(data || []);
  }, []);

  const fetchBarang = useCallback(async () => {
    const { data, error } = await supabase
      .from("barang")
      .select("*")
      .order("nama", { ascending: true });

    if (error) {
      console.log("Fetch barang error:", error.message);
      return;
    }

    setBarang(data || []);
  }, []);

  const fetchKategori = useCallback(async () => {
    const { data, error } = await supabase
      .from("kategori")
      .select("*")
      .order("nama", { ascending: true });

    if (error) {
      console.log("Fetch kategori error:", error.message);
      return;
    }

    setKategori(data || []);
  }, []);

  const fetchMasterData = useCallback(async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchDonatur(), fetchBarang(), fetchKategori()]);
    } catch (error) {
      console.log("Fetch master bantuan masuk error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchDonatur, fetchBarang, fetchKategori]);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  const validateForm = () => {
    if (!selectedDonatur) {
      Alert.alert("Peringatan", "Pilih donatur terlebih dahulu.");
      return false;
    }

    for (let i = 0; i < listBarang.length; i++) {
      const item = listBarang[i];
      const jumlah = Number(item.stok);

      if (!item.barangSelected) {
        Alert.alert("Peringatan", `Pilih barang pada Barang ${i + 1}.`);
        return false;
      }

      if (item.barangSelected === NEW_BARANG_VALUE) {
        if (!item.kategoriBarang) {
          Alert.alert("Peringatan", `Pilih kategori pada Barang ${i + 1}.`);
          return false;
        }

        if (!item.namaBarang.trim()) {
          Alert.alert(
            "Peringatan",
            `Nama barang baru pada Barang ${i + 1} wajib diisi.`
          );
          return false;
        }

        if (!item.satuanBarang.trim()) {
          Alert.alert(
            "Peringatan",
            `Satuan barang baru pada Barang ${i + 1} wajib diisi.`
          );
          return false;
        }
      }

      if (!item.stok || Number.isNaN(jumlah) || jumlah <= 0) {
        Alert.alert(
          "Peringatan",
          `Jumlah pada Barang ${i + 1} harus lebih dari 0.`
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

      const processedItems: ListBarangItem[] = [...listBarang];

      for (let i = 0; i < processedItems.length; i++) {
        const item = processedItems[i];

        if (item.barangSelected === NEW_BARANG_VALUE) {
          const { data, error } = await supabase
            .from("barang")
            .insert({
              kategori_id: Number(item.kategoriBarang),
              nama: item.namaBarang.trim(),
              satuan: item.satuanBarang.trim(),
            })
            .select()
            .single();

          if (error) {
            Alert.alert(
              "Gagal",
              error.message || "Gagal menambahkan barang baru."
            );
            return;
          }

          processedItems[i].barangSelected = data.id;
        }
      }

      const { data: incomingData, error: incomingError } = await supabase
        .from("incoming")
        .insert({
          donatur_id: Number(selectedDonatur),
          status: 2,
          keterangan: keterangan.trim() || null,
        })
        .select()
        .single();

      if (incomingError || !incomingData) {
        Alert.alert(
          "Gagal",
          incomingError?.message || "Gagal membuat data bantuan masuk."
        );
        return;
      }

      const detailPayload = processedItems.map((item) => ({
        incoming_id: incomingData.id,
        barang_id: Number(item.barangSelected),
        stok: Number(item.stok),
      }));

      const { error: detailError } = await supabase
        .from("incoming_detail")
        .insert(detailPayload);

      if (detailError) {
        Alert.alert(
          "Gagal",
          detailError.message || "Gagal menyimpan detail bantuan masuk."
        );
        return;
      }

      for (const item of processedItems) {
        const selectedBarang = barang.find(
          (b) => String(b.id) === String(item.barangSelected)
        );

        let kategoriId = selectedBarang?.kategori_id;

        if (!kategoriId && item.kategoriBarang) {
          kategoriId = Number(item.kategoriBarang);
        }

        if (kategoriId) {
          const { data: kategoriData, error: kategoriError } = await supabase
            .from("kategori")
            .select("id, stok")
            .eq("id", kategoriId)
            .maybeSingle();

          if (!kategoriError && kategoriData) {
            const stokLama = Number(kategoriData.stok || 0);
            const stokBaru = stokLama + Number(item.stok || 0);

            await supabase
              .from("kategori")
              .update({
                stok: stokBaru,
              })
              .eq("id", kategoriId);
          }
        }
      }

      Alert.alert("Berhasil", "Bantuan masuk berhasil disimpan.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.log("Simpan bantuan masuk error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan bantuan masuk.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} style={styles.loading}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Memuat data...</Text>
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <FontAwesome5 name="arrow-left" size={18} color="white" />
            </TouchableOpacity>

            <Text style={styles.small}>Transaksi Bantuan</Text>
            <Text style={styles.headerTitle}>Bantuan Masuk</Text>
            <Text style={styles.headerSubtitle}>
              Catat bantuan dari donatur dan tambahkan stok otomatis.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informasi Donatur</Text>

            <SelectField
              label="Pilih Donatur"
              placeholder="Pilih Donatur"
              value={selectedDonatur}
              options={donaturOptions}
              onChange={setSelectedDonatur}
              disabled={isSaving}
            />

            <Text style={styles.label}>Keterangan</Text>

            <TextInput
              placeholder="Contoh: Bantuan sembako tahap 1"
              placeholderTextColor="#94a3b8"
              value={keterangan}
              onChangeText={setKeterangan}
              style={[styles.textInput, styles.textArea]}
              multiline
              editable={!isSaving}
            />
          </View>

          {listBarang.map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>Barang {index + 1}</Text>

                {listBarang.length > 1 && (
                  <TouchableOpacity onPress={() => hapusBarang(index)}>
                    <FontAwesome5 name="trash" size={18} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>

              <SelectField
                label="Pilih Barang"
                placeholder="Pilih Barang"
                value={item.barangSelected}
                options={barangOptions}
                onChange={(value) =>
                  updateListBarang(index, "barangSelected", value)
                }
                disabled={isSaving}
              />

              {item.barangSelected === NEW_BARANG_VALUE && (
                <>
                  <SelectField
                    label="Kategori Barang Baru"
                    placeholder="Pilih Kategori"
                    value={item.kategoriBarang}
                    options={kategoriOptions}
                    onChange={(value) =>
                      updateListBarang(index, "kategoriBarang", value)
                    }
                    disabled={isSaving}
                  />

                  <Text style={styles.label}>Nama Barang Baru</Text>

                  <TextInput
                    placeholder="Contoh: Selimut"
                    placeholderTextColor="#94a3b8"
                    value={item.namaBarang}
                    onChangeText={(value) =>
                      updateListBarang(index, "namaBarang", value)
                    }
                    style={styles.textInput}
                    editable={!isSaving}
                  />

                  <Text style={styles.label}>Satuan Barang Baru</Text>

                  <TextInput
                    placeholder="Contoh: pcs, box, kg"
                    placeholderTextColor="#94a3b8"
                    value={item.satuanBarang}
                    onChangeText={(value) =>
                      updateListBarang(index, "satuanBarang", value)
                    }
                    style={styles.textInput}
                    editable={!isSaving}
                  />
                </>
              )}

              <Text style={styles.label}>Jumlah Masuk</Text>

              <TextInput
                placeholder="Masukkan jumlah bantuan"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={item.stok}
                onChangeText={(value) => updateListBarang(index, "stok", value)}
                style={styles.textInput}
                editable={!isSaving}
              />
            </View>
          ))}

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
                  <Text style={styles.btnText}>Simpan Bantuan Masuk</Text>
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
    paddingBottom: 40,
  },
  header: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 25,
    paddingTop: 26,
    paddingBottom: 34,
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
    marginBottom: 18,
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
    marginTop: 6,
  },
  headerSubtitle: {
    color: "#e0f2fe",
    marginTop: 8,
    lineHeight: 21,
    fontSize: 15,
  },
  card: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
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
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 16,
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
  selectSub: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 3,
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
    minHeight: 96,
    textAlignVertical: "top",
  },
  addButton: {
    marginHorizontal: 20,
    backgroundColor: "#0369a1",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  bottomButton: {
    marginHorizontal: 20,
    marginBottom: 36,
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
    marginTop: 15,
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
  optionSub: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
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

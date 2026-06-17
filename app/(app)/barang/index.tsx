import { useSession } from "@/ctx";
import { supabase } from "@/lib/supabase";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

export default function BarangIndex() {
  const { user } = useSession();
  const isAdmin = Boolean(user?.is_admin);
  const [barang, setBarang] = useState<Barang[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const filteredBarang = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return barang;

    return barang.filter((item) => {
      return (
        item.nama?.toLowerCase().includes(keyword) ||
        item.satuan?.toLowerCase().includes(keyword) ||
        item.kategori?.nama?.toLowerCase().includes(keyword)
      );
    });
  }, [barang, search]);

  const totalStokBarang = useMemo(() => {
    return barang.reduce((total, item) => {
      return total + Number(item.stok || 0);
    }, 0);
  }, [barang]);

  const fetchItems = useCallback(async () => {
    try {
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
        Alert.alert("Gagal", error.message || "Gagal memuat data barang.");
        return;
      }

      setBarang(data || []);
    } catch (error) {
      console.log("Fetch barang error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat memuat barang.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();

    const subscription = supabase
      .channel("barang-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "barang",
        },
        () => {
          fetchItems();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "kategori",
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchItems]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const hapusBarang = (id: number) => {
    if (!isAdmin) {
      Alert.alert("Akses ditolak", "Petugas tidak memiliki akses untuk menghapus barang.");
      return;
    }
    Alert.alert("Hapus Barang", "Yakin ingin menghapus data barang ini?", [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("barang").delete().eq("id", id);

          if (error) {
            Alert.alert("Gagal", error.message || "Gagal menghapus barang.");
            return;
          }

          Alert.alert("Berhasil", "Data barang berhasil dihapus.");
          fetchItems();
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome5 name="arrow-left" size={18} color="white" />
        </TouchableOpacity>

        <Text style={styles.small}>Data Master</Text>
        <Text style={styles.title}>Barang Tersedia</Text>
        <Text style={styles.subtitle}>
          Lihat daftar barang bantuan, kategori, satuan, dan stok barang.
        </Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryNumber}>{barang.length}</Text>
            <Text style={styles.summaryLabel}>Barang</Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryNumber}>{totalStokBarang}</Text>
            <Text style={styles.summaryLabel}>Total Stok</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchBox}>
        <FontAwesome5 name="search" size={16} color="#64748b" />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Cari barang, kategori, atau satuan"
          placeholderTextColor="#94a3b8"
          style={styles.searchInput}
          autoCapitalize="none"
        />
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Memuat data barang...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredBarang.length === 0 ? (
            <View style={styles.emptyBox}>
              <FontAwesome5 name="box-open" size={52} color="#94a3b8" />

              <Text style={styles.emptyTitle}>Belum ada barang</Text>

              <Text style={styles.emptyText}>
                Data barang akan tampil setelah ditambahkan.
              </Text>
            </View>
          ) : (
            filteredBarang.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.iconBox}>
                    <FontAwesome5 name="box-open" size={18} color="#0ea5e9" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.nama}>{item.nama}</Text>

                    <Text style={styles.metaText}>
                      Kategori: {item.kategori?.nama || "-"}
                    </Text>

                    <Text style={styles.metaText}>
                      Satuan: {item.satuan || "-"}
                    </Text>
                  </View>

                  <View style={styles.stokBadge}>
                    <Text style={styles.stokLabel}>Stok</Text>
                    <Text style={styles.stokValue}>{item.stok || 0}</Text>
                  </View>
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.noteText}>
                    Stok spesifik untuk barang ini.
                  </Text>

                  <View style={styles.action}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => router.push(`/barang/${item.id}`)}
                    >
                      <FontAwesome5 name="edit" size={14} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => hapusBarang(item.id)}
                    >
                      <FontAwesome5 name="trash" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.addFab}
        onPress={() => router.push("/barang/tambah")}
      >
        <FontAwesome5 name="plus" size={22} color="white" />
      </TouchableOpacity>
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
    paddingHorizontal: 25,
    paddingTop: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
  title: {
    color: "white",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 6,
  },
  subtitle: {
    color: "#e0f2fe",
    marginTop: 8,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 18,
    padding: 14,
  },
  summaryNumber: {
    color: "white",
    fontSize: 26,
    fontWeight: "900",
  },
  summaryLabel: {
    color: "#e0f2fe",
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
  },
  searchBox: {
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 8,
    backgroundColor: "white",
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    ...cardShadow,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#0f172a",
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 110,
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  loadingText: {
    color: "#64748b",
    marginTop: 12,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 15,
  },
  emptyText: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 22,
    marginBottom: 14,
    ...cardShadow,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  nama: {
    color: "#0f172a",
    fontSize: 17,
    fontWeight: "900",
  },
  metaText: {
    color: "#64748b",
    marginTop: 4,
    fontSize: 12,
  },
  stokBadge: {
    backgroundColor: "#e0f2fe",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 64,
  },
  stokLabel: {
    color: "#0369a1",
    fontSize: 11,
    fontWeight: "800",
  },
  stokValue: {
    color: "#0ea5e9",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2,
  },
  cardBottom: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noteText: {
    color: "#94a3b8",
    fontSize: 11,
    flex: 1,
    marginRight: 10,
  },
  action: {
    flexDirection: "row",
    gap: 8,
  },
  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  addFab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
    ...cardShadow,
  },
});

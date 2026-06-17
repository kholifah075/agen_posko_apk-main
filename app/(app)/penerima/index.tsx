import { supabase } from "@/lib/supabase";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
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

type Penerima = {
  id: number;
  nama: string;
  no_hp?: string | null;
  alamat?: string | null;
  keterangan?: string | null;
};

export default function PenerimaIndex() {
  const [penerima, setPenerima] = useState<Penerima[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const filteredPenerima = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return penerima;

    return penerima.filter((item) => {
      return (
        item.nama?.toLowerCase().includes(keyword) ||
        item.no_hp?.toLowerCase().includes(keyword) ||
        item.alamat?.toLowerCase().includes(keyword)
      );
    });
  }, [penerima, search]);

  const fetchItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("penerima")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.log("Penerima error:", error.message);
        return;
      }

      setPenerima(data || []);
    } catch (error) {
      console.log("Fetch penerima error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();

    const channel = supabase
      .channel("penerima-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "penerima" },
        () => fetchItems()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const hapusPenerima = (id: number) => {
    Alert.alert("Hapus Penerima", "Yakin ingin menghapus data penerima ini?", [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("penerima")
            .delete()
            .eq("id", id);

          if (error) {
            Alert.alert("Gagal", error.message || "Data gagal dihapus.");
            return;
          }

          Alert.alert("Berhasil", "Data penerima berhasil dihapus.");
          fetchItems();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome5 name="arrow-left" size={18} color="white" />
        </TouchableOpacity>

        <Text style={styles.small}>Data Master</Text>
        <Text style={styles.title}>Penerima</Text>
        <Text style={styles.subtitle}>
          Kelola data penerima atau lokasi tujuan bantuan.
        </Text>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Total Penerima</Text>
          <Text style={styles.summaryValue}>{penerima.length}</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <FontAwesome5 name="search" size={16} color="#64748b" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Cari nama, nomor HP, atau alamat"
          style={styles.searchInput}
          autoCapitalize="none"
        />
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Memuat data penerima...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredPenerima.length === 0 ? (
            <View style={styles.emptyBox}>
              <FontAwesome5 name="users" size={48} color="#94a3b8" />
              <Text style={styles.emptyTitle}>Belum ada penerima</Text>
              <Text style={styles.emptyText}>
                Data penerima akan tampil setelah ditambahkan.
              </Text>
            </View>
          ) : (
            filteredPenerima.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.leftContent}>
                  <View style={styles.iconBox}>
                    <FontAwesome5 name="users" size={18} color="#0ea5e9" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.nama}>{item.nama}</Text>
                    <Text style={styles.metaText}>
                      {item.no_hp || "No HP belum diisi"}
                    </Text>
                    <Text style={styles.metaText}>
                      {item.alamat || "Alamat belum diisi"}
                    </Text>
                  </View>
                </View>

                <View style={styles.action}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.push(`/penerima/${item.id}`)}
                  >
                    <FontAwesome5 name="edit" size={14} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => hapusPenerima(item.id)}
                  >
                    <FontAwesome5 name="trash" size={14} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.addFab}
        onPress={() => router.push("/penerima/tambah")}
      >
        <FontAwesome5 name="plus" size={22} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const cardShadow = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 4,
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
  summaryBox: {
    marginTop: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    padding: 16,
    borderRadius: 18,
  },
  summaryLabel: {
    color: "#dbeafe",
    fontSize: 13,
  },
  summaryValue: {
    color: "white",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 4,
  },
  searchBox: {
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 8,
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    ...cardShadow,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#0f172a",
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
    borderRadius: 20,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...cardShadow,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
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
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
  },
  metaText: {
    color: "#64748b",
    marginTop: 4,
    fontSize: 12,
  },
  action: {
    flexDirection: "row",
    gap: 8,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  addFab: {
    position: "absolute",
    right: 24,
    bottom: 28,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
    ...cardShadow,
  },
});

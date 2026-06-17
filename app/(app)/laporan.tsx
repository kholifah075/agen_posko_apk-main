import { supabase } from "@/lib/supabase";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterType = "semua" | "masuk" | "keluar";

type LaporanItem = {
  id: string;
  rawId: number | string;
  type: "masuk" | "keluar";
  title: string;
  pihak: string;
  keterangan?: string | null;
  status?: string | number | null;
  created_at?: string | null;
};

export default function Laporan() {
  const [items, setItems] = useState<LaporanItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("semua");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const filteredItems = useMemo(() => {
    if (filter === "semua") return items;

    return items.filter((item) => item.type === filter);
  }, [items, filter]);

  const totalMasuk = items.filter((item) => item.type === "masuk").length;
  const totalKeluar = items.filter((item) => item.type === "keluar").length;

  const formatDate = (date?: string | null) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusText = (status?: string | number | null) => {
    if (status === "diterima" || status === 2 || status === "2") {
      return "Diterima";
    }

    if (status === "ditolak" || status === 3 || status === "3") {
      return "Ditolak";
    }

    if (status === "selesai") {
      return "Selesai";
    }

    return "Pending";
  };

  const getStatusStyle = (status?: string | number | null) => {
    if (status === "selesai" || status === "diterima" || status === 2 || status === "2") {
      return {
        badge: styles.badgeSuccess,
        text: styles.badgeSuccessText,
      };
    }

    if (status === "ditolak" || status === 3 || status === "3") {
      return {
        badge: styles.badgeDanger,
        text: styles.badgeDangerText,
      };
    }

    return {
      badge: styles.badgePending,
      text: styles.badgePendingText,
    };
  };

  const fetchData = async () => {
    try {
      const { data: incomingData, error: incomingError } = await supabase
        .from("incoming")
        .select(`
          *,
          donatur:donatur_id (
            id,
            nama
          )
        `)
        .order("created_at", { ascending: false });

      if (incomingError) {
        console.log("Incoming laporan error:", incomingError.message);
      }

      const { data: outgoingData, error: outgoingError } = await supabase
        .from("outgoing")
        .select(`
          *,
          penerima:penerima_id (
            id,
            nama
          )
        `)
        .order("created_at", { ascending: false });

      if (outgoingError) {
        console.log("Outgoing laporan error:", outgoingError.message);
      }

      const incoming: LaporanItem[] =
        incomingData?.map((item: any) => ({
          id: `incoming-${item.id}`,
          rawId: item.id,
          type: "masuk",
          title: `Bantuan Masuk #${item.id}`,
          pihak: item.donatur?.nama || "Donatur tidak diketahui",
          keterangan: item.keterangan,
          status: item.status,
          created_at: item.created_at,
        })) || [];

      const outgoing: LaporanItem[] =
        outgoingData?.map((item: any) => ({
          id: `outgoing-${item.id}`,
          rawId: item.id,
          type: "keluar",
          title: `Bantuan Keluar #${item.id}`,
          pihak: item.penerima?.nama || "Penerima tidak diketahui",
          keterangan: item.keterangan,
          status: item.status,
          created_at: item.created_at,
        })) || [];

      const merged = [...incoming, ...outgoing].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

        return dateB - dateA;
      });

      setItems(merged);
    } catch (error) {
      console.log("Fetch laporan error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("laporan-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incoming" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "outgoing" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donatur" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "penerima" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const FilterButton = ({
    label,
    value,
  }: {
    label: string;
    value: FilterType;
  }) => {
    const active = filter === value;

    return (
      <TouchableOpacity
        style={[styles.filterButton, active && styles.filterButtonActive]}
        onPress={() => setFilter(value)}
      >
        <Text style={[styles.filterText, active && styles.filterTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome5 name="arrow-left" size={18} color="white" />
        </TouchableOpacity>

        <Text style={styles.small}>Laporan Posko</Text>
        <Text style={styles.title}>Laporan Bantuan</Text>
        <Text style={styles.subtitle}>
          Ringkasan bantuan masuk dari donatur dan bantuan keluar ke penerima.
        </Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryNumber}>{totalMasuk}</Text>
            <Text style={styles.summaryLabel}>Masuk</Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryNumber}>{totalKeluar}</Text>
            <Text style={styles.summaryLabel}>Keluar</Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryNumber}>{items.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterWrapper}>
        <FilterButton label="Semua" value="semua" />
        <FilterButton label="Masuk" value="masuk" />
        <FilterButton label="Keluar" value="keluar" />
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Memuat laporan...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredItems.length === 0 ? (
            <View style={styles.emptyBox}>
              <FontAwesome5 name="file-alt" size={45} color="#94a3b8" />

              <Text style={styles.emptyTitle}>Belum ada laporan</Text>

              <Text style={styles.emptyText}>
                Data laporan akan tampil setelah ada bantuan masuk atau keluar.
              </Text>
            </View>
          ) : (
            filteredItems.map((item) => {
              const statusStyle = getStatusStyle(item.status);

              return (
                <View key={item.id} style={styles.card}>
                  <View
                    style={[
                      styles.iconBox,
                      item.type === "masuk"
                        ? styles.iconMasuk
                        : styles.iconKeluar,
                    ]}
                  >
                    <FontAwesome5
                      name={item.type === "masuk" ? "arrow-down" : "arrow-up"}
                      size={18}
                      color={item.type === "masuk" ? "#16a34a" : "#dc2626"}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.title}</Text>

                    <Text style={styles.cardMeta}>
                      {item.type === "masuk"
                        ? `Donatur: ${item.pihak}`
                        : `Penerima: ${item.pihak}`}
                    </Text>

                    <Text style={styles.cardMeta}>
                      {item.type === "masuk"
                        ? "Bantuan Masuk"
                        : "Bantuan Keluar"}{" "}
                      • {formatDate(item.created_at)}
                    </Text>

                    {item.keterangan ? (
                      <Text style={styles.keterangan} numberOfLines={2}>
                        {item.keterangan}
                      </Text>
                    ) : null}
                  </View>

                  <View style={[styles.badge, statusStyle.badge]}>
                    <Text style={[styles.badgeText, statusStyle.text]}>
                      {getStatusText(item.status)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
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
    justifyContent: "center",
    alignItems: "center",
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
    borderRadius: 16,
    padding: 12,
  },
  summaryNumber: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
  },
  summaryLabel: {
    color: "#e0f2fe",
    fontSize: 12,
    marginTop: 2,
  },
  filterWrapper: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 4,
    flexDirection: "row",
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterButtonActive: {
    backgroundColor: "#0ea5e9",
    borderColor: "#0ea5e9",
  },
  filterText: {
    color: "#64748b",
    fontWeight: "800",
  },
  filterTextActive: {
    color: "white",
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#64748b",
    marginTop: 12,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    marginTop: 70,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 14,
  },
  emptyText: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    ...cardShadow,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iconMasuk: {
    backgroundColor: "#dcfce7",
  },
  iconKeluar: {
    backgroundColor: "#fee2e2",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
  },
  cardMeta: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  keterangan: {
    fontSize: 12,
    color: "#334155",
    marginTop: 6,
    lineHeight: 17,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
  },
  badgePending: {
    backgroundColor: "#fef3c7",
  },
  badgePendingText: {
    color: "#92400e",
  },
  badgeSuccess: {
    backgroundColor: "#dcfce7",
  },
  badgeSuccessText: {
    color: "#166534",
  },
  badgeDanger: {
    backgroundColor: "#fee2e2",
  },
  badgeDangerText: {
    color: "#991b1b",
  },
});

import { supabase } from "@/lib/supabase";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, usePathname } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import { StatusBar } from "expo-status-bar";

type Kategori = {
  id: number;
  nama: string;
  stok?: number | null;
};

export default function AdminDashboard() {
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [totalBarang, setTotalBarang] = useState(0);
  const [totalDonatur, setTotalDonatur] = useState(0);
  const [totalPenerima, setTotalPenerima] = useState(0);
  const [totalMasuk, setTotalMasuk] = useState(0);
  const [totalKeluar, setTotalKeluar] = useState(0);
  const [totalStok, setTotalStok] = useState(0);

  const getData = useCallback(async () => {
    try {
      const [
        kategoriResult,
        barangResult,
        donaturResult,
        penerimaResult,
        incomingResult,
        outgoingResult,
      ] = await Promise.all([
        supabase.from("kategori").select("*").order("nama", { ascending: true }),
        supabase.from("barang").select("id"),
        supabase.from("donatur").select("id"),
        supabase.from("penerima").select("id"),
        supabase.from("incoming").select("id"),
        supabase.from("outgoing").select("id"),
      ]);

      if (kategoriResult.error) {
        console.log("Kategori error:", kategoriResult.error.message);
      }

      if (barangResult.error) {
        console.log("Barang error:", barangResult.error.message);
      }

      if (donaturResult.error) {
        console.log("Donatur error:", donaturResult.error.message);
      }

      if (penerimaResult.error) {
        console.log("Penerima error:", penerimaResult.error.message);
      }

      if (incomingResult.error) {
        console.log("Incoming error:", incomingResult.error.message);
      }

      if (outgoingResult.error) {
        console.log("Outgoing error:", outgoingResult.error.message);
      }

      const kategoriData = kategoriResult.data || [];

      setKategori(kategoriData);
      setTotalBarang(barangResult.data?.length || 0);
      setTotalDonatur(donaturResult.data?.length || 0);
      setTotalPenerima(penerimaResult.data?.length || 0);
      setTotalMasuk(incomingResult.data?.length || 0);
      setTotalKeluar(outgoingResult.data?.length || 0);

      const stok = kategoriData.reduce((total: number, item: any) => {
        return total + Number(item.stok || 0);
      }, 0);

      setTotalStok(stok);
    } catch (error) {
      console.log("Dashboard error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    getData();

    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kategori" },
        () => getData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "barang" },
        () => getData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donatur" },
        () => getData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "penerima" },
        () => getData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incoming" },
        () => getData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "outgoing" },
        () => getData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [getData]);

  const onRefresh = () => {
    setRefreshing(true);
    getData();
  };

  const StatCard = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: number;
    icon: string;
  }) => {
    return (
      <View style={styles.statCard}>
        <View style={styles.statIcon}>
          <FontAwesome5 name={icon as any} size={18} color="#0ea5e9" />
        </View>

        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    );
  };

  const QuickAction = ({
    title,
    desc,
    icon,
    route,
  }: {
    title: string;
    desc: string;
    icon: string;
    route: string;
  }) => {
    return (
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => router.push(route as any)}
      >
        <View style={styles.actionIcon}>
          <FontAwesome5 name={icon as any} size={18} color="#0ea5e9" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionDesc}>{desc}</Text>
        </View>

        <FontAwesome5 name="chevron-right" size={14} color="#94a3b8" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>Halo, Admin 👋</Text>
              <Text style={styles.title}>Dashboard POSKO</Text>
              <Text style={styles.subtitle}>
                Pantau bantuan masuk, distribusi, dan stok bantuan.
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <MaterialCommunityIcons name="warehouse" size={42} color="white" />
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#0ea5e9" />
              <Text style={styles.loadingText}>Memuat dashboard...</Text>
            </View>
          ) : (
            <>
              <View style={styles.mainSummary}>
                <View>
                  <Text style={styles.summaryLabel}>Total Stok Bantuan</Text>
                  <Text style={styles.summaryValue}>{totalStok}</Text>
                  <Text style={styles.summarySub}>
                    Berdasarkan total stok semua kategori
                  </Text>
                </View>

                <View style={styles.summaryIcon}>
                  <FontAwesome5 name="boxes" size={28} color="#0ea5e9" />
                </View>
              </View>

              <View style={styles.statsGrid}>
                <StatCard label="Barang" value={totalBarang} icon="box-open" />
                <StatCard label="Masuk" value={totalMasuk} icon="arrow-down" />
                <StatCard label="Keluar" value={totalKeluar} icon="arrow-up" />
                <StatCard label="Donatur" value={totalDonatur} icon="hand-holding-heart" />
              </View>

              <View style={styles.extraInfo}>
                <View style={styles.extraInfoItem}>
                  <FontAwesome5 name="users" size={15} color="#0ea5e9" />
                  <Text style={styles.extraInfoText}>{totalPenerima} Penerima</Text>
                </View>

                <View style={styles.extraInfoItem}>
                  <FontAwesome5 name="layer-group" size={15} color="#0ea5e9" />
                  <Text style={styles.extraInfoText}>{kategori.length} Kategori</Text>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Aksi Cepat</Text>
                <TouchableOpacity onPress={() => router.push("/fitur")}>
                  <Text style={styles.sectionLink}>Lihat semua</Text>
                </TouchableOpacity>
              </View>

              <QuickAction
                title="Bantuan Masuk"
                desc="Catat bantuan dari donatur"
                icon="arrow-down"
                route="/bantuan-masuk/tambah"
              />

              <QuickAction
                title="Distribusi"
                desc="Catat bantuan keluar ke penerima"
                icon="truck"
                route="/distribusi/tambah"
              />

              <QuickAction
                title="Laporan"
                desc="Lihat riwayat bantuan masuk dan keluar"
                icon="file-alt"
                route="/laporan"
              />

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Stok Kategori</Text>
                <TouchableOpacity onPress={() => router.push("/kategori")}>
                  <Text style={styles.sectionLink}>Kelola</Text>
                </TouchableOpacity>
              </View>

              {kategori.length === 0 ? (
                <View style={styles.emptyBox}>
                  <FontAwesome5 name="boxes" size={38} color="#94a3b8" />
                  <Text style={styles.emptyTitle}>Belum ada kategori</Text>
                  <Text style={styles.emptyText}>
                    Tambahkan kategori agar stok bisa dipantau.
                  </Text>
                </View>
              ) : (
                kategori.map((item) => (
                  <View key={item.id} style={styles.stockCard}>
                    <View style={styles.stockIcon}>
                      <FontAwesome5 name="boxes" size={17} color="#0ea5e9" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.stockName}>{item.nama}</Text>
                      <Text style={styles.stockDesc}>Stok tersedia</Text>
                    </View>

                    <Text style={styles.stockValue}>{item.stok || 0}</Text>
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.replace("/admin")}
          >
            <FontAwesome5
              name="home"
              size={20}
              color={pathname === "/admin" ? "#1E88E5" : "#64748b"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.replace("/fitur")}
          >
            <FontAwesome5
              name="th-large"
              size={20}
              color={pathname === "/fitur" ? "#1E88E5" : "#64748b"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.replace("/profile")}
          >
            <FontAwesome5
              name="user"
              size={20}
              color={pathname === "/profile" ? "#1E88E5" : "#64748b"}
            />
          </TouchableOpacity>
        </View>
      </View>
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
  content: {
    padding: 18,
    paddingBottom: 135,
  },
  header: {
    backgroundColor: "#0ea5e9",
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    ...cardShadow,
  },
  greeting: {
    color: "#dbeafe",
    fontSize: 15,
    fontWeight: "700",
  },
  title: {
    color: "white",
    fontSize: 27,
    fontWeight: "900",
    marginTop: 6,
  },
  subtitle: {
    color: "#e0f2fe",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  loadingCard: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 35,
    alignItems: "center",
    ...cardShadow,
  },
  loadingText: {
    color: "#64748b",
    marginTop: 12,
  },
  mainSummary: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...cardShadow,
  },
  summaryLabel: {
    color: "#64748b",
    fontWeight: "800",
  },
  summaryValue: {
    color: "#0f172a",
    fontSize: 38,
    fontWeight: "900",
    marginTop: 5,
  },
  summarySub: {
    color: "#94a3b8",
    marginTop: 5,
    fontSize: 12,
  },
  summaryIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  statCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    ...cardShadow,
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    color: "#0f172a",
    fontSize: 26,
    fontWeight: "900",
  },
  statLabel: {
    color: "#64748b",
    marginTop: 3,
    fontWeight: "700",
  },
  extraInfo: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  extraInfoItem: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...cardShadow,
  },
  extraInfoText: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 13,
  },
  sectionHeader: {
    marginTop: 4,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#0f172a",
    fontSize: 19,
    fontWeight: "900",
  },
  sectionLink: {
    color: "#0ea5e9",
    fontWeight: "900",
  },
  actionCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    ...cardShadow,
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },
  actionTitle: {
    color: "#0f172a",
    fontWeight: "900",
    fontSize: 15,
  },
  actionDesc: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },
  stockCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    ...cardShadow,
  },
  stockIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },
  stockName: {
    color: "#0f172a",
    fontWeight: "900",
    fontSize: 15,
  },
  stockDesc: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },
  stockValue: {
    color: "#0ea5e9",
    fontSize: 22,
    fontWeight: "900",
  },
  emptyBox: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    ...cardShadow,
  },
  emptyTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 14,
  },
  emptyText: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
    paddingBottom: 24,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    ...cardShadow,
  },
  navItem: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 11,
    marginTop: 4,
    color: "#64748b",
  },
  activeText: {
    fontSize: 11,
    marginTop: 4,
    color: "#1E88E5",
    fontWeight: "bold",
  },
});

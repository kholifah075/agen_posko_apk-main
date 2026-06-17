import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router, usePathname } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

type MenuItem = {
  title: string;
  desc: string;
  icon: string;
  route: string;
};

type MenuSection = {
  title: string;
  desc: string;
  items: MenuItem[];
};

export default function Fitur() {
  const pathname = usePathname();

  const menuSections: MenuSection[] = [
    {
      title: "Data Master",
      desc: "Kelola data dasar yang digunakan dalam proses bantuan.",
      items: [
        {
          title: "Barang",
          desc: "Data barang bantuan",
          icon: "box-open",
          route: "/barang",
        },
        {
          title: "Kategori",
          desc: "Kategori dan stok",
          icon: "boxes",
          route: "/kategori",
        },
        {
          title: "Donatur",
          desc: "Pemberi bantuan",
          icon: "hand-holding-heart",
          route: "/donatur",
        },
        {
          title: "Penerima",
          desc: "Tujuan bantuan",
          icon: "users",
          route: "/penerima",
        },
      ],
    },
    {
      title: "Transaksi Bantuan",
      desc: "Catat bantuan masuk dan bantuan keluar dari posko.",
      items: [
        {
          title: "Bantuan Masuk",
          desc: "Input dari donatur",
          icon: "arrow-down",
          route: "/bantuan-masuk/tambah",
        },
        {
          title: "Distribusi",
          desc: "Kirim ke penerima",
          icon: "truck",
          route: "/distribusi/tambah",
        },
      ],
    },
    {
      title: "Monitoring",
      desc: "Pantau riwayat dan ringkasan aktivitas bantuan.",
      items: [
        {
          title: "Laporan",
          desc: "Riwayat bantuan",
          icon: "file-alt",
          route: "/laporan",
        },
        {
          title: "Dashboard",
          desc: "Ringkasan POSKO",
          icon: "chart-line",
          route: "/admin",
        },
      ],
    },
  ];

  const MenuCard = ({ item }: { item: MenuItem }) => {
    return (
      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => router.push(item.route as any)}
        activeOpacity={0.85}
      >
        <View style={styles.menuIcon}>
          <FontAwesome5 name={item.icon as any} size={20} color="#0ea5e9" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuDesc}>{item.desc}</Text>
        </View>

        <FontAwesome5 name="chevron-right" size={13} color="#94a3b8" />
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
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerSmall}>Menu Fitur</Text>
              <Text style={styles.headerTitle}>Kelola POSKO</Text>
              <Text style={styles.headerDesc}>
                Pilih modul untuk mengelola data bantuan, transaksi, dan laporan.
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <FontAwesome5 name="th-large" size={32} color="white" />
            </View>
          </View>

          <View style={styles.quickPanel}>
            <Text style={styles.quickTitle}>Aksi utama</Text>

            <View style={styles.quickRow}>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => router.push("/bantuan-masuk/tambah")}
              >
                <FontAwesome5 name="arrow-down" size={18} color="#0ea5e9" />
                <Text style={styles.quickText}>Masuk</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => router.push("/distribusi/tambah")}
              >
                <FontAwesome5 name="truck" size={18} color="#0ea5e9" />
                <Text style={styles.quickText}>Distribusi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => router.push("/laporan")}
              >
                <FontAwesome5 name="file-alt" size={18} color="#0ea5e9" />
                <Text style={styles.quickText}>Laporan</Text>
              </TouchableOpacity>
            </View>
          </View>

          {menuSections.map((section) => (
            <View key={section.title} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionDesc}>{section.desc}</Text>
                </View>
              </View>

              <View style={styles.sectionCard}>
                {section.items.map((item, index) => (
                  <View key={item.title}>
                    <MenuCard item={item} />

                    {index !== section.items.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
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
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    ...cardShadow,
  },
  headerSmall: {
    color: "#dbeafe",
    fontSize: 15,
    fontWeight: "700",
  },
  headerTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 6,
  },
  headerDesc: {
    color: "#e0f2fe",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  headerIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  quickPanel: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
    ...cardShadow,
  },
  quickTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 13,
  },
  quickRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickButton: {
    flex: 1,
    backgroundColor: "#e0f2fe",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  quickText: {
    color: "#0369a1",
    fontSize: 12,
    fontWeight: "900",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 11,
  },
  sectionTitle: {
    color: "#0f172a",
    fontSize: 19,
    fontWeight: "900",
  },
  sectionDesc: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 22,
    overflow: "hidden",
    ...cardShadow,
  },
  menuCard: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },
  menuTitle: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "900",
  },
  menuDesc: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginLeft: 77,
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

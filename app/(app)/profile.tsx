import { useSession } from "@/ctx";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router, usePathname } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function Profile() {
  const { signOut, user } = useSession() as any;
  const pathname = usePathname();

  const namaUser =
    user?.nama || user?.name || user?.username || "Admin POSKO";

  const roleUser =
    user?.role || user?.level || "Petugas Posko";

  const emailUser =
    user?.email || user?.username || "-";

  const handleLogout = () => {
    Alert.alert("Logout", "Yakin ingin keluar dari aplikasi?", [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Keluar",
        style: "destructive",
        onPress: () => {
          signOut();
          router.replace("/sign-in");
        },
      },
    ]);
  };

  const MenuRow = ({
    icon,
    title,
    desc,
    route,
  }: {
    icon: string;
    title: string;
    desc: string;
    route: string;
  }) => {
    return (
      <TouchableOpacity
        style={styles.menuRow}
        onPress={() => router.push(route as any)}
        activeOpacity={0.85}
      >
        <View style={styles.menuIcon}>
          <FontAwesome5 name={icon as any} size={18} color="#0ea5e9" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuDesc}>{desc}</Text>
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
            <View style={styles.avatar}>
              <FontAwesome5 name="user" size={34} color="white" />
            </View>

            <Text style={styles.name}>{namaUser}</Text>
            <Text style={styles.role}>{roleUser}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Informasi Akun</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <FontAwesome5 name="id-badge" size={16} color="#0ea5e9" />
              </View>

              <View>
                <Text style={styles.infoLabel}>Nama</Text>
                <Text style={styles.infoValue}>{namaUser}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <FontAwesome5 name="user-shield" size={16} color="#0ea5e9" />
              </View>

              <View>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>{roleUser}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <FontAwesome5 name="envelope" size={16} color="#0ea5e9" />
              </View>

              <View>
                <Text style={styles.infoLabel}>Akun</Text>
                <Text style={styles.infoValue}>{emailUser}</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Akses Cepat</Text>

            <MenuRow
              icon="home"
              title="Dashboard"
              desc="Lihat ringkasan stok dan aktivitas POSKO"
              route="/admin"
            />

            <View style={styles.divider} />

            <MenuRow
              icon="th-large"
              title="Fitur"
              desc="Buka semua modul pengelolaan bantuan"
              route="/fitur"
            />

            <View style={styles.divider} />

            <MenuRow
              icon="file-alt"
              title="Laporan"
              desc="Lihat riwayat bantuan masuk dan keluar"
              route="/laporan"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Aplikasi</Text>

            <View style={styles.appBox}>
              <View style={styles.appIcon}>
                <FontAwesome5 name="warehouse" size={22} color="#0ea5e9" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.appTitle}>POSKO Mobile</Text>
                <Text style={styles.appDesc}>
                  Sistem pencatatan bantuan masuk, distribusi, stok, donatur,
                  dan penerima.
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <FontAwesome5 name="sign-out-alt" size={18} color="#ef4444" />
            <Text style={styles.logoutText}>Logout dari akun</Text>
          </TouchableOpacity>
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
    padding: 26,
    alignItems: "center",
    marginBottom: 18,
    ...cardShadow,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  name: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
  },
  role: {
    color: "#e0f2fe",
    marginTop: 5,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    ...cardShadow,
  },
  sectionTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },
  infoLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
  },
  infoValue: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 12,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
  },
  menuIcon: {
    width: 46,
    height: 46,
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
    lineHeight: 17,
  },
  appBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  appIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  appTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "900",
  },
  appDesc: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  logoutButton: {
    backgroundColor: "#fee2e2",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    marginTop: 4,
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "900",
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

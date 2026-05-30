import { useSession } from '@/ctx';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { router, usePathname } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {

  const { signOut } = useSession();

  const pathname = usePathname();
  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100
        }}
      >

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcome}>
            Selamat Datang 👋
          </Text>

          <Text style={styles.title}>
            Admin Pengiriman
          </Text>

          <Text style={styles.subTitle}>
            Kelola data barang dan distribusi bantuan
          </Text>
        </View>

        {/* Menu */}
        <View style={styles.grid}>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/admin/kirim')}
          >
            <View style={styles.iconBox}>
              <FontAwesome5
                name="truck"
                size={26}
                color="#0ea5e9"
              />
            </View>

            <Text style={styles.cardTitle}>
              Kirim
            </Text>

            <Text style={styles.cardDesc}>
              Kelola pengiriman
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/admin/barang')}
          >
            <View style={styles.iconBox}>
              <FontAwesome5
                name="dolly-flatbed"
                size={26}
                color="#0ea5e9"
              />
            </View>

            <Text style={styles.cardTitle}>
              Barang
            </Text>

            <Text style={styles.cardDesc}>
              Data inventaris
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/admin/kategori')}
          >
            <View style={styles.iconBox}>
              <FontAwesome5
                name="boxes"
                size={26}
                color="#0ea5e9"
              />
            </View>

            <Text style={styles.cardTitle}>
              Kategori
            </Text>

            <Text style={styles.cardDesc}>
              Kelompok barang
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={[
              styles.card,
              styles.logoutCard
            ]}
            onPress={() => {
              signOut();
              router.replace("/sign-in");
            }}
          >

            <View style={styles.logoutIcon}>
              <FontAwesome5
                name="door-open"
                size={24}
                color="#ef4444"
              />
            </View>

            <Text style={styles.cardTitle}>
              Logout
            </Text>

            <Text style={styles.cardDesc}>
              Keluar aplikasi
            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>


      {/* Bottom Menu */}

<View style={styles.bottomNav}>

  {/* Dashboard */}
  <TouchableOpacity
    style={styles.navItem}
    onPress={() =>
      router.replace("/(app)/admin")
    }
  >

    <FontAwesome5
      name="home"
      size={20}
      color={
        pathname === "/(app)/admin"
          ? "#1E88E5"
          : "gray"
      }
    />

    <Text
      style={
        pathname === "/(app)/admin"
          ? styles.activeText
          : styles.navText
      }
    >
      Dashboard
    </Text>

  </TouchableOpacity>


  {/* Fitur */}
  <TouchableOpacity
    style={styles.navItem}
    onPress={() =>
      router.replace("/fitur")
    }
  >

    <FontAwesome5
      name="th-large"
      size={20}
      color={
        pathname === "/fitur"
          ? "#1E88E5"
          : "gray"
      }
    />

    <Text
      style={
        pathname === "/fitur"
          ? styles.activeText
          : styles.navText
      }
    >
      Fitur
    </Text>

  </TouchableOpacity>


  {/* Profile */}
  <TouchableOpacity
    style={styles.navItem}
    onPress={() =>
      router.replace("/profile")
    }
  >

    <FontAwesome5
      name="user"
      size={20}
      color={
        pathname === "/profile"
          ? "#1E88E5"
          : "gray"
      }
    />

    <Text
      style={
        pathname === "/profile"
          ? styles.activeText
          : styles.navText
      }
    >
      Profile
    </Text>

  </TouchableOpacity>

</View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f1f5f9"
  },

  header: {
    backgroundColor: "#0ea5e9",
    padding: 30,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    marginBottom: 25
  },

  welcome: {
    color: "#e0f2fe",
    fontSize: 15
  },

  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 5
  },

  subTitle: {
    color: "#e0f2fe",
    marginTop: 8
  },

  grid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },

  card: {
    width: "47%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    marginBottom: 18,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 5
  },

  iconBox: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#e0f2fe",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 15
  },

  logoutIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#fee2e2",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 15
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "bold"
  },

  cardDesc: {
    fontSize: 12,
    color: "gray",
    marginTop: 5
  },

  logoutCard: {
    borderWidth: 1,
    borderColor: "#fecaca"
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",

    flexDirection: "row",
    justifyContent: "space-around",

    paddingVertical: 15,

    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center"
  },

  navText: {
    fontSize: 11,
    marginTop: 4,
    color: "#64748b"
  },

  activeText: {
    fontSize: 11,
    marginTop: 4,
    color: "#1E88E5",
    fontWeight: "bold"
  }

});
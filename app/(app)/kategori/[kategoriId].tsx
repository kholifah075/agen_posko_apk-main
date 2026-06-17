import { supabase } from "@/lib/supabase";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Edit() {
  const { kategoriId } = useLocalSearchParams();

  const [kategori, setKategori] = useState("");

  const simpan = async () => {
    if (!kategori.trim()) {
      Alert.alert(
        "Peringatan",
        "Nama kategori tidak boleh kosong"
      );
      return;
    }

    const { error } = await supabase
      .from("kategori")
      .update({
        nama: kategori
      })
      .eq("id", kategoriId);

    if (error) {
      console.log(error);

      Alert.alert(
        "Gagal",
        "Gagal update kategori"
      );
    } else {
      Alert.alert(
        "Berhasil",
        "Kategori berhasil diupdate"
      );

      router.back();
    }
  };

  const getData = async () => {
    const { data, error } = await supabase
      .from("kategori")
      .select("*")
      .eq("id", kategoriId)
      .single();

    if (!error && data) {
      setKategori(data.nama);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* HEADER */}

        <View style={styles.header}>

          <TouchableOpacity
            onPress={() => router.back()}
          >
            <FontAwesome5
              name="arrow-left"
              size={22}
              color="white"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Edit Kategori
          </Text>

          <View style={{ width: 25 }} />

        </View>


        {/* CARD FORM */}

        <View style={styles.card}>

          <View style={styles.iconBox}>
            <FontAwesome5
              name="boxes"
              size={35}
              color="#0ea5e9"
            />
          </View>

          <Text style={styles.title}>
            Ubah Data Kategori
          </Text>

          <Text style={styles.subtitle}>
            Silakan ubah nama kategori
          </Text>


          <View style={styles.inputContainer}>

            <FontAwesome5
              name="tag"
              size={18}
              color="gray"
            />

            <TextInput
              value={kategori}
              placeholder="Nama kategori"
              onChangeText={setKategori}
              style={styles.input}
            />

          </View>


          <TouchableOpacity
            style={styles.saveBtn}
            onPress={simpan}
          >
            <Text style={styles.btnText}>
              Simpan
            </Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() =>
              router.back()
            }
          >
            <Text style={styles.cancelText}>
              Batal
            </Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
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
    padding: 20,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
  },

  headerTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20
  },

  card: {
    margin: 20,
    backgroundColor: "white",

    borderRadius: 25,
    padding: 25,

    shadowColor: "#000",
    shadowOpacity: .1,
    shadowRadius: 10,

    elevation: 6
  },

  iconBox: {
    width: 80,
    height: 80,

    backgroundColor: "#e0f2fe",

    borderRadius: 40,

    alignSelf: "center",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 15
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center"
  },

  subtitle: {
    textAlign: "center",
    color: "gray",
    marginTop: 8,
    marginBottom: 25
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#ddd",

    borderRadius: 15,
    paddingHorizontal: 15,

    marginBottom: 25
  },

  input: {
    flex: 1,
    padding: 15,
    marginLeft: 10
  },

  saveBtn: {
    backgroundColor: "#0ea5e9",
    padding: 15,

    borderRadius: 15,
    alignItems: "center",

    marginBottom: 12
  },

  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },

  cancelBtn: {
    borderWidth: 1,
    borderColor: "#ef4444",

    padding: 15,
    borderRadius: 15,

    alignItems: "center"
  },

  cancelText: {
    color: "#ef4444",
    fontWeight: "bold"
  }

});
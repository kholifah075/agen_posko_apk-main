import { supabase } from "@/lib/supabase";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Tambah() {
  const [listKategori, setListKategori] = useState<any[]>([]);
  const [kategori, setKategori] = useState<any>(null);
  const [barang, setBarang] = useState("");
  const [satuan, setSatuan] = useState("");

  const getListKategori = useCallback(async () => {
    const { data, error } = await supabase
      .from("kategori")
      .select("*");

    if (!error) {
      setListKategori(data || []);
    }
  }, []);

  useEffect(() => {
    getListKategori();
  }, [getListKategori]);

  const simpan = async () => {
    if (!kategori || !barang || !satuan) {
      alert("Semua data wajib diisi");
      return;
    }

    const { error } = await supabase
      .from("barang")
      .insert({
        nama: barang,
        kategori_id: kategori,
        satuan: satuan
      });

    if (error) {
      alert("Gagal tambah barang");
    } else {
      alert("Berhasil tambah barang");
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}
        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <FontAwesome5
              name="arrow-left"
              size={18}
              color="white"
            />
          </TouchableOpacity>

          <Text style={styles.title}>
            Tambah Barang
          </Text>

          <Text style={styles.subtitle}>
            Tambahkan data barang baru
          </Text>

        </View>

        {/* FORM CARD */}
        <View style={styles.card}>

          <Text style={styles.label}>
            Kategori
          </Text>

          <View style={styles.inputBox}>
            <Picker
              selectedValue={kategori}
              onValueChange={setKategori}
            >
              <Picker.Item
                label="Pilih kategori"
                value=""
              />

              {listKategori.map(
                (item: any) => (
                  <Picker.Item
                    key={item.id}
                    label={item.nama}
                    value={item.id}
                  />
                )
              )}
            </Picker>
          </View>

          <Text style={styles.label}>
            Nama Barang
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Masukkan nama barang"
            value={barang}
            onChangeText={setBarang}
          />

          <Text style={styles.label}>
            Satuan
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Contoh: pcs, box, kg"
            value={satuan}
            onChangeText={setSatuan}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={simpan}
          >
            <FontAwesome5
              name="save"
              size={18}
              color="white"
            />

            <Text style={styles.saveText}>
              Simpan
            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#f1f5f9"
  },

  header:{
    backgroundColor:"#0ea5e9",
    padding:25,
    paddingTop:20,
    borderBottomLeftRadius:30,
    borderBottomRightRadius:30,
    marginBottom:20
  },

  backBtn:{
    marginBottom:15
  },

  title:{
    color:"white",
    fontSize:24,
    fontWeight:"bold"
  },

  subtitle:{
    color:"#e0f2fe",
    marginTop:5
  },

  card:{
    marginHorizontal:20,
    backgroundColor:"white",
    borderRadius:20,
    padding:20,

    shadowColor:"#000",
    shadowOpacity:0.08,
    shadowRadius:5,
    elevation:5
  },

  label:{
    fontSize:15,
    fontWeight:"600",
    marginBottom:8
  },

  inputBox:{
    borderWidth:1,
    borderColor:"#d1d5db",
    borderRadius:12,
    marginBottom:20,
    overflow:"hidden"
  },

  input:{
    borderWidth:1,
    borderColor:"#d1d5db",
    borderRadius:12,
    padding:15,
    marginBottom:20
  },

  saveButton:{
    backgroundColor:"#0ea5e9",
    padding:16,
    borderRadius:15,

    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    gap:10,

    marginTop:10
  },

  saveText:{
    color:"white",
    fontSize:16,
    fontWeight:"bold"
  }

});
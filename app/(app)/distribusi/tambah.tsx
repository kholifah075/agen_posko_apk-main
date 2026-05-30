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
  const [kategori, setKategori] = useState([]);
  const [barang, setBarang] = useState([]);

  const [listBarang, setListBarang] = useState([
    {
      barangSelected: "",
      stok: 0,
    },
  ]);

  const updateListBarang = (
    index: any,
    key: any,
    value: any
  ) => {
    const newList = [...listBarang];
    newList[index][key] = value;
    setListBarang(newList);
  };

  const tambahIsianBarang = () => {
    setListBarang([
      ...listBarang,
      {
        barangSelected: "",
        stok: 0,
      },
    ]);
  };

  const hapusBarang = (index: number) => {
    const newList = listBarang.filter(
      (_, i) => i !== index
    );

    setListBarang(newList);
  };

  const simpan = async () => {
    const { data } = await supabase
      .from("outgoing")
      .insert({ status: 1 })
      .select();

    const dataHeader = data?.[0];

    for (let item of listBarang) {
      await supabase
        .from("outgoing_detail")
        .insert({
          outgoing_id: dataHeader.id,
          barang_id: item.barangSelected,
          stok: item.stok,
        });

        const { data, error } = await supabase
          .from('barang')
          .select(`
            id,
            stok,
            kategori:kategori_id (
              id,
              stok
            )
          `)
          .eq('id', item.barangSelected)
          .single();

        const newStok = data?.kategori?.stok - item.stok;
        const { data : updateStok, error: errorUpdateStok } = await supabase
          .from('kategori')
          .update({
            stok: newStok
          })
          .eq('id', data?.kategori.id)
          .select();
        
    }

    router.back();
  };

  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from("barang")
      .select("*");

    setBarang(data || []);
  }, []);

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>

          <TouchableOpacity
            onPress={() => router.back()}
          >
            <FontAwesome5
              name="arrow-left"
              size={20}
              color="white"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Distribusi Bantuan
          </Text>

          <View />
        </View>

        {/* SUBTITLE */}

        <Text style={styles.subTitle}>
          Atur distribusi barang bantuan
          ke lokasi tujuan
        </Text>

        {/* FORM */}

        {listBarang.map((item, index) => (
          <View
            key={index}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                Barang {index + 1}
              </Text>

              {listBarang.length > 1 && (
                <TouchableOpacity
                  onPress={() =>
                    hapusBarang(index)
                  }
                >
                  <FontAwesome5
                    name="trash"
                    size={18}
                    color="#ff4d4d"
                  />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>
              Pilih Barang
            </Text>

            <View style={styles.input}>
              <Picker
                selectedValue={
                  listBarang[index]
                    .barangSelected
                }
                onValueChange={(value) =>
                  updateListBarang(
                    index,
                    "barangSelected",
                    value
                  )
                }
              >
                <Picker.Item
                  label="Pilih Barang"
                  value=""
                />

                {barang.map(
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
              Jumlah Stok
            </Text>

            <TextInput
              value={String(
                listBarang[index].stok
              )}
              onChangeText={(value) =>
                updateListBarang(
                  index,
                  "stok",
                  value
                )
              }
              placeholder="Masukkan jumlah"
              keyboardType="numeric"
              style={styles.textInput}
            />
          </View>
        ))}

        {/* BUTTON TAMBAH */}

        <TouchableOpacity
          style={styles.addButton}
          onPress={tambahIsianBarang}
        >
          <FontAwesome5
            name="plus"
            size={16}
            color="white"
          />

          <Text style={styles.btnText}>
            Tambah Barang
          </Text>
        </TouchableOpacity>

        {/* BUTTON ACTION */}

        <View style={styles.bottomButton}>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={simpan}
          >
            <FontAwesome5
              name="save"
              size={18}
              color="white"
            />

            <Text
              style={styles.btnText}
            >
              Simpan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() =>
              router.back()
            }
          >
            <FontAwesome5
              name="times"
              size={18}
              color="white"
            />

            <Text
              style={styles.btnText}
            >
              Batal
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
backgroundColor:"#F5F7FB"
},

header:{
backgroundColor:"#0EA5E9",
padding:20,
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
borderBottomLeftRadius:30,
borderBottomRightRadius:30
},

headerTitle:{
fontSize:20,
fontWeight:"bold",
color:"white"
},

subTitle:{
padding:20,
color:"gray",
fontSize:14
},

card:{
backgroundColor:"white",
marginHorizontal:20,
marginBottom:18,
padding:18,
borderRadius:20,

shadowColor:"#000",
shadowOpacity:0.08,
shadowOffset:{
width:0,
height:3
},
shadowRadius:5,

elevation:5
},

cardHeader:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:15
},

cardTitle:{
fontSize:18,
fontWeight:"bold"
},

label:{
marginBottom:8,
fontWeight:"600",
color:"#444"
},

input:{
borderWidth:1,
borderColor:"#ddd",
borderRadius:12,
marginBottom:15
},

textInput:{
borderWidth:1,
borderColor:"#ddd",
borderRadius:12,
padding:14,
marginBottom:10
},

addButton:{
backgroundColor:"#22C55E",
marginHorizontal:20,
padding:16,
borderRadius:15,

flexDirection:"row",
justifyContent:"center",
alignItems:"center",
gap:10,
marginBottom:25
},

bottomButton:{
flexDirection:"row",
justifyContent:"space-evenly",
marginBottom:50
},

saveBtn:{
backgroundColor:"#0EA5E9",
padding:15,
width:"40%",
borderRadius:15,

flexDirection:"row",
justifyContent:"center",
alignItems:"center",
gap:8
},

backBtn:{
backgroundColor:"#EF4444",
padding:15,
width:"40%",
borderRadius:15,

flexDirection:"row",
justifyContent:"center",
alignItems:"center",
gap:8
},

btnText:{
color:"white",
fontWeight:"bold"
}

});
import { supabase } from "@/lib/supabase";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditBarang() {

  const { barangId } = useLocalSearchParams();

  const [loading,setLoading]=useState(true);

  const [listKategori,setListKategori]=useState<any[]>([]);
  const [kategori,setKategori]=useState<any>(null);
  const [barang,setBarang]=useState("");
  const [satuan,setSatuan]=useState("");

  const getListKategori = useCallback(async()=>{

    const {data,error}=await supabase
    .from("kategori")
    .select("*");

    if(error){
      console.log(error.message);
      return;
    }

    setListKategori(data||[]);

  },[]);

  const getData=async()=>{

    const {data,error}=await supabase
    .from("barang")
    .select("*")
    .eq("id",Number(barangId))
    .single();

    if(error){
      alert("Data gagal dimuat");
      return;
    }

    setKategori(data.kategori_id);
    setBarang(data.nama);
    setSatuan(data.satuan);

    setLoading(false);
  }

  useEffect(()=>{

    getListKategori();
    getData();

  },[]);

  const simpan=async()=>{

    if(
      !kategori ||
      !barang ||
      !satuan
    ){
      alert("Lengkapi data");
      return;
    }

    const {error}=await supabase
    .from("barang")
    .update({
      nama:barang,
      kategori_id:kategori,
      satuan:satuan
    })
    .eq(
      "id",
      Number(barangId)
    );

    if(error){
      alert(
        "Gagal update"
      );
    }else{
      alert(
        "Berhasil update"
      );

      router.back();
    }

  }

  if(loading){
    return(
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator
          size="large"
          color="#0ea5e9"
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
      showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <TouchableOpacity
            onPress={()=>
              router.back()
            }
          >
            <FontAwesome5
            name="arrow-left"
            size={18}
            color="white"
            />
          </TouchableOpacity>

          <Text style={styles.title}>
            Edit Barang
          </Text>

          <Text style={styles.subTitle}>
            Perbarui data barang
          </Text>

        </View>

        {/* CARD */}

        <View style={styles.card}>

          <Text style={styles.label}>
            Kategori
          </Text>

          <View style={styles.pickerBox}>
            <Picker
              selectedValue={
                kategori
              }
              onValueChange={
                setKategori
              }
            >
              <Picker.Item
                label="Pilih kategori"
                value=""
              />

              {listKategori.map(
              (item:any)=>(
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
            value={barang}
            placeholder="Nama Barang"
            onChangeText={setBarang}
          />


          <Text style={styles.label}>
            Jumlah
          </Text>

          <TextInput
            style={styles.input}
            value={satuan}
            placeholder="Contoh: pcs"
            onChangeText={setSatuan}
          />


          <TouchableOpacity
            style={styles.button}
            onPress={simpan}
          >

            <FontAwesome5
              name="save"
              color="white"
              size={16}
            />

            <Text style={styles.buttonText}>
              Simpan Perubahan
            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles=StyleSheet.create({

container:{
flex:1,
backgroundColor:"#f1f5f9"
},

loading:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

header:{
backgroundColor:"#0ea5e9",
padding:25,
borderBottomLeftRadius:30,
borderBottomRightRadius:30,
marginBottom:25
},

title:{
fontSize:24,
fontWeight:"bold",
color:"white",
marginTop:15
},

subTitle:{
color:"#e0f2fe",
marginTop:5
},

card:{
backgroundColor:"white",
marginHorizontal:20,
padding:20,
borderRadius:25,

elevation:5,
shadowColor:"#000",
shadowOpacity:.08,
shadowRadius:8
},

label:{
fontWeight:"600",
marginBottom:8,
fontSize:15
},

pickerBox:{
borderWidth:1,
borderColor:"#d6d6d6",
borderRadius:12,
marginBottom:20,
overflow:"hidden"
},

input:{
borderWidth:1,
borderColor:"#d6d6d6",
borderRadius:12,
padding:15,
marginBottom:20
},

button:{
backgroundColor:"#0ea5e9",
padding:16,
borderRadius:14,

alignItems:"center",
justifyContent:"center",

flexDirection:"row",
gap:10
},

buttonText:{
color:"white",
fontWeight:"bold",
fontSize:16
}

});
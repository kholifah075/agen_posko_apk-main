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

export default function Kirim(){

const [kategori,setKategori]=useState([]);
const [barang,setBarang]=useState([]);

const [listBarang,setListBarang]=useState([
{
barangSelected:"",
kategoriBarang:null,
namaBarang:"",
satuanBarang:"",
stok:""
}
]);

const updateListBarang=(index:any,key:any,value:any)=>{

const newList=[...listBarang];

newList[index][key]=value;

setListBarang(newList);

};

const tambahIsianBarang=()=>{

setListBarang([
...listBarang,
{
barangSelected:"",
kategoriBarang:null,
namaBarang:"",
satuanBarang:"",
stok:""
}
]);

};

const hapusBarang=(index:number)=>{

const newList=listBarang.filter(
(_,i)=>i!==index
);

setListBarang(newList);

};

const simpan=async()=>{

const list=[...listBarang];

for(let i=0;i<list.length;i++){

let item=list[i];

if(item.barangSelected=="-1"){

const {data}=await supabase
.from("barang")
.insert({

kategori_id:item.kategoriBarang,
nama:item.namaBarang,
satuan:item.satuanBarang

})
.select();

item.barangSelected=data?.[0]?.id;

}

}

const {data}=await supabase
.from("incoming")
.insert({
status:1
})
.select();

const header=data?.[0];

for(let i=0;i<list.length;i++){

await supabase
.from("incoming_detail")
.insert({

incoming_id:header.id,
barang_id:list[i].barangSelected,
stok:list[i].stok

});

}

alert("Berhasil dikirim");

router.back();

};

const fetchBarang=useCallback(async()=>{

const {data}=await supabase
.from("barang")
.select("*");

setBarang(data||[]);

},[]);

const fetchKategori=useCallback(async()=>{

const {data}=await supabase
.from("kategori")
.select("*");

setKategori(data||[]);

},[]);

useEffect(()=>{

fetchBarang();

fetchKategori();

},[]);

return(

<SafeAreaView style={styles.container}>

<ScrollView
showsVerticalScrollIndicator={false}
>

{/* HEADER */}

<View style={styles.header}>

<TouchableOpacity
onPress={()=>router.back()}
>

<FontAwesome5
name="arrow-left"
size={20}
color="white"
/>

</TouchableOpacity>

<Text style={styles.headerTitle}>
Kirim Bantuan
</Text>

<View/>

</View>

{/* FORM */}

{listBarang.map((item,index)=>(

<View
key={index}
style={styles.card}
>

<View style={styles.titleRow}>

<Text style={styles.title}>
Barang {index+1}
</Text>

{listBarang.length>1&&(

<TouchableOpacity
onPress={()=>
hapusBarang(index)
}
>

<FontAwesome5
name="trash"
size={18}
color="red"
/>

</TouchableOpacity>

)}

</View>


<Text style={styles.label}>
Pilih Barang
</Text>

<View style={styles.inputBox}>

<Picker
selectedValue={item.barangSelected}
onValueChange={(v)=>
updateListBarang(
index,
"barangSelected",
v
)
}
>

<Picker.Item
label="Pilih Barang"
value=""
/>

{barang.map((b:any)=>(

<Picker.Item
key={b.id}
label={b.nama}
value={b.id}
/>

))}

<Picker.Item
label="+ Tambah Barang Baru"
value="-1"
/>

</Picker>

</View>

{item.barangSelected=="-1"&&(

<>

<Text style={styles.label}>
Kategori
</Text>

<View style={styles.inputBox}>

<Picker
selectedValue={item.kategoriBarang}
onValueChange={(v)=>
updateListBarang(
index,
"kategoriBarang",
v
)
}
>

<Picker.Item
label="Pilih Kategori"
value=""
/>

{kategori.map((k:any)=>(

<Picker.Item
key={k.id}
label={k.nama}
value={k.id}
/>

))}

</Picker>

</View>

<TextInput
placeholder="Nama Barang"
value={item.namaBarang}
onChangeText={(v)=>
updateListBarang(
index,
"namaBarang",
v
)
}
style={styles.textInput}
/>

<TextInput
placeholder="Satuan (Kg/Pcs)"
value={item.satuanBarang}
onChangeText={(v)=>
updateListBarang(
index,
"satuanBarang",
v
)
}
style={styles.textInput}
/>

</>

)}

<TextInput
placeholder="Jumlah/Stok"
keyboardType="numeric"
value={item.stok}
onChangeText={(v)=>
updateListBarang(
index,
"stok",
v
)
}
style={styles.textInput}
/>

</View>

))}


<TouchableOpacity
style={styles.addBtn}
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


<TouchableOpacity
style={styles.saveBtn}
onPress={simpan}
>

<Text style={styles.btnText}>
Simpan Data
</Text>

</TouchableOpacity>

</ScrollView>

</SafeAreaView>

)

}

const styles=StyleSheet.create({

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
borderBottomLeftRadius:25,
borderBottomRightRadius:25
},

headerTitle:{
fontSize:20,
fontWeight:"bold",
color:"white"
},

card:{
backgroundColor:"white",
margin:15,
padding:18,
borderRadius:20,

shadowColor:"#000",
shadowOpacity:0.08,
shadowRadius:6,

elevation:5
},

titleRow:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:15
},

title:{
fontWeight:"bold",
fontSize:18
},

label:{
marginBottom:8,
marginTop:10,
fontWeight:"600"
},

inputBox:{
borderWidth:1,
borderColor:"#ddd",
borderRadius:12,
overflow:"hidden"
},

textInput:{
borderWidth:1,
borderColor:"#ddd",
borderRadius:12,
padding:14,
marginTop:12
},

addBtn:{
backgroundColor:"#22C55E",
padding:16,
borderRadius:15,

marginHorizontal:20,

marginTop:10,

flexDirection:"row",
justifyContent:"center",
alignItems:"center",

gap:10
},

saveBtn:{
backgroundColor:"#0EA5E9",
padding:16,
borderRadius:15,

margin:20,

justifyContent:"center",
alignItems:"center"
},

btnText:{
color:"white",
fontWeight:"bold"
}

});
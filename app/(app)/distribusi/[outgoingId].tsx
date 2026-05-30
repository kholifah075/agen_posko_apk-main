import { supabase } from "@/lib/supabase";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function DistribusiDetail() {

const { outgoingId } = useLocalSearchParams();

const [outgoingDetail,setOutgoingDetail]=useState([]);
const [loading,setLoading]=useState(true);

const fetchItems=useCallback(async()=>{

setLoading(true);

const {data,error}=await supabase
.from("outgoing_detail")
.select(`
*,
barang(
nama,
kategori(id,nama),
satuan
)
`)
.eq("outgoing_id",outgoingId);

if(error){

console.log(error.message);

}else{

setOutgoingDetail(data||[]);

}

setLoading(false);

},[outgoingId]);

useEffect(()=>{

fetchItems();

},[fetchItems]);

function getIcon(kategori:any){

if(
kategori?.toLowerCase()
.includes("obat")
){
return "medical-bag";
}

if(
kategori?.toLowerCase()
.includes("tenda")
){
return "home-group";
}

if(
kategori?.toLowerCase()
.includes("baju")
){
return "tshirt-crew";
}

return "package-variant";

}

return(

<SafeAreaView style={styles.container}>

{/* HEADER */}

<View style={styles.header}>

<TouchableOpacity
onPress={()=>router.back()}
>

<FontAwesome5
name="arrow-left"
size={18}
color="white"
/>

</TouchableOpacity>

<Text style={styles.headerTitle}>
Detail Bantuan
</Text>

<View style={{width:20}}/>

</View>

<ScrollView
showsVerticalScrollIndicator={false}
contentContainerStyle={{
padding:18
}}
>

<Text style={styles.subTitle}>
Daftar bantuan yang dikirim
</Text>


{loading?(
<View style={styles.loadingBox}>

<ActivityIndicator
size="large"
color="#0ea5e9"
/>

<Text style={{
marginTop:10
}}>
Memuat data...
</Text>

</View>

):(

outgoingDetail.map(
(item:any)=>(

<View
key={item.id}
style={styles.card}
>

<View style={styles.left}>

<View style={styles.iconBox}>

<MaterialCommunityIcons
name={getIcon(item.barang?.kategori?.nama)}
size={30}
color="#0ea5e9"
/>

</View>

<View>

<Text style={styles.nama}>

{item.barang?.nama}

</Text>

<Text style={styles.kategori}>

{item.barang?.kategori?.nama}

</Text>

</View>

</View>


<View style={styles.badge}>

<Text style={styles.jumlah}>

{item.stok}

</Text>

<Text style={styles.satuan}>

{item.barang?.satuan}

</Text>

</View>

</View>

)

)

)}

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
backgroundColor:"#0ea5e9",

paddingTop:20,
paddingBottom:25,
paddingHorizontal:20,

borderBottomLeftRadius:30,
borderBottomRightRadius:30,

flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
},

headerTitle:{
fontSize:22,
fontWeight:"bold",
color:"white"
},

subTitle:{
fontSize:16,
fontWeight:"600",
marginBottom:18,
color:"#444"
},

loadingBox:{
marginTop:100,
alignItems:"center"
},

card:{
backgroundColor:"#fff",

padding:18,

borderRadius:20,

marginBottom:15,

flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",

shadowColor:"#000",
shadowOpacity:0.08,
shadowRadius:6,

elevation:4
},

left:{
flexDirection:"row",
alignItems:"center"
},

iconBox:{
width:55,
height:55,

borderRadius:15,

backgroundColor:"#E0F2FE",

justifyContent:"center",
alignItems:"center",

marginRight:15
},

nama:{
fontSize:17,
fontWeight:"bold"
},

kategori:{
color:"gray",
marginTop:5
},

badge:{
backgroundColor:"#0ea5e9",

paddingVertical:10,
paddingHorizontal:18,

borderRadius:15,

alignItems:"center"
},

jumlah:{
color:"white",
fontWeight:"bold",
fontSize:22
},

satuan:{
color:"white",
fontSize:12
}

});
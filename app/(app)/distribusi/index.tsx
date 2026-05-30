import { supabase } from "@/lib/supabase";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function Index(){

const [distribusi,setDistribusi]=useState([]);
const [loading,setLoading]=useState(true);

const fetchItems=useCallback(async()=>{

setLoading(true);

const {data,error}=await supabase
.from("outgoing")
.select("*");

if(error){

console.log(error.message);

}else{

setDistribusi(data||[]);

}

setLoading(false);

},[]);

useEffect(()=>{

fetchItems();

const subscription=supabase
.channel("perubahan-distribusi")

.on(
"postgres_changes",

{
event:"INSERT",
schema:"public",
table:"outgoing"
},

()=>{
fetchItems();
}

)

.subscribe();

return()=>{

supabase.removeChannel(subscription);

};

},[fetchItems]);

return(

<SafeAreaView style={styles.container}>

{/* HEADER */}

<View style={styles.header}>

<Text style={styles.title}>
Distribusi Bantuan
</Text>

<Text style={styles.subtitle}>
Kelola data pengiriman bantuan
</Text>

<View style={styles.totalBox}>

<Text style={styles.totalText}>
Total Bantuan
</Text>

<Text style={styles.totalNumber}>
{distribusi.length}
</Text>

</View>

</View>


<ScrollView
showsVerticalScrollIndicator={false}
contentContainerStyle={{
padding:20
}}
>

{loading ? (

<View style={styles.loading}>

<ActivityIndicator
size="large"
color="#0ea5e9"
/>

<Text
style={{
marginTop:10
}}
>

Memuat data...

</Text>

</View>

):(

distribusi.length===0 ? (

<View style={styles.emptyBox}>

<FontAwesome5
name="box-open"
size={50}
color="#cbd5e1"
/>

<Text style={styles.emptyText}>
Belum ada bantuan
</Text>

</View>

):(

distribusi.map(
(item:any,index:number)=>(

<Pressable
key={item.id}

style={styles.card}

onPress={()=>
router.push(
`/distribusi/${item.id}`
)
}
>

<View style={styles.iconBox}>

<FontAwesome5
name="truck"
size={26}
color="#0ea5e9"
/>

</View>

<View style={{
flex:1
}}>

<Text style={styles.cardTitle}>

Bantuan {index+1}

</Text>

<Text style={styles.cardSub}>

Tekan untuk lihat detail

</Text>

</View>

<FontAwesome5
name="chevron-right"
size={18}
color="#999"
/>

</Pressable>

)

)

)

)}

<View style={{
height:80
}}/>

</ScrollView>


{/* BUTTON FLOAT */}

<TouchableOpacity

style={styles.addButton}

onPress={()=>
router.push(
"/distribusi/tambah"
)
}

>

<FontAwesome5
name="plus"
size={22}
color="white"
/>

</TouchableOpacity>


{/* BACK */}

<TouchableOpacity

style={styles.backButton}

onPress={()=>
router.back()
}

>

<FontAwesome5
name="arrow-left"
size={20}
color="#0ea5e9"
/>

<Text style={{
marginLeft:8
}}>
Kembali
</Text>

</TouchableOpacity>

</SafeAreaView>

)

}

const styles=StyleSheet.create({

container:{
flex:1,
backgroundColor:"#F4F7FC"
},

header:{
backgroundColor:"#0ea5e9",

paddingTop:30,
paddingBottom:35,
paddingHorizontal:25,

borderBottomLeftRadius:30,
borderBottomRightRadius:30
},

title:{
fontSize:26,
fontWeight:"bold",
color:"white"
},

subtitle:{
color:"#dbeafe",
marginTop:5
},

totalBox:{
backgroundColor:"rgba(255,255,255,.2)",

marginTop:20,

padding:15,

borderRadius:15
},

totalText:{
color:"white"
},

totalNumber:{
fontSize:30,
fontWeight:"bold",
color:"white"
},

card:{
backgroundColor:"white",

padding:18,

borderRadius:18,

marginBottom:15,

flexDirection:"row",

alignItems:"center",

shadowColor:"#000",

shadowOpacity:0.08,

shadowRadius:5,

elevation:4
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

cardTitle:{
fontSize:17,
fontWeight:"bold"
},

cardSub:{
color:"gray",
marginTop:4
},

loading:{
marginTop:100,
alignItems:"center"
},

emptyBox:{
alignItems:"center",
marginTop:80
},

emptyText:{
marginTop:15,
color:"gray",
fontSize:16
},

addButton:{

position:"absolute",

bottom:90,
right:25,

width:65,
height:65,

borderRadius:50,

backgroundColor:"#0ea5e9",

justifyContent:"center",
alignItems:"center",

elevation:8
},

backButton:{

position:"absolute",

bottom:20,
left:20,

backgroundColor:"white",

paddingVertical:12,
paddingHorizontal:20,

borderRadius:30,

flexDirection:"row",

alignItems:"center",

shadowColor:"#000",

shadowOpacity:0.1,

shadowRadius:5,

elevation:4

}

});
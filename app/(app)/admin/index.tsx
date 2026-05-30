import { supabase } from "@/lib/supabase";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    router,
    usePathname,
} from "expo-router";

import { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {

  const pathname = usePathname();

  const [stokMasuk, setStokMasuk] = useState(0);
  const [barangKirim, setBarangKirim] = useState(0);

  const [obat, setObat] = useState(0);
  const [tenda, setTenda] = useState(0);
  const [pakaian, setPakaian] = useState(0);

  const getData = useCallback(async () => {

    try {

      // incoming
      const { data: incoming } =
      await supabase
      .from("incoming")
      .select("id");

      // distribusi
      const { data: distribusi } =
      await supabase
      .from("distribusi")
      .select("id");


      setStokMasuk(
        incoming?.length || 0
      );

      setBarangKirim(
        distribusi?.length || 0
      );


      // kategori
      const {
        data: kategori,
        error
      } = await supabase
      .from("kategori")
      .select("*");

      if(error){
        console.log(error);
        return;
      }


      setObat(0);
      setTenda(0);
      setPakaian(0);


      kategori?.forEach((item:any)=>{

        if(
          item.nama?.toLowerCase()
          === "obat"
        ){
          setObat(item.stok || 0);
        }

        if(
          item.nama?.toLowerCase()
          === "tenda"
        ){
          setTenda(item.stok || 0);
        }

        if(
          item.nama?.toLowerCase()
          === "pakaian"
        ){
          setPakaian(item.stok || 0);
        }

      });

    } catch(err){
      console.log(err);
    }

  },[]);



  useEffect(()=>{

    getData();


    const incomingChannel =
    supabase
    .channel("incoming-realtime")
    .on(
      "postgres_changes",
      {
        event:"*",
        schema:"public",
        table:"incoming"
      },
      ()=>{
        getData();
      }
    )
    .subscribe();



    const distribusiChannel =
    supabase
    .channel("distribusi-realtime")
    .on(
      "postgres_changes",
      {
        event:"*",
        schema:"public",
        table:"distribusi"
      },
      ()=>{
        getData();
      }
    )
    .subscribe();



    const kategoriChannel =
    supabase
    .channel("kategori-realtime")
    .on(
      "postgres_changes",
      {
        event:"*",
        schema:"public",
        table:"kategori"
      },
      ()=>{
        getData();
      }
    )
    .subscribe();



    return ()=>{

      supabase.removeChannel(
        incomingChannel
      );

      supabase.removeChannel(
        distribusiChannel
      );

      supabase.removeChannel(
        kategoriChannel
      );

    };

  },[getData]);



  return (

<SafeAreaView style={styles.container}>

<View style={{flex:1}}>

<ScrollView
showsVerticalScrollIndicator={false}
contentContainerStyle={{
padding:15,
paddingBottom:100
}}
>

<View style={styles.header}>

<View>

<Text style={styles.halo}>
Halo,
</Text>

<Text style={styles.name}>
Admin
</Text>

<Text style={styles.small}>
Petugas Posko
</Text>

</View>

<FontAwesome5
name="user-circle"
size={55}
color="#1976D2"
/>

</View>



<View style={styles.banner}>

<View>

<Text style={styles.bannerTitle}>
SELAMAT DATANG
</Text>

<Text style={styles.bannerText}>
Barang Masuk : {stokMasuk}
</Text>

<Text style={styles.bannerText}>
Barang Dikirim : {barangKirim}
</Text>

</View>

<MaterialCommunityIcons
name="warehouse"
size={75}
color="white"
/>

</View>



<View style={styles.grid}>


<View style={styles.card}>

<Text style={styles.cardTitle}>
Obat
</Text>

<MaterialCommunityIcons
name="medical-bag"
size={42}
color="#EF5350"
/>

<Text style={styles.stock}>
{obat}
</Text>

<Text style={styles.label}>
Stok tersedia
</Text>

</View>


<View style={styles.card}>

<Text style={styles.cardTitle}>
Tenda
</Text>

<MaterialCommunityIcons
name="home-group"
size={42}
color="#42A5F5"
/>

<Text style={styles.stock}>
{tenda}
</Text>

<Text style={styles.label}>
Stok tersedia
</Text>

</View>


<View style={styles.card}>

<Text style={styles.cardTitle}>
Pakaian
</Text>

<MaterialCommunityIcons
name="tshirt-crew"
size={42}
color="#4CAF50"
/>

<Text style={styles.stock}>
{pakaian}
</Text>

<Text style={styles.label}>
Stok tersedia
</Text>

</View>

</View>

</ScrollView>



<View style={styles.bottomNav}>


<TouchableOpacity
style={styles.navItem}
onPress={()=>
router.replace("/admin")
}
>

<FontAwesome5
name="home"
size={20}
color={
pathname.includes("admin")
?"#1E88E5"
:"gray"
}
/>

<Text
style={
pathname.includes("admin")
?styles.activeText
:styles.navText
}
>
Dashboard
</Text>

</TouchableOpacity>



<TouchableOpacity
style={styles.navItem}
onPress={()=>
router.replace("/fitur")
}
>

<FontAwesome5
name="th-large"
size={20}
color={
pathname.includes("fitur")
?"#1E88E5"
:"gray"
}
/>

<Text
style={
pathname.includes("fitur")
?styles.activeText
:styles.navText
}
>
Fitur
</Text>

</TouchableOpacity>



<TouchableOpacity
style={styles.navItem}
onPress={()=>
router.replace("/profile")
}
>

<FontAwesome5
name="user"
size={20}
color={
pathname.includes("profile")
?"#1E88E5"
:"gray"
}
/>

<Text
style={
pathname.includes("profile")
?styles.activeText
:styles.navText
}
>
Profile
</Text>

</TouchableOpacity>

</View>

</View>

</SafeAreaView>

  );
}


const styles=StyleSheet.create({

container:{
flex:1,
backgroundColor:"#f5f5f5"
},

header:{
marginTop:10,
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
},

halo:{
fontSize:16,
color:"gray"
},

name:{
fontSize:24,
fontWeight:"bold"
},

small:{
color:"#888"
},

banner:{
marginTop:25,
backgroundColor:"#18B4AF",
borderRadius:20,
padding:20,

flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
},

bannerTitle:{
fontSize:18,
fontWeight:"bold",
color:"white"
},

bannerText:{
color:"white",
marginTop:7
},

grid:{
flexDirection:"row",
flexWrap:"wrap",
justifyContent:"space-between",
marginTop:25
},

card:{
width:"47%",
backgroundColor:"white",
padding:20,
borderRadius:18,
marginBottom:18,
alignItems:"center",
elevation:5
},

cardTitle:{
fontWeight:"bold"
},

stock:{
fontSize:30,
fontWeight:"bold",
marginTop:10
},

label:{
color:"gray"
},

bottomNav:{
height:75,
backgroundColor:"white",
flexDirection:"row",
justifyContent:"space-around",
alignItems:"center"
},

navItem:{
alignItems:"center"
},

navText:{
fontSize:12,
color:"gray",
marginTop:4
},

activeText:{
fontSize:12,
color:"#1E88E5",
fontWeight:"bold",
marginTop:4
}

});
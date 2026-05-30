import { supabase } from '@/lib/supabase';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {

  const [kategori, setKategori] = useState([]);

  const fetchItems = useCallback(async () => {

    const { data, error } =
      await supabase
      .from('kategori')
      .select('*');

    if(error){
      console.log(error.message);
    }else{
      setKategori(data || []);
    }

  },[]);


  useEffect(()=>{

    fetchItems();

    const subscription =
    supabase
    .channel(
      "perubahan-kategori"
    )
    .on(
      "postgres_changes",
      {
        event:"*",
        schema:"public",
        table:"kategori"
      },
      ()=>{
        fetchItems();
      }
    )
    .subscribe();

    return()=>{

      supabase.removeChannel(
        subscription
      )

    }

  },[]);



  const hapusKategori = async(
    id:number
  )=>{

    Alert.alert(
      "Konfirmasi",
      "Hapus kategori ini?",
      [
        {
          text:"Batal"
        },

        {
          text:"Hapus",

          onPress:async()=>{

            const {error}
            =await supabase
            .from("kategori")
            .delete()
            .eq(
              "id",
              id
            );

            if(error){

              Alert.alert(
                "Gagal",
                "Data gagal dihapus"
              );

            }

          }
        }
      ]
    )

  }


  return(

<SafeAreaView style={styles.container}>

<View style={{flex:1}}>

<ScrollView
showsVerticalScrollIndicator={false}
contentContainerStyle={{
paddingBottom:120
}}
>


{/* HEADER */}

<View style={styles.header}>


<TouchableOpacity
style={styles.backBtn}
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
Kategori Barang
</Text>

<Text style={styles.subtitle}>
Kelola data kategori bantuan
</Text>

</View>



{/* LIST */}

<View style={styles.listContainer}>

{
kategori.map(
(item:any)=>(
<View
key={item.id}
style={styles.card}
>

<View
style={{
flexDirection:"row",
alignItems:"center"
}}
>

<View
style={styles.iconBox}
>

<FontAwesome5
name="boxes"
size={18}
color="#0ea5e9"
/>

</View>

<View>

<Text
style={styles.nama}
>

{item.nama}

</Text>

<Text
style={styles.kecil}
>

Kategori Barang

</Text>

</View>

</View>



<View
style={styles.action}
>

<TouchableOpacity

style={
styles.editBtn
}

onPress={()=>
router.push(
`/admin/kategori/${item.id}`
)
}
>

<FontAwesome5
name="edit"
size={15}
color="white"
/>

</TouchableOpacity>


<TouchableOpacity

style={
styles.deleteBtn
}

onPress={()=>
hapusKategori(
item.id
)
}
>

<FontAwesome5
name="trash"
size={15}
color="white"
/>

</TouchableOpacity>

</View>

</View>

))
}

</View>

</ScrollView>



<TouchableOpacity
style={styles.fab}
onPress={()=>
router.push(
"/admin/kategori/tambah"
)
}
>

<FontAwesome5
name="plus"
size={24}
color="white"
/>

</TouchableOpacity>


</View>

</SafeAreaView>

)

}



const styles=StyleSheet.create({

container:{
flex:1,
backgroundColor:"#f1f5f9"
},

header:{
backgroundColor:"#0ea5e9",

paddingTop:25,
paddingBottom:35,
paddingHorizontal:25,

borderBottomLeftRadius:35,
borderBottomRightRadius:35
},

backBtn:{
width:40,
height:40,

backgroundColor:
"rgba(255,255,255,.25)",

borderRadius:12,

justifyContent:"center",
alignItems:"center",

marginBottom:20
},

title:{
fontSize:24,
fontWeight:"bold",
color:"white"
},

subtitle:{
marginTop:5,
color:"#dbeafe"
},

listContainer:{
padding:20
},

card:{
backgroundColor:"white",

padding:18,

borderRadius:18,

marginBottom:15,

flexDirection:"row",

justifyContent:
"space-between",

alignItems:"center",

shadowColor:"#000",
shadowOpacity:.08,
shadowRadius:5,

elevation:5
},

iconBox:{

width:45,
height:45,

backgroundColor:
"#e0f2fe",

borderRadius:14,

justifyContent:
"center",

alignItems:
"center",

marginRight:12

},

nama:{
fontWeight:"bold",
fontSize:16
},

kecil:{
color:"gray",
fontSize:12
},

action:{
flexDirection:"row"
},

editBtn:{
width:40,
height:40,

borderRadius:12,

backgroundColor:
"#16a34a",

justifyContent:
"center",

alignItems:
"center",

marginRight:8
},

deleteBtn:{
width:40,
height:40,

borderRadius:12,

backgroundColor:
"#ef4444",

justifyContent:
"center",

alignItems:
"center"
},

fab:{
position:"absolute",

right:25,
bottom:25,

width:65,
height:65,

borderRadius:35,

backgroundColor:
"#0ea5e9",

justifyContent:
"center",

alignItems:
"center",

shadowColor:"#000",
shadowOpacity:.25,
shadowRadius:5,

elevation:8
}

});
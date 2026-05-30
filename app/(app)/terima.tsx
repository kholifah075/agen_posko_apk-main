import { supabase } from "@/lib/supabase";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Terima() {

  const [incoming, setIncoming] =
    useState<any[]>([]);

  const fetchItems =
    useCallback(async () => {

    const { data, error } =
      await supabase
      .from("incoming")
      .select("*")
      .eq("status",1);

    if(error){
      console.log(error);
    }else{
      setIncoming(data || []);
    }

  },[]);

  useEffect(()=>{

    fetchItems();

    const subscription=
    supabase
    .channel(
      "perubahan-incoming"
    )
    .on(
      "postgres_changes",
      {
        event:"*",
        schema:"public",
        table:"incoming"
      },
      ()=>{
        fetchItems();
      }
    )
    .subscribe();

    return()=>{
      supabase.removeChannel(
        subscription
      );
    }

  },[fetchItems]);

  return (

    <SafeAreaView
      style={styles.container}
    >

      <ScrollView
      showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <Text style={styles.small}>
            Monitoring Bantuan
          </Text>

          <Text style={styles.title}>
            Terima Bantuan
          </Text>

          <Text style={styles.total}>
            Total bantuan:
            {" "}
            {incoming.length}
          </Text>

        </View>


        {/* LIST */}

        <View style={styles.content}>


        {incoming.length===0 ? (

          <View
          style={styles.empty}
          >

            <FontAwesome5
            name="box-open"
            size={55}
            color="#94a3b8"
            />

            <Text
            style={styles.emptyText}
            >
              Belum ada bantuan
            </Text>

          </View>

        ) : (

          incoming.map(
          (
            item:any,
            index:number
          )=>(

            <Pressable
            key={item.id}

            style={
              styles.card
            }

            onPress={()=>
            router.push(
            `/terima/${item.id}`
            )
            }
            >

            <View
            style={
              styles.left
            }
            >

              <View
              style={
                styles.icon
              }
              >

              <FontAwesome5
              name="truck-loading"
              size={20}
              color="#0ea5e9"
              />

              </View>

              <View>

              <Text
              style={
                styles.nama
              }
              >
                Bantuan {index+1}
              </Text>

              <Text
              style={
                styles.desc
              }
              >
                Klik untuk melihat detail
              </Text>

              </View>

            </View>


            <FontAwesome5
            name="chevron-right"
            size={15}
            color="#94a3b8"
            />

            </Pressable>

          ))
        )}

        </View>

      </ScrollView>


      {/* FAB BACK */}

      <TouchableOpacity
      style={styles.fab}
      onPress={()=>
        router.back()
      }
      >

      <FontAwesome5
      name="arrow-left"
      color="white"
      size={22}
      />

      </TouchableOpacity>

    </SafeAreaView>

  );
}

const styles=StyleSheet.create({

container:{
flex:1,
backgroundColor:"#f1f5f9"
},

header:{
backgroundColor:"#0ea5e9",
padding:30,
borderBottomLeftRadius:35,
borderBottomRightRadius:35,
marginBottom:20
},

small:{
color:"#dbeafe"
},

title:{
fontSize:26,
fontWeight:"bold",
color:"white",
marginTop:5
},

total:{
color:"white",
marginTop:8
},

content:{
paddingHorizontal:20,
paddingBottom:100
},

card:{
backgroundColor:"white",
padding:18,
borderRadius:20,
marginBottom:15,

flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",

shadowColor:"#000",
shadowOpacity:.08,
shadowRadius:5,
elevation:5
},

left:{
flexDirection:"row",
alignItems:"center"
},

icon:{
width:55,
height:55,
borderRadius:18,
backgroundColor:"#e0f2fe",

justifyContent:"center",
alignItems:"center",

marginRight:15
},

nama:{
fontSize:16,
fontWeight:"bold"
},

desc:{
fontSize:12,
color:"gray",
marginTop:5
},

empty:{
marginTop:100,
alignItems:"center"
},

emptyText:{
marginTop:15,
color:"gray",
fontSize:16
},

fab:{
position:"absolute",
bottom:30,
left:25,

width:65,
height:65,
borderRadius:50,

backgroundColor:"#0ea5e9",

justifyContent:"center",
alignItems:"center",

elevation:8
}

});
import { useSession } from "@/ctx";
import { supabase } from "@/lib/supabase";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {

  const [kategori, setKategori] = useState<any[]>([]);
  const { signOut } = useSession();

  const fetchItems = useCallback(async () => {

    const { data, error } =
      await supabase
      .from("kategori")
      .select("*");

    if (error) {
      console.log(error.message);
    } else {
      setKategori(data || []);
    }

  }, []);

  useEffect(() => {

    fetchItems();

    const subscription =
      supabase
      .channel("perubahan-kategori")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "kategori"
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        subscription
      );
    };

  }, [fetchItems]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <Text style={styles.smallText}>
            Selamat Datang 👋
          </Text>

          <Text style={styles.title}>
            Agen Posko Bantuan
          </Text>

          <Text style={styles.subTitle}>
            Monitoring stok bantuan
          </Text>

        </View>


        {/* STOK */}

        <Text style={styles.section}>
          Data Stok
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20
          }}
        >

          {kategori.map((item) => (

            <View
              key={item.id}
              style={styles.stockCard}
            >

              <View style={styles.iconCircle}>
                <FontAwesome5
                  name="boxes"
                  size={22}
                  color="#0ea5e9"
                />
              </View>

              <Text
                style={styles.stockName}
              >
                {item.nama}
              </Text>

              <Text
                style={styles.stockNumber}
              >
                {item.stok}
              </Text>

            </View>

          ))}

        </ScrollView>


        {/* MENU */}

        <Text style={styles.section}>
          Menu
        </Text>

        <View style={styles.grid}>


          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push(
                "/terima"
              )
            }
          >

            <View
              style={styles.iconBox}
            >
              <FontAwesome5
                name="truck"
                size={24}
                color="#0ea5e9"
              />
            </View>

            <Text style={styles.cardTitle}>
              Terima
            </Text>

            <Text style={styles.cardDesc}>
              Barang masuk
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push(
                "/distribusi"
              )
            }
          >

            <View
              style={styles.iconBox}
            >
              <FontAwesome6
                name="truck-ramp-box"
                size={24}
                color="#0ea5e9"
              />
            </View>

            <Text style={styles.cardTitle}>
              Distribusi
            </Text>

            <Text style={styles.cardDesc}>
              Kirim bantuan
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={[
              styles.card,
              styles.logoutCard
            ]}
            onPress={signOut}
          >

            <View
              style={styles.logoutIcon}
            >
              <FontAwesome5
                name="door-open"
                size={22}
                color="#ef4444"
              />
            </View>

            <Text style={styles.cardTitle}>
              Logout
            </Text>

            <Text style={styles.cardDesc}>
              Keluar aplikasi
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
padding:30,
borderBottomLeftRadius:35,
borderBottomRightRadius:35,
marginBottom:20
},

smallText:{
color:"#e0f2fe"
},

title:{
fontSize:26,
fontWeight:"bold",
color:"white",
marginTop:5
},

subTitle:{
color:"#dbeafe",
marginTop:5
},

section:{
fontSize:18,
fontWeight:"bold",
marginHorizontal:20,
marginBottom:15
},

stockCard:{
width:150,
backgroundColor:"white",
padding:20,
borderRadius:20,
marginRight:15,
alignItems:"center",

shadowColor:"#000",
shadowOpacity:.08,
shadowRadius:5,
elevation:5
},

iconCircle:{
width:50,
height:50,
borderRadius:25,
backgroundColor:"#e0f2fe",

justifyContent:"center",
alignItems:"center",

marginBottom:15
},

stockName:{
fontWeight:"bold",
fontSize:15
},

stockNumber:{
fontSize:28,
color:"#0ea5e9",
fontWeight:"bold",
marginTop:8
},

grid:{
paddingHorizontal:20,
flexDirection:"row",
flexWrap:"wrap",
justifyContent:"space-between",
paddingBottom:50
},

card:{
width:"48%",
backgroundColor:"white",
padding:20,
borderRadius:20,
marginBottom:15,

shadowColor:"#000",
shadowOpacity:.08,
shadowRadius:5,
elevation:5
},

iconBox:{
width:55,
height:55,
borderRadius:18,
backgroundColor:"#e0f2fe",

justifyContent:"center",
alignItems:"center",

marginBottom:15
},

logoutIcon:{
width:55,
height:55,
borderRadius:18,
backgroundColor:"#fee2e2",

justifyContent:"center",
alignItems:"center",

marginBottom:15
},

cardTitle:{
fontWeight:"bold",
fontSize:16
},

cardDesc:{
color:"gray",
fontSize:12,
marginTop:5
},

logoutCard:{
borderWidth:1,
borderColor:"#fecaca"
}

});
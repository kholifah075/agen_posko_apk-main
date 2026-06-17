import { supabase } from '@/lib/supabase';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const [barang, setBarang] = useState<any[]>([]);

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('barang')
      .select('*');

    if (error) {
      console.log(error.message);
    } else {
      setBarang(data || []);
    }
  }, []);

  useEffect(() => {
    fetchItems();

    const subscription = supabase
      .channel('barang-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'barang',
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchItems]);

  const tambahBarang = () => {
    router.push('/barang/tambah');
  };

  const editBarang = (id: number) => {
    router.push(`/barang/${id}`);
  };

  const hapusBarang = async (id: number) => {
    const { error } = await supabase
      .from('barang')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Gagal menghapus');
    } else {
      fetchItems();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Data Barang
          </Text>

          <Text style={styles.subtitle}>
            Total Barang : {barang.length}
          </Text>
        </View>

        {/* List Barang */}
        <View style={styles.content}>
          {barang.length === 0 ? (
            <View style={styles.emptyBox}>
              <FontAwesome5
                name="box-open"
                size={50}
                color="#94a3b8"
              />

              <Text style={styles.emptyText}>
                Belum ada data barang
              </Text>
            </View>
          ) : (
            barang.map((item) => (
              <View
                key={item.id}
                style={styles.card}
              >
                <View style={styles.leftContent}>
                  <View style={styles.iconBox}>
                    <FontAwesome5
                      name="box"
                      size={18}
                      color="#0ea5e9"
                    />
                  </View>

                  <View>
                    <Text style={styles.nama}>
                      {item.nama}
                    </Text>

                    <Text style={styles.idText}>
                      ID: {item.id}
                    </Text>
                  </View>
                </View>

                <View style={styles.action}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() =>
                      editBarang(item.id)
                    }
                  >
                    <FontAwesome5
                      name="edit"
                      size={14}
                      color="white"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() =>
                      hapusBarang(item.id)
                    }
                  >
                    <FontAwesome5
                      name="trash"
                      size={14}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Back */}
      <TouchableOpacity
        style={styles.backFab}
        onPress={() => router.back()}
      >
        <FontAwesome5
          name="arrow-left"
          size={20}
          color="white"
        />
      </TouchableOpacity>

      {/* Add */}
      <TouchableOpacity
        style={styles.addFab}
        onPress={tambahBarang}
      >
        <FontAwesome5
          name="plus"
          size={22}
          color="white"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:'#f1f5f9'
  },

  header:{
    backgroundColor:'#0ea5e9',
    padding:25,
    borderBottomLeftRadius:30,
    borderBottomRightRadius:30,
    marginBottom:20
  },

  title:{
    color:'white',
    fontSize:24,
    fontWeight:'bold'
  },

  subtitle:{
    color:'#e0f2fe',
    marginTop:5
  },

  content:{
    paddingHorizontal:20,
    paddingBottom:100
  },

  card:{
    backgroundColor:'white',
    padding:18,
    borderRadius:20,
    marginBottom:15,

    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',

    elevation:4,
    shadowColor:'#000',
    shadowOpacity:0.08,
    shadowRadius:5
  },

  leftContent:{
    flexDirection:'row',
    alignItems:'center'
  },

  iconBox:{
    width:50,
    height:50,
    borderRadius:15,
    backgroundColor:'#e0f2fe',
    justifyContent:'center',
    alignItems:'center',
    marginRight:15
  },

  nama:{
    fontSize:16,
    fontWeight:'bold'
  },

  idText:{
    color:'gray',
    marginTop:5
  },

  action:{
    flexDirection:'row',
    gap:10
  },

  editBtn:{
    backgroundColor:'#22c55e',
    padding:10,
    borderRadius:10
  },

  deleteBtn:{
    backgroundColor:'#ef4444',
    padding:10,
    borderRadius:10
  },

  addFab:{
    position:'absolute',
    right:25,
    bottom:30,

    width:65,
    height:65,
    borderRadius:50,

    backgroundColor:'#0ea5e9',

    justifyContent:'center',
    alignItems:'center',

    elevation:8
  },

  backFab:{
    position:'absolute',
    left:25,
    bottom:30,

    width:65,
    height:65,
    borderRadius:50,

    backgroundColor:'#334155',

    justifyContent:'center',
    alignItems:'center',

    elevation:8
  },

  emptyBox:{
    marginTop:100,
    alignItems:'center'
  },

  emptyText:{
    marginTop:20,
    color:'gray'
  }

});
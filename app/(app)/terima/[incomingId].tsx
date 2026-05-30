import { supabase } from "@/lib/supabase";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Button } from "@react-navigation/elements";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IncomingDetail() {
    const { incomingId } = useLocalSearchParams();
    const [incomingDetail, setIncomingDetail] = useState([]);
    const [isSubmit, setIsSubmit] = useState(false);
    

    const fetchItems = useCallback(async () => {
        const { data, error } = await supabase
        .from('incoming_detail')
        .select('* , barang(nama, kategori(id, nama), satuan))')
        .eq('incoming_id', incomingId);
        
        if (error) {
            console.log('Error fetching:', error.message);
        } else {
            setIncomingDetail(data);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const simpan = async () => {
        setIsSubmit(true);

        const listBarang = [...incomingDetail];
        const totalPerKategori = listBarang.reduce((acc, item : any) => {
            const kategori = item.barang.kategori.id;
            const stok = Number(item.stok) || 0;

            acc[kategori] = (acc[kategori] || 0) + stok;
            return acc;
        }, {});

        const { error: errorUpdate } = await supabase
            .from('incoming')
            .update({ status: 2 })
            .eq('id', incomingId);
        
        const promises = Object.keys(totalPerKategori).map(async (key) => {
            const { data, error } = await supabase
                .from('kategori')
                .select('stok')
                .eq('id', key)
                .single();

            if (error) {
                console.log(error);
                throw error; // biar Promise.all tahu ada error
            }

            const stokBaru = (data.stok || 0) + totalPerKategori[key];

            const { error: errorUpdate } = await supabase
                .from('kategori')
                .update({ stok: stokBaru })
                .eq('id', key);

            if (errorUpdate) throw errorUpdate;
        });

        await Promise.all(promises);
        router.back();

    };
    

    return (
        <ScrollView>
            <SafeAreaView>
                <View style={styles.box}>
                    <Text style={{ color: "white", fontSize: 18 }}>Detail Bantuan</Text>
                </View>
                <View style={styles.listIncomingDiv}>
                    {incomingDetail.map((item: any) => (
                        <View key={item.id} style={styles.listStok}>
                            <View>
                                <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.barang?.nama}</Text>
                                <Text>{item.barang?.kategori?.nama}</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.stok}</Text>
                                <Text>{item.barang?.satuan}</Text>
                            </View>
                        </View>
                    ))}
                </View>
                {isSubmit ? (
                    <View style={styles.buttonDiv}>
                        <Text>Loading</Text>
                    </View>
                ) : (
                    <View style={styles.buttonDiv}>
                        <Button style={styles.button} onPress={() => router.back()} >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, width: "100%" }}>
                                <FontAwesome5 name="arrow-left" size={24} color="#0ea5e9" />
                                <Text>Kembali</Text>
                            </View>
                        </Button>
                        <Button style={styles.button} onPress={() => simpan()} >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, width: "100%" }}>
                                <FontAwesome5 name="check" size={24} color="#0ea5e9" />
                                <Text>Terima</Text>
                            </View>
                        </Button>
                    </View>
                )}
            </SafeAreaView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    box: { 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor:"#0ea5e9",
        height: 70,
        marginBottom: 20
    },
    listIncomingDiv: {
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    listStok: {
        borderColor: "#0ea5e9",
        borderWidth: 2,
        padding: 20,
        marginBottom: 10,
        borderRadius: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff"
    },
    cardListStok: {
        borderColor: "#0ea5e9",
        borderWidth: 2,
        padding: 20,
        marginRight: 10,
        borderRadius: 15,
        width: 150,
        alignItems: 'center',
        marginBottom: 20
    },
    buttonDiv: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#caecf8ff",
        padding: 10,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        height: 50,
        width: 150,
    }
});
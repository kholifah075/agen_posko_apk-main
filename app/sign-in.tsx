import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSession } from '../ctx';

export default function Login(){
    const { signIn } = useSession();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => { 
      setShowPassword(!showPassword); 
    }; 
  
    const loginAction = async () => {
        const { data, error } = await supabase
            .from('user')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        if (error) {
            alert('Username dan Password salah!');
            console.log('Error fetching:', error.message);
        } else {
            signIn();
            if(data.is_admin) {
                router.replace('/admin');
            } else {
                router.replace('/');
            }
        }
    }
    useEffect(() => {
    }, []);
  
    return (
      <SafeAreaView style={style.container}>
        <Text style={style.title}>LOGIN</Text>
        <TextInput
          onChangeText={setUsername}
          placeholder='Username'
          value={username}
          style={style.textInput}
        />
        <View style={style.viewPassword}>
          <TextInput
            onChangeText={setPassword}
            placeholder='Password'
            secureTextEntry={!showPassword}
            value={password}
            style={style.textInputPassword}
          />
          <MaterialCommunityIcons 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={24} 
              color="#aaa"
              style={style.iconTextInput} 
              onPress={toggleShowPassword} 
          /> 

        </View>
        {!isLoading ? (
        <TouchableOpacity
          onPress={loginAction}
          style={style.button}>
          <Text style={{color:'#ffffff'}}>Sign In</Text>
        </TouchableOpacity>
        ) : <Text>Loading</Text>}
      </SafeAreaView>
    );

}
const style = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },

    textInput: {
        height: 50,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        width: '90%',
        borderRadius: 7,
    },

    textInputPassword: {
        width: '90%',
    },

    viewPassword: {
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start', // RN ga ada 'left'
        borderWidth: 1,
        borderRadius: 7,
        padding: 6,
    },

    button: {
        alignItems: 'center',
        marginTop: 30,
        backgroundColor: '#000',
        padding: 10,
        width: '90%',
        borderRadius: 7,
    },

    logo: {
        height: 80,
        width: '90%',
        marginBottom: 50,
        resizeMode: 'contain',
    },

    iconTextInput: {
        marginLeft: 0,
    },
});
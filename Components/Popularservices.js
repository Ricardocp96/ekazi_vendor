import {useState} from 'react';
import {Text,View,TouchableOpacity, FlatList,ActivityIndicator} from 'react-native';
import {useRouter} from 'expo-router';
import styles  from './style';
import {COLORS,SIZES} from '../constants'
const Popularservices = () => {
const router = useRouter();
const isLoading = false;
const error =false;

    return(
<View style={styles.container}>
<View style={styles.header}>
<Text style={styles.headerTitle}>Popular services

</Text>
<TouchableOpacity>
    <Text style={styles.headerBtn}> Show all </Text>
</TouchableOpacity>
</View>

<View style={styles.cardContainer}>

{isLoading ? ( 

    <ActivityIndicator size="large" colors={COLORS.primary}/>
): error ?(
    <Text>Somethhing went wrong</Text>
) :(
    <FlatList></FlatList>
)}


</View>

</View>
    );
};

export default Popularservices;
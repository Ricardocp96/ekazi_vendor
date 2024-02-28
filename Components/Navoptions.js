
import {Text,View,TouchableOpacity,Image, } from 'react-native';
import { FlatList } from 'react-native';
import tw from "twrnc";
import { Icon } from '@rneui/themed';


const data =[
{
id:"977",
title:"Home Services",
imageUrl:require ('../assets/house.png'),
screen:"Serviceproviders",

},
{
id:"976",
title:"Electronics",
imageUrl:require('../assets/fix.png'),
screen:"Serviceproviders",
},

];

export default function Navoptions (){

    return (
<FlatList
data={data}
horizontal
keyExtractor={(item) => item.id}
renderItem={({item})=>(

    <TouchableOpacity style={tw `p-1 pl-2 pb-2 pt-1 bg-gray-200 m-2 w-40  rounded-lg`}>
       <View>
<Image
style={{width:80,height:80, resizeMode:"contain"}}
source={item.imageUrl}



/>
<Text   style={tw `mt-2 text-lg font-semibold`}>{item.title}</Text>



       </View>
    </TouchableOpacity>
)}



/>


    );
};



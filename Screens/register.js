import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { useHeaderHeight } from '@react-navigation/elements'
import axios from 'axios';
import {
  Layout,
  Text,
  TextInput,
  Button,
  useTheme,
  Section,
  SectionContent,
  Picker,
  themeColor,
} from "react-native-rapi-ui";

export default function ({ navigation }) {
  const { isDarkmode, setTheme } = useTheme();
  const [mobile, setNumber] = useState("");
  const [uname, setNames] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setconfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pickerValue, setPickerValue] = React.useState(null);
 
  const [selectedValue, setSelectedValue] = useState(null);
  const height = useHeaderHeight();
  const items = [
    { label: '成人', value: 'adult' },
    { label: '学生', value: 'student' },
  
   
];

function handlePickerChange(value) {
  setSelectedValue(value);
}

async function Register (){
    // navigate to get more data and make the post request 

    if (selectedValue === 'student') {
      navigation.navigate("Student",{
        
        param1: mobile,
        param2:uname,
        param3:password,
        param4:confirmpassword
      }
      
      )
    } else if (selectedValue === 'adult') {


      const sender = await axios.post('http://54.197.36.210:3000/api/user/register/' ,{
        uname:uname,
        mobile: mobile,
        password:password,
        confirmpassword:confirmpassword

       })
      
       .then(() => 
       
       navigation.navigate("Login",{
       
        
      
   
       }))
       .then(() => {
        //Success
        
        if(!sender) 
        setLoading(false);
       
      })
      //If response is not in json then in error
      .catch((error) => {
        //Error
        //const message= "something went wrong try again"
        console.log(error)
        setLoading(false);
        alert(JSON.stringify("something went wrong try again"));
      });
    }

};
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={height + 47}
    style={{ flex: 1 }}
    
   
    >
      <Layout>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: isDarkmode ? "#17171E" : themeColor.white100,
            }}
          >
            <Image
             resizeMode="contain"
              style={{
                height: 220,
                width: 220,
              }}
              source={require("../assets/join.png")}
            />
          </View>
          <View
            style={{
              flex: 3,
              paddingHorizontal: 20,
              paddingBottom: 20,
              backgroundColor: isDarkmode ? themeColor.dark : themeColor.white,
            }}
          >
            <Text
              fontWeight="bold"
              size="h3"
              style={{
                alignSelf: "center",
                padding: 30,
              }}
            >
              登记




            </Text>
            <Section style={{ marginHorizontal: -18, marginTop: 20 }}>
            <SectionContent>
                <View>
                    <Text style={{ marginBottom: 10 }}>选择</Text>
                    <Picker
                        items={items}
                    
                        placeholder="选择账户类型"
                        onValueChange={handlePickerChange}
                        value={selectedValue}
                    />
                </View>
            </SectionContent>
        </Section>
          

            <Text>电话</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              placeholder="电话号码"
              value={mobile}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              keyboardType="number-address"
              onChangeText={(text) => setNumber(text)}
            />

<Text>姓名</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              placeholder="请输入姓名"
              value={uname}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              keyboardType="number-address"
              onChangeText={(text) => setNames(text)}
            />



          
                 <Text style={{ marginTop: 15 }}>密码</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              placeholder="请输入您的密码"
              value={password}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              secureTextEntry={true}
              onChangeText={(text) => setPassword(text)}
            />
                   <Text style={{ marginTop: 15 }}>重复你的密码</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              placeholder="请输入您的密码"
              value={confirmpassword}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              secureTextEntry={true}
              onChangeText={(text) => setconfirmPassword(text)}
            />
            <Button
              text={loading ? "Loading" : "创建账户"}
              onPress={() => {
               Register();
              }}
              style={{
                marginTop: 20,
              }}
              disabled={loading}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 15,
                justifyContent: "center",
              }}
            >
              <Text size="md">你有没有账号?</Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Login");
                }}
              >
                <Text
                  size="md"
                  fontWeight="bold"
                  style={{
                    marginLeft: 5,
                  }}
                >
                  在此登录
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 30,
                justifyContent: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  isDarkmode ? setTheme("light") : setTheme("dark");
                }}
              >
                <Text
                  size="md"
                  fontWeight="bold"
                  style={{
                    marginLeft: 5,
                  }}
                >
                  {isDarkmode ? "☀️ Light" : "🌑 Dark"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
                }

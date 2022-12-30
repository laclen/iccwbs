import { SafeAreaView, View, StatusBar, StyleSheet } from "react-native";
const STATUSBAR_HEIGHT = StatusBar.currentHeight;

const MyStatusBar = () => (
  <View style={[styles.statusBar]}>
    <SafeAreaView>
      <StatusBar barStyle={"light-content"} translucent />
    </SafeAreaView>
  </View>
);

const styles = StyleSheet.create({
  statusBar: {
    height: STATUSBAR_HEIGHT,
    backgroundColor: "rgba(0,0,0,0)",
  },
});

export default MyStatusBar;

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
    backgroundColor: "#000000",
  },
});

export default MyStatusBar;

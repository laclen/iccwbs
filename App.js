import { useState, useEffect } from "react";
import { StyleSheet, Text, View, Pressable, Image, Alert, TouchableOpacity, Linking, DevSettings } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import { BarCodeScanner } from "expo-barcode-scanner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logo from "./assets/iccwgenis.png";
import MyStatusBar from "./components/MyStatusBar";

export default function App() {
  // detect first launch to display helper messages only for once
  const HAS_LAUNCHED = "hasLaunched";
  const firstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem(HAS_LAUNCHED);
      if (hasLaunched === null) {
        AsyncStorage.setItem(HAS_LAUNCHED, "true");
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // open settings for camera permission
  const getSettings = () => Linking.openSettings();

  // restart app after after navigating user to settings
  const restartApp = () => DevSettings.reload();

  // state declarations for managing camera permission, and data storing
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [response, setResponse] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [iframelink, setIframeLink] = useState(null);

  // get camera permission
  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  // scan the barcode and store the response, alert if barcode is on unwanted type
  const handleBarCodeScanned = ({ type, data }) => {
    if (type === "org.iso.Code128") {
      setScanned(true);
      setResponse({ type: type, data: data });
      setIframeLink("https:/iccw.us/iccw/admin/view-certificate/" + data + "/21?table=true");
    } else {
      Alert.alert("Hata!", "Okuttuğunuz barkod hatalı, lütfen kimlik kartınızın yeni olduğundan ve arka yüzde, sol üstteki barkodu tarattığınızdan emin olun.");
      setShowScanner(false);
    }
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.background}>
      <MyStatusBar />
      <View style={showScanner ? styles.imageWrapperAfter : styles.imageWrapper}>
        <Image source={Logo} style={styles.image} resizeMode="cover" />
      </View>

      <View style={styles.scannerWrapper}>
        {scanned && response ? (
          <View style={styles.barcodeScannerResult}>
            <WebView
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              source={{
                html:
                  '</table><iframe id="frame" style="background: " width="100%"  height="100%" scrolling="yes" src="' + iframelink + '" frameborder="0" allow="autoplay; encrypted-media"></iframe>',
              }}
              style={styles.webView}
            />
          </View>
        ) : (
          <View>
            {showScanner ? (
              <View style={styles.barcodeScannerAfter}>
                <BarCodeScanner style={styles.barcodeScanner} onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} />
                {hasPermission === false && (
                  <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={() => {
                      getSettings();
                      setTimeout(() => {
                        restartApp();
                      }, 5000);
                    }}
                  >
                    <Text style={styles.permissionText}>Ayarlara gidip kameraya izin vermek için buraya dokunun.</Text>
                  </TouchableOpacity>
                )}
                <Pressable onPress={() => setShowScanner(false)} style={styles.button}>
                  <Text style={styles.buttonText}>İPTAL</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.barcodeScannerBefore}>
                <Text style={styles.helperText}> Merhaba, sertifika sorgulamak için lütfen aşağıdaki butona tıklayınız.</Text>
                <Pressable
                  onPress={async () => {
                    setShowScanner(true);
                    const isFirstLaunch = await firstLaunch();
                    console.log(isFirstLaunch);
                    isFirstLaunch ? Alert.alert("Dikkat", "Lütfen TC Kimlik kartınızın arka yüzündeki barkodu kameraya doğru tutun.") : null;
                  }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>SORGULAMA YAP</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
        {scanned && (
          <Pressable onPress={() => setScanned(false)} style={styles.button}>
            <Text style={styles.buttonText}>TEKRAR SORGULA</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.copyright}>Lim10 Medya &copy; Tüm hakları saklıdır.</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: "center",
    paddingTop: hp("3%"),
  },
  imageWrapper: {
    flex: 0.2,
    paddingTop: hp("25%"),
  },
  imageWrapperAfter: {
    flex: 0.2,
    paddingTop: hp("3.5%"),
  },
  webView: {
    backgroundColor: "rgba(0,0,0,0)",
    width: wp("90%"),
    height: hp("50%"),
    marginHorizontal: wp("1%"),
    marginBottom: hp("2%"),
  },
  scannerWrapper: {
    flex: 0.5,
    alignItems: "center",
    paddingTop: hp("2%"),
  },
  barcodeScanner: {
    backgroundColor: "black",

    width: wp("90%"),
    height: hp("45%"),

    marginHorizontal: wp("1%"),
    marginVertical: hp("2%"),
    marginBottom: hp("3%"),
  },
  barcodeScannerAfter: {
    alignItems: "center",
  },
  barcodeScannerBefore: {
    width: wp("80%"),
    height: hp("30%"),
    alignItems: "center",
    justifyContent: "center",
  },
  helperText: {
    color: "white",
    textAlign: "center",
    marginVertical: hp("3%"),
    fontSize: 16,
  },
  permissionButton: {
    paddingBottom: hp("2.5%"),
  },
  permissionText: {
    fontSize: 12,
    color: "white",
  },
  barcodeScannerResult: {
    width: wp("80%"),
    height: hp("50%"),
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "gainsboro",

    marginVertical: hp("0.1%"),
    marginHorizontal: wp("1%"),

    paddingVertical: hp("1%"),
    paddingHorizontal: wp("1%"),

    borderRadius: 15,
    width: wp("70.5%"),
    height: hp("6.5%"),

    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 1,
  },
  copyright: {
    color: "white",
    fontSize: 12,
    position: "absolute",
    bottom: 10,
  },
});

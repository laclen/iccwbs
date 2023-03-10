import { useState, useEffect } from "react";
import { StyleSheet, Text, View, Pressable, Image, Alert, TouchableOpacity, Linking, Platform } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import { BarCodeScanner } from "expo-barcode-scanner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
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

  // state declarations for managing camera permission, conditional dipslaying and data storing
  const [scanned, setScanned] = useState(false);
  const [response, setResponse] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showPermissionButton, setShowPermissionButton] = useState(true);
  const [iframelink, setIframeLink] = useState(null);

  // open settings for camera permission
  const getSettings = () => Linking.openSettings();

  // check & get camera permission
  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const response = await BarCodeScanner.getPermissionsAsync();
      if (response.status !== "granted") {
        const request = await BarCodeScanner.requestPermissionsAsync();
      } else {
        setShowPermissionButton(false);
      }
    };
    getBarCodeScannerPermissions();
  }, []);

  // we should detect the device's platform for barcode validation because barcode types differentiate between platforms
  const platform = Platform.OS;

  // barcode validation
  const validateBarcode = (type) => {
    if (platform === "android") {
      return type === 1;
    } else if (platform === "ios") {
      return type === "org.iso.Code128";
    }
  };

  // scan the barcode and store the response, alert if barcode is unwanted type
  const handleBarCodeScanned = ({ type, data }) => {
    if (validateBarcode(type)) {
      setIframeLink("https:/iccw.us/iccw/admin/view-certificate/" + data + "/21?table=true");
      setScanned(true);
      setResponse({ type: type, data: data });
    } else {
      Alert.alert(
        "Hata!",
        `Okuttu??unuz barkod tipi "${type}" kabul edilmiyor, l??tfen yeni kimlik kart??n??z??n arkas??nda sa?? ??stte bulunan barkodu taratt??????n??zdan emin olun.`
      );
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
            {iframelink && (
              <WebView
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                source={{
                  html:
                    '</table><iframe id="frame" style="background: " width="100%"  height="100%" scrolling="yes" src="' +
                    iframelink +
                    '" frameborder="0" allow="autoplay; encrypted-media"></iframe>',
                }}
                style={styles.webView}
              />
            )}
          </View>
        ) : (
          <View>
            {showScanner ? (
              <View style={styles.barcodeScannerAfter}>
                <BarCodeScanner
                  style={styles.barcodeScanner}
                  onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                />
                {showPermissionButton && (
                  <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={async () => {
                      setShowScanner(false);
                      getSettings();
                    }}
                  >
                    <View style={styles.permissionButtonWrapper}>
                      <Feather name="info" size={18} color="gainsboro" style={styles.infoIcon} />
                      <Text style={styles.permissionText}>
                        Barkod okuyucunun ??al????mas?? i??in kamera izni gereklidir.
                      </Text>
                    </View>
                    <Text style={styles.permissionText}>Uygulama ayarlar??na gitmek i??in buraya dokunun.</Text>
                  </TouchableOpacity>
                )}
                <Pressable onPress={() => setShowScanner(false)} style={styles.button}>
                  <Text style={styles.buttonText}>??PTAL</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.barcodeScannerBefore}>
                <Text style={styles.helperText}>
                  {" "}
                  Merhaba, sertifika sorgulamak i??in l??tfen a??a????daki butona t??klay??n??z.
                </Text>
                <Pressable
                  onPress={async () => {
                    const perm = await BarCodeScanner.getPermissionsAsync();
                    perm.granted ? setShowPermissionButton(false) : setShowPermissionButton(true);
                    setShowScanner(true);
                    setScanned(false);
                    (await firstLaunch())
                      ? Alert.alert(
                          "Dikkat",
                          "L??tfen TC Kimlik kart??n??z??n arka y??z??ndeki barkodu kameraya do??ru tutun."
                        )
                      : null;
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
      <Text style={styles.copyright}>Lim10 Medya &copy; T??m haklar?? sakl??d??r.</Text>
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
  permissionButtonWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  permissionButton: {
    paddingBottom: hp("2%"),
    alignItems: "center",
  },
  permissionText: {
    fontSize: 12,
    color: "gainsboro",
  },
  infoIcon: {
    marginRight: wp("1%"),
    paddingTop: hp("0.2%"),
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
    color: "gainsboro",
    fontSize: 11,
    position: "absolute",
    bottom: 10,
  },
});

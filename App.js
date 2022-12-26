import { useState, useEffect } from "react";
import { StyleSheet, Text, View, Pressable, Image, Alert } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import { BarCodeScanner } from "expo-barcode-scanner";
import Logo from "./assets/iccwgenis.png";

export default function App() {
  // state declarations for managing camera permission, and data storing
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [response, setResponse] = useState({ type: null, data: null });
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

  // checks if camera permission has been granted
  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.background}>
      <View style={styles.imageWrapper}>
        <Image source={Logo} style={styles.image} resizeMode="cover" />
      </View>

      <View style={styles.scannerWrapper}>
        {scanned && response ? (
          <View style={styles.barcodeScannerResult}>
            <WebView
              source={{
                html:
                  '</table><iframe id="frame" style="background: (0,0,0,0)" width="100%"  height="100%" scrolling="yes" src="' +
                  iframelink +
                  '" frameborder="0" allow="autoplay; encrypted-media"></iframe>',
              }}
              style={styles.webView}
            />
          </View>
        ) : (
          <View>
            {showScanner ? (
              <View style={styles.barcodeScannerAfter}>
                <BarCodeScanner style={styles.barcodeScanner} onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} />
                <Pressable onPress={() => setShowScanner(false)} style={styles.button}>
                  <Text style={styles.buttonText}>İPTAL</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.barcodeScannerBefore}>
                <Text style={styles.helperText}> Merhaba, sertifika sorgulamak için lütfen aşağıdaki butona tıklayınız.</Text>
                <Pressable
                  onPress={() => {
                    setShowScanner(true);
                    Alert.alert("Dikkat", "Lütfen TC Kimlik kartınızın arka yüzündeki barkodu kameraya doğru tutun.");
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
      <Text style={styles.copyright}>Lim10Medya &copy; Tüm hakları saklıdır.</Text>
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
    paddingTop: hp("10%"),
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
    marginBottom: hp("2%"),
  },
  barcodeScannerAfter: {
    alignItems: "center",
  },
  barcodeScannerBefore: {
    width: wp("80%"),
    height: hp("50%"),
    alignItems: "center",
    justifyContent: "center",
  },
  helperText: {
    color: "white",
    textAlign: "center",
    marginVertical: hp("3%"),
    fontSize: 16,
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

    borderRadius: 10,
    width: wp("70%"),
    height: hp("6%"),

    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  copyright: {
    color: "white",
    top: hp("20%"),
  },
});

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Styles
const styles = StyleSheet.create({
  TextPage: { flexDirection: "column", padding: 30 },
  ImagePage: { flexDirection: "row", padding: 0, alignItems: "center" },
  section: { marginBottom: 10 },
  img: { width: "100%", height: "auto" },
});

// Create document component
function MyDoc({ content, contentType }) {
  return contentType === "Text" ? (
    <Document>
      <Page size="A4" style={styles.TextPage}>
        <View style={styles.section}>
          <Text>{content}</Text>
        </View>
      </Page>
    </Document>
  ) : (
    <Document>
      <Page size="A4" style={styles.page}>
        {content.map((img,i) => {
          return <Image src={img} style={styles.img} key={i} />;
        })}
      </Page>
    </Document>
  );
}

export default MyDoc;

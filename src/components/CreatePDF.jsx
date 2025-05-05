import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

// Styles
const styles = StyleSheet.create({
  page: { flexDirection: 'column', padding: 30 },
  section: { marginBottom: 10 }
});

// Create document component
const MyDoc = ({content}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>{content}</Text>
      </View>
    </Page>
  </Document>
);


export default MyDoc;

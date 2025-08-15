import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ImageRun } from 'docx';
import { Alert, Platform } from 'react-native';
import { Visit } from '../../src/types';

interface ExportOptions {
  visitors: Visit[];
  title?: string;
  onSuccess?: (filePath: string) => void;
  onError?: (error: Error) => void;
}

export const exportVisitorHistoryDocx = async ({
  visitors,
  title = 'ThorSignia Visitor History Export',
  onSuccess,
  onError,
}: ExportOptions) => {
  try {
    if (!visitors || visitors.length === 0) {
      Alert.alert('No Data', 'No visitors to export.');
      return;
    }

    // Create document sections
    const sections = [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: title,
            heading: 'Heading1',
            spacing: { after: 200 },
          }),
          // Timestamp
          new Paragraph({
            text: `Generated on: ${new Date().toLocaleString()}`,
            spacing: { after: 400 },
          }),
          // Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              // Table Header
              new TableRow({
                children: [
                  'Name',
                  'Email',
                  'Phone',
                  'Purpose',
                  'Check-In',
                  'Status',
                ].map(
                  (header) =>
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: header,
                              bold: true,
                            }),
                          ],
                        }),
                      ],
                      shading: {
                        fill: 'DDDDDD',
                      },
                    })
                ),
              }),
              // Table Rows
              ...visitors.map((visitor) => {
                const checkInDate = visitor.check_in_time
                  ? new Date(visitor.check_in_time).toLocaleString()
                  : 'N/A';
                
                const status = visitor.check_out_time ? 'Checked Out' : 'Active';

                return new TableRow({
                  children: [
                    visitor.visitor_name || 'N/A',
                    visitor.visitor_email || 'N/A',
                    visitor.visitor_phone || 'N/A',
                    visitor.purpose || 'N/A',
                    checkInDate,
                    status,
                  ].map(
                    (cell) =>
                      new TableCell({
                        children: [new Paragraph({ text: String(cell) })],
                      })
                  ),
                });
              }),
            ],
          }),
        ],
      },
    ];

    // Create document
    const doc = new Document({
      sections: sections as any,
    });

    // Generate document buffer
    const buffer = await Packer.toBuffer(doc);

    // Convert buffer to base64
    const base64 = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${buffer.toString('base64')}`;

    // Generate filename with timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .replace('Z', '');
    const filename = `Visit_History_${timestamp}.docx`;

    // Get document directory
    const dir = `${FileSystem.documentDirectory}exports/`;
    const fileUri = `${dir}${filename}`;

    // Create directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }

    // Save file
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('Document saved to:', fileUri);

    // Share the document
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        dialogTitle: 'Share Visitor History',
        UTI: 'com.microsoft.word.doc',
      });
    } else {
      Alert.alert(
        'Export Complete',
        `Document saved to: ${fileUri}`,
        [{ text: 'OK' }]
      );
    }

    // Call success callback if provided
    if (onSuccess) {
      onSuccess(fileUri);
    }
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Show error to user
    Alert.alert('Export Failed', `Could not export document: ${errorMessage}`);
    
    // Call error callback if provided
    if (onError) {
      onError(error instanceof Error ? error : new Error(errorMessage));
    }
  }
};

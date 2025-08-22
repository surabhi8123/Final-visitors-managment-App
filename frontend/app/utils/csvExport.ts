import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { Visit } from '../../src/types';

interface ExportOptions {
  visitors: Visit[];
  title?: string;
  onSuccess?: (filePath: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Escapes a string for CSV format
 */
const escapeCsvValue = (value: string): string => {
  if (value === null || value === undefined) return '';
  
  // Convert to string in case it's a number or date
  const str = String(value);
  
  // If the string contains commas, quotes, or newlines, wrap it in quotes and escape existing quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
};

/**
 * Converts an array of visitor objects to a CSV string
 */
const convertToCsv = (visitors: Visit[]): string => {
  if (!visitors || visitors.length === 0) return '';
  
  // Define CSV headers
  const headers = [
    'Name',
    'Email',
    'Phone',
    'Purpose',
    'Check-in Date & Time',
    'Status'
  ];
  
  // Process each visitor into a CSV row
  const rows = visitors.map(visitor => {
    const checkInTime = visitor.check_in_time
      ? new Date(visitor.check_in_time).toLocaleString()
      : 'N/A';
    
    const status = visitor.check_out_time ? 'Checked Out' : 'Active';
    
    return [
      escapeCsvValue(visitor.visitor_name || ''),
      escapeCsvValue(visitor.visitor_email || ''),
      escapeCsvValue(visitor.visitor_phone || ''),
      escapeCsvValue(visitor.purpose || ''),
      escapeCsvValue(checkInTime),
      escapeCsvValue(status)
    ].join(',');
  });
  
  // Combine headers and rows
  return [
    headers.join(','),
    ...rows
  ].join('\n');
};

/**
 * Exports visitor history as a CSV file
 */
export const exportVisitorHistoryCSV = async ({
  visitors,
  title = 'ThorSignia Visitor History',
  onSuccess,
  onError,
}: ExportOptions): Promise<void> => {
  try {
    if (!visitors || visitors.length === 0) {
      Alert.alert('No Data', 'No visitors to export.');
      return;
    }

    // Generate CSV content
    const csvContent = convertToCsv(visitors);
    
    // Generate filename with timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .replace('Z', '');
    const filename = `Visitor_History_${timestamp}.csv`;
    
    // Get document directory
    const dir = `${FileSystem.documentDirectory}exports/`;
    const fileUri = `${dir}${filename}`;

    // Create directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }

    // Save file
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    console.log('CSV saved to:', fileUri);

    // Share the document if sharing is available
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: title,
        UTI: 'public.comma-separated-values-text',
      });
    } else {
      Alert.alert(
        'Export Complete',
        `CSV file saved to: ${fileUri}`,
        [{ text: 'OK' }]
      );
    }

    // Call success callback if provided
    if (onSuccess) {
      onSuccess(fileUri);
    }
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Show error to user
    Alert.alert('Export Failed', `Could not export CSV: ${errorMessage}`);
    
    // Call error callback if provided
    if (onError) {
      onError(error instanceof Error ? error : new Error(errorMessage));
    }
  }
};

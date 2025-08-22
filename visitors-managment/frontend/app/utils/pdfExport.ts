import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Alert } from 'react-native';
import { Visit } from '../../src/types';

interface ExportOptions {
  visitors: Visit[];
  title?: string;
  onSuccess?: (filePath: string) => void;
  onError?: (error: Error) => void;
}

export const exportVisitorsToPDF = async ({
  visitors,
  title = 'Visitor History Export - ThorSignia',
  onSuccess,
  onError,
}: ExportOptions): Promise<void> => {
  try {
    if (!visitors || visitors.length === 0) {
      Alert.alert('No Data', 'No visitors to export.');
      return;
    }

    // Create HTML content for the PDF
    const html = generateHTML(visitors, title);

    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // Generate a unique filename
    const filename = `ThorSignia_Visitors_${new Date().toISOString().split('T')[0]}.pdf`;
    const newPath = `${FileSystem.documentDirectory}${filename}`;

    // Move the file to a permanent location
    await FileSystem.moveAsync({
      from: uri,
      to: newPath,
    });

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(newPath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Visitor History',
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert(
        'Export Complete',
        `PDF saved to: ${newPath}`,
        [{ text: 'OK' }]
      );
    }

    if (onSuccess) onSuccess(newPath);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    if (onError) {
      onError(error as Error);
    } else {
      Alert.alert('Error', 'Failed to export visitor history. Please try again.');
    }
  }
};

const generateHTML = (visitors: Visit[], title: string): string => {
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedVisits = visitors.map(visit => {
    const photoUrl = visit.photos?.[0]?.image_url || visit.photo_data || '';
    const checkedOut = visit.check_out_time !== null;

    return {
      ...visit,
      photoUrl,
      checkedOut,
      check_in: visit.check_in || visit.check_in_time,
      check_out: visit.check_out || visit.check_out_time,
      name: visit.visitor_name,
      email: visit.visitor_email,
      phone: visit.visitor_phone,
    };
  });

  const cardHTML = formattedVisits.map((visitor) => {
    const checkInTime = visitor.check_in
      ? new Date(visitor.check_in).toLocaleString()
      : 'N/A';

    const status = visitor.checkedOut ? 'Checked Out' : 'Active';

    return `
      <div class="card">
        <div class="card-header">
          ${visitor.photoUrl ? 
            `<img src="${visitor.photoUrl}" alt="${visitor.name}" class="profile-pic">` : 
            '<div class="profile-placeholder"></div>'
          }
          <div class="visitor-info">
            <h3>${visitor.name || 'N/A'}</h3>
            <p>${visitor.email || 'N/A'}</p>
            <p>${visitor.phone || 'N/A'}</p>
          </div>
        </div>
        <div class="card-body">
          <p><strong>Purpose:</strong> ${visitor.purpose || 'N/A'}</p>
          <p><strong>Check-in:</strong> ${checkInTime}</p>
          <p><strong>Status:</strong> <span class="status-${status.toLowerCase().replace(' ', '-')}">${status}</span></p>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #2c3e50;
          padding-bottom: 10px;
        }
        .meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 14px;
          color: #666;
        }
        .card {
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 15px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .card-header {
          display: flex;
          align-items: center;
          padding: 15px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #eee;
        }
        .profile-pic {
          width: 60px;
          height: 60px;
          border-radius: 30px;
          object-fit: cover;
          margin-right: 15px;
        }
        .profile-placeholder {
          width: 60px;
          height: 60px;
          border-radius: 30px;
          background-color: #e9ecef;
          margin-right: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
          font-size: 24px;
        }
        .visitor-info {
          flex: 1;
        }
        .visitor-info h3 {
          margin: 0 0 5px 0;
          color: #2c3e50;
        }
        .visitor-info p {
          margin: 2px 0;
          color: #6c757d;
          font-size: 14px;
        }
        .card-body {
          padding: 15px;
        }
        .card-body p {
          margin: 5px 0;
        }
        .status-active {
          color: #28a745;
          font-weight: bold;
        }
        .status-checked-out {
          color: #6c757d;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
      </div>
      
      <div class="meta">
        <div>Total Visitors: ${visitors.length}</div>
        <div>Exported: ${formattedDate}</div>
      </div>
      
      ${cardHTML}
      
      <div class="footer">
        <p>Generated by ThorSignia Visitor Management System</p>
      </div>
    </body>
    </html>
  `;
};

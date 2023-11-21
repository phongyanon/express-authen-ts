import fs from 'fs';
import { resolve } from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { google } = require('googleapis');

// Downloaded from while creating credentials of service account
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];


/**
 * Browse the link below to see the complete object returned for folder/file creation and search
 *
 * @link https://developers.google.com/drive/api/v3/reference/files#resource
 */

export class GoogleDriveService {
  driveClient: any;
  private client_email;
  private private_key;

  public constructor(client_email: string, private_key: string) {
    this.client_email = client_email;
    this.private_key = private_key;
    // this.driveClient = this.createDriveClient(clientId, clientSecret, redirectUri, refreshToken);
  }

  public authorize = async() => {
    const jwtClient = new google.auth.JWT(
      this.client_email,
      undefined,
      this.private_key,
      SCOPES
    )
    await jwtClient.authorize();
    this.driveClient = jwtClient;
    // return jwtClient;
  }

  public uploadFile = (fileName: string, filePath: string) => {
    return new Promise( async resolve => {
      try {
        const drive = google.drive({ version: 'v3', auth: this.driveClient });
  
        const file = await drive.files.create({
          media: {
            body: fs.createReadStream(filePath),
          },
          fields: 'id',
          requestBody: {
            name: fileName,
            parents: ['1jMLLsVLlALt_q_hB3dzhGfkCYLDgVT0X']
          },
        });
        if ((file.status === 200) && (file.statusText === 'OK')) {
          // image link: https://drive.google.com/uc?export=view&id=[file.data.id]
          resolve({success: true, message: 'success', data: file.data.id});
        }
        else {
          resolve({success: false, message: 'Upload: error while upload'})
        }
      } catch (err) {
        resolve({success: false, message: `Upload: ${err}` });
      }
    });
  }
}
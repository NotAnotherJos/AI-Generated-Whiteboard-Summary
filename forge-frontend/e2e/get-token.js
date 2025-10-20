import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'e2e', 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'e2e', 'credentials.json');

async function authorize() {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const credentials = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(TOKEN_PATH)) {
    oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));
    return oAuth2Client;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Open in broswer to open the URL in the browser: ', authUrl);

  process.stdin.resume();
  process.stdout.write('Enter the veryfy code: ');
  process.stdin.on('data', async (code) => {
    const { tokens } = await oAuth2Client.getToken(code.toString().trim());
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log('Token saved to', TOKEN_PATH);
    process.exit();
  });
}

authorize();

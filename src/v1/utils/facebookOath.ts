import queryString from 'query-string';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const stringifiedParams = queryString.stringify({
  client_id: process.env.FACEBOOK_APPID,
  redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
  scope: ['email', 'user_friends'].join(','), // comma seperated string
  response_type: 'code',
  auth_type: 'rerequest',
  display: 'popup',
});

export const facebookLoginUrl = `https://www.facebook.com/v18.0/dialog/oauth?${stringifiedParams}`;

export async function getAccessTokenFromCode(code: string) {
  const { data } = await axios({
    url: 'https://graph.facebook.com/v18.0/oauth/access_token',
    method: 'get',
    params: {
      client_id: process.env.FACEBOOK_APPID,
      client_secret: process.env.FACEBOOK_SECRET,
      redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
      code,
    },
  });
  // console.log(data); // { access_token, token_type, expires_in }
  return data.access_token;
};
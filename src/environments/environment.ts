export const environment = {
  production: false,
  apiUrl: 'http://localhost/',
  azure: {
    clientId: 'a9d996f0-0460-4707-92f3-753372e57dbc',
    authority: 'https://login.microsoftonline.com/9476a667-1a5a-4cbd-8571-a0e5080b330d/discovery/v2.0/keys',
    redirectUri: 'http://localhost:4200',
    scopes: ['api://a9d996f0-0460-4707-92f3-753372e57dbc/IRIS_GED_front_end']
  }
};


// export const environment = {
//   production: true,
//   apiUrl: 'https://irisged.creaba.org.br/api/',
//   azure: {
//     clientId: 'a9d996f0-0460-4707-92f3-753372e57dbc',
//     authority: 'https://login.microsoftonline.com/9476a667-1a5a-4cbd-8571-a0e5080b330d/discovery/v2.0/keys',
//     redirectUri: 'https://irisged.creaba.org.br',
//     scopes: ['api://a9d996f0-0460-4707-92f3-753372e57dbc/IRIS_GED_front_end']
//   }
// };
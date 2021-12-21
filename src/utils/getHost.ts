import variables from 'config/variables';

export default (host: string) =>
  variables.env === 'development' ? `localhost:${variables.port}` : host;

import {
  createApplicationName,
  getApplicationNameValue,
} from '@shadow/shared/domain/applicationName';

export const getApplicationTitle = (): string => {
  const applicationName = createApplicationName('Shadow');
  return `${getApplicationNameValue(applicationName)} Configuration Server`;
};

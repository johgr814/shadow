interface ApplicationName {
  readonly value: string;
}

export const createApplicationName = (value: string): ApplicationName => {
  if (value.length === 0) {
    throw new Error('Application name must not be empty.');
  }

  return {
    value,
  };
};

export const getApplicationNameValue = (
  applicationName: ApplicationName,
): string => {
  return applicationName.value;
};

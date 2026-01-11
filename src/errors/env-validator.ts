import { IsNotEmpty, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Logger } from '@nestjs/common';

const logger = new Logger('env-validator.ts');

class EnvironmentVariables {
  @IsNotEmpty()
  TRANSPORT_PORT: string;

  @IsNotEmpty()
  TRANSPORT_HOST: string;

  @IsNotEmpty()
  DATABASE_URL: string;
}

export function envValidate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    logger.error(errors.toString(), {
      ...errors.map((error) => `${Object.values(error.constraints || {}).join(', ')} | value: ${error.value}`),
    });
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

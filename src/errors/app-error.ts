import { RpcException } from '@nestjs/microservices';
import { AppErrorCode } from './app-error-code.enum';

export class AppError {
  static unprocessableEntity(message = 'Unprocessable Entity') {
    return new RpcException({ message, code: AppErrorCode.UNPROCESSABLE_ENTITY });
  }

  static badRequest(message = 'Bad Request') {
    return new RpcException({ message, code: AppErrorCode.BAD_REQUEST });
  }

  static gatewayTimeout(message = 'Gateway Timeout') {
    return new RpcException({ message, code: AppErrorCode.GATEWAY_TIMEOUT });
  }

  static notFound(message = 'Not Found') {
    return new RpcException({ message, code: AppErrorCode.NOT_FOUND });
  }

  static conflict(message = 'Conflict') {
    return new RpcException({ message, code: AppErrorCode.CONFLICT });
  }

  static forbidden(message = 'Forbidden') {
    return new RpcException({ message, code: AppErrorCode.FORBIDDEN });
  }

  static tooManyRequests(message = 'Too Many Requests') {
    return new RpcException({ message, code: AppErrorCode.TOO_MANY_REQUESTS });
  }

  static preconditionFailed(message = 'Precondition Failed') {
    return new RpcException({ message, code: AppErrorCode.PRECONDITION_FAILED });
  }

  static requestTimeout(message = 'Request Timeout') {
    return new RpcException({ message, code: AppErrorCode.REQUEST_TIMEOUT });
  }

  static outOfRange(message = 'Out of Range') {
    return new RpcException({ message, code: AppErrorCode.OUT_OF_RANGE });
  }

  static notImplemented(message = 'Not Implemented') {
    return new RpcException({ message, code: AppErrorCode.NOT_IMPLEMENTED });
  }

  static unauthorized(message = 'Unauthorized') {
    return new RpcException({ message, code: AppErrorCode.UNAUTHORIZED });
  }

  static serviceUnavailable(message = 'Service Unavailable') {
    return new RpcException({ message, code: AppErrorCode.SERVICE_UNAVAILABLE });
  }

  static internalServerError(message = 'Internal Server Error') {
    return new RpcException({ message, code: AppErrorCode.INTERNAL });
  }
}

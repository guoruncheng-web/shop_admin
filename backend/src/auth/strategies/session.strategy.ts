import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class SessionStrategy extends PassportStrategy(class {}, 'session') {
  authenticate() {
    // TODO: 实现Session认证策略
    return null;
  }
}

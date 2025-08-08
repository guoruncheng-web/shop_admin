import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class SessionStrategy extends PassportStrategy(class {}, 'session') {
  async validate(payload: any) {
    // TODO: 实现Session认证策略
    return payload;
  }
}

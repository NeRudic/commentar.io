import { Module } from '@nestjs/common';
import { OnlineGateway } from './online.gateway';

@Module({
  providers: [OnlineGateway],
})
export class OnlineModule {}



import { Module } from '@nestjs/common'
import { PoliciesController } from './Policies.controller'

@Module({
  controllers: [PoliciesController],
})
export class PoliciesModule {}
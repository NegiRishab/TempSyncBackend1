import { Module } from "@nestjs/common";
import { UtilitiesServices } from "./utils.services";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [JwtModule],
  controllers: [],
  providers: [UtilitiesServices],
  exports: [UtilitiesServices],
})
export class UtilsModule {}

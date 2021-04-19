import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Meter } from "./entities/meter.entity";

@Injectable()
export class MetersService {
  constructor(
    @InjectRepository(Meter) private metersRepository: Repository<Meter>
  ) {}

  async create() {
    return this.metersRepository.save({});
  }

  async delete(id: number) {
    return this.metersRepository.delete(id);
  }

  async findById(id: number) {
    return this.metersRepository.findOneOrFail(id);
  }
}

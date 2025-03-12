import { ILike, Repository } from "typeorm";
import { Partner } from "../entities/Partner";
import { AppDataSource } from "../config/datasource";

export class PartnerService {
  private partnerRepository: Repository<Partner>

  constructor() {
    this.partnerRepository = AppDataSource.getRepository(Partner)
  }

  async createPartner(data: Partial<Partner>) {
    const partner = this.partnerRepository.create(data)
    return await this.partnerRepository.save(partner)
  }

  async getAllPartners() {
    const [partners, total] = await this.partnerRepository.findAndCount({
      relations: ['suppliedBatches', 'transactions']
    })
    return { partners, total }
  }

  async getPartners(page?: number, pageSize?: number): Promise<{ partners: Partner[], total: number }> {
    if (page && pageSize) {
      const [partners, total] = await this.partnerRepository.findAndCount({
        skip: (page - 1) * pageSize,
        take: pageSize,
        relations: ['suppliedBatches', 'transactions']
      });

      return { partners, total };
    } else {
      const [partners, total] = await this.partnerRepository.findAndCount({
        relations: ['suppliedBatches', 'transactions']
      })
      return { partners, total };
    }
  }

  async searchPartners(query?: string, role?: string, page: number = 1, pageSize: number = 10): Promise<{ partners: Partner[], total: number }> {
    const whereClause: any = [];

    if (query) {
      whereClause.push(
        { id: ILike(`%${query}%`) },
        { name: ILike(`%${query}%`) }
      );
    }

    if (role) {
      whereClause.push({ role });
    }

    const [partners, total] = await this.partnerRepository.findAndCount({
      where: query && role ? { role, ...whereClause } : whereClause.length > 0 ? whereClause : undefined,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { partners, total };
  }

  async getPartnerById(id: number) {
    const partner = await this.partnerRepository.findOne({
      where: { id },
      relations: ['suppliedBatches', 'transactions']
    })
    return partner
  }

  async updatePartner(id: number, data: Partial<Partner>) {
    const partner = await this.getPartnerById(id);
    if (!partner) return null;

    Object.assign(partner, data);
    return await this.partnerRepository.save(partner);
  }

  async deletePartner(id: number): Promise<boolean> {
    const result = await this.partnerRepository.delete(id);
    return result.affected !== 0;
  }
}
export class MarketRepository {
  async create(data: any) {
    // TODO: Insert into DB
    return { id: "mk_1", ...data };
  }
  
  async findById(id: string) {
    // TODO: Query DB
    return null;
  }
  
  async findAll(limit: number) {
    // TODO: Query DB
    return [];
  }
}

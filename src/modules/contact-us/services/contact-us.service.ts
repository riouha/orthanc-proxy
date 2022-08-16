import { dbConnection } from "../../../app/db/db";
import { ContactUs } from "../entities/contact-us.entity";
import { ContactUsDto } from "../dtos/contact-us.dto";
import { SearchDto } from "../../../common/serach.dto";

export class ContactUsService {
  contactusRepo = dbConnection.datasource.getRepository(ContactUs);

  async addContactUs(dto: ContactUsDto) {
    const contactus = this.contactusRepo.create(dto);
    return this.contactusRepo.save(contactus);
  }

  async searchContactUs(filters: SearchDto) {
    const result = await this.contactusRepo.findAndCount({
      order: { createDate: "DESC" },
      ...(filters.offset && { skip: filters.offset }),
      ...(filters.limit && { take: filters.limit }),
    });
    return { count: result[1], messages: result[0] };
  }
}

export const contactusSevice = new ContactUsService();

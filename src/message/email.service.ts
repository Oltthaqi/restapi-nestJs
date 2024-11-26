import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, SendMailOptions, Transporter } from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private mailTransport: Transporter;

  constructor(private configService: ConfigService) {
    this.mailTransport = createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: Number(this.configService.get('MAIL_PORT')),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendEmail(data: SendEmailDto): Promise<{ success: boolean } | null> {
    const { sender, recipients, subject, html, text } = data;

    const mailOptions: SendMailOptions = {
      from: sender ?? {
        name: this.configService.get('MAIL_SENDER_NAME_DEFAULT'),
        address: this.configService.get('MAIL_SENDER_DEFAULT'),
      },
      to: recipients,
      subject,
      html,
      text,
    };

    try {
      await this.mailTransport.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.log(error);

      return null;
    }
  }
}

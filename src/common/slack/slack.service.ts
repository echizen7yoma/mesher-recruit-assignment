import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SlackService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private readonly slackWebhookUrl =
    this.configService.get<string>('WEBHOOK_URL');
  async sendMessage(message: string): Promise<void> {
    try {
      const response: AxiosResponse = await this.httpService
        .post(this.slackWebhookUrl, { text: message })
        .toPromise();
      console.log(`Slack Response: ${response.data}`);
    } catch (error) {
      console.error(`Error sending message to Slack: ${error.message}`);
    }
  }

  async sendApiErrorMessage(message: string): Promise<void> {
    try {
      const response: AxiosResponse = await this.httpService
        .post(this.slackWebhookUrl, { text: `API ERROR \n ${message}` })
        .toPromise();
      console.log(`Slack Response: ${response.data}`);
    } catch (error) {
      console.error(`Error sending message to Slack: ${error.message}`);
    }
  }
}

import axios from 'axios';

export interface WebhookPayload {
  title: string;
  description: string;
  color?: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  timestamp?: string;
}

export interface TelegramPayload {
  chat_id: string;
  text: string;
  parse_mode?: 'Markdown' | 'HTML';
}

export class NotificationService {
  private discordWebhookUrl: string;
  private telegramBotToken: string;
  private telegramChatId: string;

  constructor() {
    this.discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
    this.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID || '';
  }

  async sendDiscord(payload: WebhookPayload): Promise<boolean> {
    if (!this.discordWebhookUrl) {
      console.warn('Discord webhook URL not configured');
      return false;
    }

    try {
      const discordPayload = {
        embeds: [
          {
            title: payload.title,
            description: payload.description,
            color: payload.color || 0x00ff00,
            fields: payload.fields,
            timestamp: payload.timestamp || new Date().toISOString(),
          },
        ],
      };

      await axios.post(this.discordWebhookUrl, discordPayload);
      console.log('✅ Discord notification sent');
      return true;
    } catch (error: any) {
      console.error('❌ Failed to send Discord notification:', error.message);
      return false;
    }
  }

  async sendTelegram(text: string): Promise<boolean> {
    if (!this.telegramBotToken || !this.telegramChatId) {
      console.warn('Telegram credentials not configured');
      return false;
    }

    try {
      const payload: TelegramPayload = {
        chat_id: this.telegramChatId,
        text,
        parse_mode: 'Markdown',
      };

      const url = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;
      await axios.post(url, payload);
      console.log('✅ Telegram notification sent');
      return true;
    } catch (error: any) {
      console.error('❌ Failed to send Telegram notification:', error.message);
      return false;
    }
  }

  async notifyProposalCreated(
    proposalId: string,
    type: string,
    amount: string,
    reason: string
  ): Promise<void> {
    const title = '📝 New Proposal Created';
    const description = `A new ${type} proposal has been created.`;
    const fields = [
      { name: 'Proposal ID', value: proposalId, inline: true },
      { name: 'Type', value: type, inline: true },
      { name: 'Amount', value: amount, inline: true },
      { name: 'Reason', value: reason, inline: false },
    ];

    const discordPayload: WebhookPayload = {
      title,
      description,
      fields,
      color: 0x3498db, // Blue
    };

    const telegramText = `*${title}*\n\n` +
      `*ID:* ${proposalId}\n` +
      `*Type:* ${type}\n` +
      `*Amount:* ${amount}\n` +
      `*Reason:* ${reason}`;

    await Promise.all([
      this.sendDiscord(discordPayload),
      this.sendTelegram(telegramText),
    ]);
  }

  async notifyProposalExecuted(
    proposalId: string,
    status: 'success' | 'failed',
    txHash?: string
  ): Promise<void> {
    const isSuccess = status === 'success';
    const title = isSuccess ? '✅ Proposal Executed' : '❌ Proposal Failed';
    const description = `Proposal ${proposalId} has been ${status}.`;
    const color = isSuccess ? 0x00ff00 : 0xff0000; // Green or Red

    const fields = [
      { name: 'Proposal ID', value: proposalId, inline: true },
      { name: 'Status', value: status, inline: true },
    ];

    if (txHash) {
      fields.push({
        name: 'Transaction',
        value: `[View on Explorer](${txHash})`,
        inline: false,
      });
    }

    const discordPayload: WebhookPayload = {
      title,
      description,
      fields,
      color,
    };

    const telegramText = `*${title}*\n\n` +
      `*ID:* ${proposalId}\n` +
      `*Status:* ${status}${txHash ? `\n*TX:* [View](${txHash})` : ''}`;

    await Promise.all([
      this.sendDiscord(discordPayload),
      this.sendTelegram(telegramText),
    ]);
  }

  async notifySystemError(error: string, context?: string): Promise<void> {
    const title = '🚨 System Error';
    const description = `An error has occurred in the system.`;
    const fields = [
      { name: 'Error', value: error, inline: false },
    ];

    if (context) {
      fields.push({ name: 'Context', value: context, inline: false });
    }

    const discordPayload: WebhookPayload = {
      title,
      description,
      fields,
      color: 0xff0000, // Red
    };

    const telegramText = `*${title}*\n\n` +
      `*Error:* ${error}\n` +
      (context ? `*Context:* ${context}` : '');

    await Promise.all([
      this.sendDiscord(discordPayload),
      this.sendTelegram(telegramText),
    ]);
  }

  async notifyRebalanceNeeded(
    token: string,
    currentAllocation: number,
    targetAllocation: number,
    deviation: number
  ): Promise<void> {
    const title = '⚖️ Rebalance Needed';
    const description = `Allocation deviation detected for ${token}.`;
    const fields = [
      { name: 'Token', value: token, inline: true },
      { name: 'Current', value: `${currentAllocation}%`, inline: true },
      { name: 'Target', value: `${targetAllocation}%`, inline: true },
      { name: 'Deviation', value: `${deviation}%`, inline: true },
    ];

    const discordPayload: WebhookPayload = {
      title,
      description,
      fields,
      color: 0xffaa00, // Orange
    };

    const telegramText = `*${title}*\n\n` +
      `*Token:* ${token}\n` +
      `*Current:* ${currentAllocation}%\n` +
      `*Target:* ${targetAllocation}%\n` +
      `*Deviation:* ${deviation}%`;

    await Promise.all([
      this.sendDiscord(discordPayload),
      this.sendTelegram(telegramText),
    ]);
  }
}
